import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { D1Database } from '@cloudflare/workers-types';
import { app } from '../src/index';
import type { Env } from '../src/middleware/auth';
import { MonitoringDispatcher } from '../src/services/monitoring/dispatcher';
import { NotificationDispatcher } from '../src/services/notification/dispatcher';

// Enable controlled local test probing
process.env.JOBWHISTLE_TEST_ALLOW_LOCALHOST = 'true';

// ---------------------------------------------------------------------------
// Mock D1 Database wrapping Node 24 native SQLite (DatabaseSync)
// ---------------------------------------------------------------------------
function createMockD1(db: DatabaseSync): D1Database {
  return {
    prepare(sql: string) {
      return {
        bind(...values: any[]) {
          return {
            async all() {
              const stmt = db.prepare(sql);
              const rows = stmt.all(...values);
              return { results: rows, success: true };
            },
            async first(col?: string) {
              const stmt = db.prepare(sql);
              const row: any = stmt.get(...values);
              if (!row) return null;
              return col ? row[col] : row;
            },
            async run() {
              const stmt = db.prepare(sql);
              const info = stmt.run(...values);
              return { success: true, meta: { changes: info.changes } };
            },
            async raw() {
              const stmt = db.prepare(sql);
              const rows = stmt.all(...values);
              return rows.map((r: any) => Object.values(r));
            },
          };
        },
      } as any;
    },
    async exec(sql: string) {
      db.exec(sql);
      return { count: 1, duration: 0 };
    },
    async batch(statements: any[]) {
      const results = [];
      for (const stmt of statements) {
        results.push(await stmt.run());
      }
      return results;
    },
    async dump() {
      return new ArrayBuffer(0);
    },
  } as unknown as D1Database;
}

describe('Jobwhistle End-to-End Product Integration Suite', () => {
  let rawDb: DatabaseSync;
  let mockD1: D1Database;
  let testServer: http.Server;
  let testPort: number;
  let serverStatusCode = 200;
  let env: Env;

  // Helper for executing typed HTTP requests against the Hono app
  async function api(
    route: string,
    options: {
      method?: string;
      body?: any;
      token?: string;
      headers?: Record<string, string>;
    } = {}
  ) {
    const { method = 'GET', body, token, headers = {} } = options;
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (token) {
      reqHeaders.Authorization = `Bearer ${token}`;
    }

    const res = await app.request(
      route,
      {
        method,
        headers: reqHeaders,
        body: body ? JSON.stringify(body) : undefined,
      },
      env
    );

    const json = await res.json().catch(() => null);
    return { status: res.status, body: json };
  }

  before(async () => {
    // 1. Initialize in-memory SQLite schema
    rawDb = new DatabaseSync(':memory:');
    const migrationPath = path.resolve(__dirname, '../drizzle/0000_messy_jane_foster.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const statements = sql
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      rawDb.exec(stmt);
    }

    mockD1 = createMockD1(rawDb);
    env = {
      DB: mockD1,
      APP_ENV: 'test',
      APP_URL: 'http://localhost:8787',
      WEB_ORIGIN: 'http://localhost:3000',
      CRON_SECRET: 'whistle_cron_test_secret_9988',
    };

    // 2. Start live HTTP test server for probe targets
    await new Promise<void>((resolve) => {
      testServer = http.createServer((req, res) => {
        res.writeHead(serverStatusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: serverStatusCode === 200 ? 'ok' : 'error' }));
      });

      testServer.listen(0, '127.0.0.1', () => {
        const addr = testServer.address() as any;
        testPort = addr.port;
        resolve();
      });
    });
  });

  after(() => {
    testServer.close();
  });

  // ---------------------------------------------------------------------------
  // WORKFLOW A: HTTP Monitoring Lifecycle
  // ---------------------------------------------------------------------------
  describe('Workflow A — HTTP Monitoring & Incident Recovery Lifecycle', () => {
    let userToken: string;
    let monitorId: string;
    const targetUrl = () => `http://127.0.0.1:${testPort}/health`;

    it('registers user and creates workspace', async () => {
      const res = await api('/api/v1/auth/register', {
        method: 'POST',
        body: {
          name: 'Alice Engineer',
          email: 'alice@company.test',
          password: 'SecurePassword123!',
          workspaceName: 'Production Ops',
        },
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.token);
      assert.strictEqual(res.body.data.user.email, 'alice@company.test');
      userToken = res.body.data.token;
    });

    it('creates an HTTP monitor and executes initial check', async () => {
      serverStatusCode = 200;
      const res = await api('/api/v1/monitors', {
        method: 'POST',
        token: userToken,
        body: {
          name: 'Core Health API',
          url: targetUrl(),
          method: 'GET',
          intervalMinutes: 5,
          timeoutSeconds: 5,
          expectedStatusCode: 200,
          active: true,
        },
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.status, 'up');
      assert.strictEqual(res.body.data.consecutiveFailures, 0);
      monitorId = res.body.data.id;
    });

    it('verifies monitor telemetry and recorded checks', async () => {
      const res = await api(`/api/v1/monitors/${monitorId}`, {
        method: 'GET',
        token: userToken,
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.status, 'up');
      assert.ok(Array.isArray(res.body.data.recentChecks));
      assert.strictEqual(res.body.data.recentChecks.length, 1);
      assert.strictEqual(res.body.data.recentChecks[0].statusCode, 200);
      assert.strictEqual(res.body.data.recentChecks[0].isUp, true);
      assert.ok(res.body.data.recentChecks[0].responseTimeMs >= 0);
    });

    it('simulates 1st failure: enters suspected incident state', async () => {
      serverStatusCode = 500; // Failure!

      const res = await api(`/api/v1/monitors/${monitorId}/check-now`, {
        method: 'POST',
        token: userToken,
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.latestCheck.isUp, false);
      assert.strictEqual(res.body.data.latestCheck.statusCode, 500);

      // Verify monitor status is degraded and consecutiveFailures is 1
      const monRes = await api(`/api/v1/monitors/${monitorId}`, {
        token: userToken,
      });
      assert.strictEqual(monRes.body.data.status, 'degraded');
      assert.strictEqual(monRes.body.data.consecutiveFailures, 1);

      // Check incident record: suspected state
      const incRes = await api('/api/v1/incidents', { token: userToken });
      assert.strictEqual(incRes.body.data.length, 1);
      assert.strictEqual(incRes.body.data[0].state, 'suspected');
    });

    it('simulates 2nd failure: confirms open incident', async () => {
      serverStatusCode = 500;

      await api(`/api/v1/monitors/${monitorId}/check-now`, {
        method: 'POST',
        token: userToken,
      });

      const monRes = await api(`/api/v1/monitors/${monitorId}`, {
        token: userToken,
      });
      assert.strictEqual(monRes.body.data.consecutiveFailures, 2);

      // Verify incident is now confirmed 'open'
      const incRes = await api('/api/v1/incidents', { token: userToken });
      assert.strictEqual(incRes.body.data.length, 1);
      assert.strictEqual(incRes.body.data[0].state, 'open');
      assert.ok(incRes.body.data[0].confirmedAt);
    });

    it('restores endpoint and confirms automatic recovery', async () => {
      serverStatusCode = 200; // Service restored!

      await api(`/api/v1/monitors/${monitorId}/check-now`, {
        method: 'POST',
        token: userToken,
      });

      const monRes = await api(`/api/v1/monitors/${monitorId}`, {
        token: userToken,
      });
      assert.strictEqual(monRes.body.data.status, 'up');
      assert.strictEqual(monRes.body.data.consecutiveFailures, 0);

      // Verify incident is resolved with recorded duration
      const incRes = await api('/api/v1/incidents', { token: userToken });
      assert.strictEqual(incRes.body.data.length, 1);
      assert.strictEqual(incRes.body.data[0].state, 'resolved');
      assert.ok(incRes.body.data[0].resolvedAt);
      assert.ok(incRes.body.data[0].durationSeconds >= 0);
    });

    it('pauses and resumes monitor lifecycle correctly', async () => {
      // Pause
      const pauseRes = await api(`/api/v1/monitors/${monitorId}/pause`, {
        method: 'POST',
        token: userToken,
      });
      assert.strictEqual(pauseRes.status, 200);
      assert.strictEqual(pauseRes.body.data.active, false);
      assert.strictEqual(pauseRes.body.data.status, 'paused');

      // Resume
      const resumeRes = await api(`/api/v1/monitors/${monitorId}/resume`, {
        method: 'POST',
        token: userToken,
      });
      assert.strictEqual(resumeRes.status, 200);
      assert.strictEqual(resumeRes.body.data.active, true);
    });
  });

  // ---------------------------------------------------------------------------
  // WORKFLOW B: Heartbeat Monitoring Lifecycle
  // ---------------------------------------------------------------------------
  describe('Workflow B — Heartbeat Monitoring & Missed Check-in Lifecycle', () => {
    let userToken: string;
    let heartbeatId: string;
    let checkInToken: string;

    before(async () => {
      const res = await api('/api/v1/auth/login', {
        method: 'POST',
        body: {
          email: 'alice@company.test',
          password: 'SecurePassword123!',
        },
      });
      userToken = res.body.data.token;
    });

    it('creates a heartbeat monitor and returns secret token once', async () => {
      const res = await api('/api/v1/heartbeats', {
        method: 'POST',
        token: userToken,
        body: {
          name: 'Nightly Database Backup',
          expectedIntervalMinutes: 60,
          gracePeriodMinutes: 15,
          active: true,
        },
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.status, 'pending');
      assert.ok(res.body.data.token);
      assert.ok(res.body.data.checkInUrl);
      heartbeatId = res.body.data.id;
      checkInToken = res.body.data.token;
    });

    it('submits a successful HTTP check-in via public check-in endpoint', async () => {
      const res = await api(`/api/v1/heartbeats/check-in/${checkInToken}`, {
        method: 'GET',
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.status, 'ok');

      // Verify heartbeat transitioned to 'up' and check-in was logged
      const hbRes = await api(`/api/v1/heartbeats/${heartbeatId}`, {
        token: userToken,
      });
      assert.strictEqual(hbRes.status, 200);
      assert.strictEqual(hbRes.body.data.status, 'up');
      assert.strictEqual(hbRes.body.data.recentCheckIns.length, 1);
    });

    it('detects missed heartbeat after deadline expiration and opens incident', async () => {
      // Fast-forward deadline into the past (2 hours ago)
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      rawDb.exec(
        `UPDATE heartbeat_tokens SET deadline_at = '${pastDate}' WHERE id = '${heartbeatId}'`
      );

      // Run dispatcher cycle
      const dispatcher = new MonitoringDispatcher();
      const missedResult = await dispatcher.processMissedHeartbeats(env.DB, 10);
      assert.strictEqual(missedResult.missed, 1);

      // Verify heartbeat is marked 'down'
      const hbRes = await api(`/api/v1/heartbeats/${heartbeatId}`, {
        token: userToken,
      });
      assert.strictEqual(hbRes.body.data.status, 'down');

      // Verify incident opened for missed heartbeat
      const incRes = await api('/api/v1/incidents', { token: userToken });
      const missedInc = incRes.body.data.find(
        (i: any) => i.targetId === heartbeatId && i.state === 'open'
      );
      assert.ok(missedInc, 'Expected open incident for missed heartbeat');
    });

    it('recovers heartbeat upon receiving new check-in and resolves incident', async () => {
      const res = await api(`/api/v1/heartbeats/check-in/${checkInToken}`, {
        method: 'POST',
      });
      assert.strictEqual(res.status, 200);

      const hbRes = await api(`/api/v1/heartbeats/${heartbeatId}`, {
        token: userToken,
      });
      assert.strictEqual(hbRes.body.data.status, 'up');

      // Verify incident is resolved
      const incRes = await api('/api/v1/incidents', { token: userToken });
      const resolvedInc = incRes.body.data.find(
        (i: any) => i.targetId === heartbeatId && i.state === 'resolved'
      );
      assert.ok(resolvedInc, 'Expected incident to be resolved');
    });

    it('rotates secret token and invalidates old token', async () => {
      const rotateRes = await api(`/api/v1/heartbeats/${heartbeatId}/rotate-token`, {
        method: 'POST',
        token: userToken,
      });

      assert.strictEqual(rotateRes.status, 200);
      assert.ok(rotateRes.body.data.token);
      const newToken = rotateRes.body.data.token;
      assert.notStrictEqual(newToken, checkInToken);

      // Old token must fail
      const oldRes = await api(`/api/v1/heartbeats/check-in/${checkInToken}`, {
        method: 'GET',
      });
      assert.strictEqual(oldRes.status, 404);

      // New token must succeed
      const newCheckRes = await api(`/api/v1/heartbeats/check-in/${newToken}`, {
        method: 'GET',
      });
      assert.strictEqual(newCheckRes.status, 200);
    });
  });

  // ---------------------------------------------------------------------------
  // WORKFLOW C: Multi-Tenant Workspace Security & IDOR Isolation
  // ---------------------------------------------------------------------------
  describe('Workflow C — Multi-Tenant Workspace Security & IDOR Isolation', () => {
    let tokenUser1: string;
    let tokenUser2: string;
    let monitorUser1Id: string;
    let heartbeatUser1Id: string;

    before(async () => {
      // User 1
      const res1 = await api('/api/v1/auth/register', {
        method: 'POST',
        body: {
          name: 'Tenant One',
          email: 'tenant1@isolated.test',
          password: 'Password123!',
          workspaceName: 'Workspace Alpha',
        },
      });
      tokenUser1 = res1.body.data.token;

      // User 2
      const res2 = await api('/api/v1/auth/register', {
        method: 'POST',
        body: {
          name: 'Tenant Two',
          email: 'tenant2@isolated.test',
          password: 'Password123!',
          workspaceName: 'Workspace Beta',
        },
      });
      tokenUser2 = res2.body.data.token;

      // User 1 creates a monitor and heartbeat
      const mRes = await api('/api/v1/monitors', {
        method: 'POST',
        token: tokenUser1,
        body: {
          name: 'Alpha Internal Monitor',
          url: `http://127.0.0.1:${testPort}/health`,
          method: 'GET',
          intervalMinutes: 5,
          timeoutSeconds: 5,
          expectedStatusCode: 200,
          active: true,
        },
      });
      monitorUser1Id = mRes.body.data.id;

      const hbRes = await api('/api/v1/heartbeats', {
        method: 'POST',
        token: tokenUser1,
        body: {
          name: 'Alpha Internal Cron',
          expectedIntervalMinutes: 60,
          gracePeriodMinutes: 15,
          active: true,
        },
      });
      heartbeatUser1Id = hbRes.body.data.id;
    });

    it('rejects User 2 attempting to view User 1 monitor with 404', async () => {
      const res = await api(`/api/v1/monitors/${monitorUser1Id}`, {
        token: tokenUser2,
      });
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
    });

    it('rejects User 2 attempting to modify User 1 monitor with 404', async () => {
      const res = await api(`/api/v1/monitors/${monitorUser1Id}`, {
        method: 'PATCH',
        token: tokenUser2,
        body: { name: 'Hacked Name' },
      });
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
    });

    it('rejects User 2 attempting to pause User 1 monitor with 404', async () => {
      const res = await api(`/api/v1/monitors/${monitorUser1Id}/pause`, {
        method: 'POST',
        token: tokenUser2,
      });
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
    });

    it('rejects User 2 attempting to delete User 1 monitor with 404', async () => {
      const res = await api(`/api/v1/monitors/${monitorUser1Id}`, {
        method: 'DELETE',
        token: tokenUser2,
      });
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
    });

    it('rejects User 2 attempting to view or rotate User 1 heartbeat with 404', async () => {
      const viewRes = await api(`/api/v1/heartbeats/${heartbeatUser1Id}`, {
        token: tokenUser2,
      });
      assert.strictEqual(viewRes.status, 404);

      const rotateRes = await api(`/api/v1/heartbeats/${heartbeatUser1Id}/rotate-token`, {
        method: 'POST',
        token: tokenUser2,
      });
      assert.strictEqual(rotateRes.status, 404);
    });

    it('verifies User 2 overview strictly contains zero resources from User 1', async () => {
      const res = await api('/api/v1/overview', {
        token: tokenUser2,
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.data.metrics.totalMonitors, 0);
      assert.strictEqual(res.body.data.metrics.totalHeartbeats, 0);
      assert.strictEqual(res.body.data.monitors.length, 0);
      assert.strictEqual(res.body.data.heartbeats.length, 0);
    });
  });

  // ---------------------------------------------------------------------------
  // WORKFLOW D: Notification Reliability & Deduplication
  // ---------------------------------------------------------------------------
  describe('Workflow D — Notification Reliability & Event Deduplication', () => {
    let userToken: string;
    let workspaceId: string;
    let channelId: string;

    before(async () => {
      const res = await api('/api/v1/auth/register', {
        method: 'POST',
        body: {
          name: 'Notif Admin',
          email: 'notif@reliability.test',
          password: 'Password123!',
          workspaceName: 'Alerting Workspace',
        },
      });
      userToken = res.body.data.token;
      workspaceId = res.body.data.workspace.id;

      // Seed valid incident record to satisfy foreign key constraints
      const nowIso = new Date().toISOString();
      rawDb.exec(`
        INSERT INTO incidents (id, workspace_id, target_type, target_id, target_name, target_endpoint, state, failure_reason, suspected_at, confirmed_at, created_at, updated_at)
        VALUES ('inc_test_notif_100', '${workspaceId}', 'monitor', 'mon_test_1', 'Payment Gateway', 'https://pay.example.com', 'open', 'HTTP 503 Service Unavailable', '${nowIso}', '${nowIso}', '${nowIso}', '${nowIso}')
      `);
    });

    it('adds an active email notification channel', async () => {
      const res = await api('/api/v1/notifications/channels', {
        method: 'POST',
        token: userToken,
        body: {
          name: 'Primary SRE On-Call',
          provider: 'email',
          destination: 'sre-alerts@company.test',
        },
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.destination, 'sre-alerts@company.test');
      channelId = res.body.data.id;
    });

    it('dispatches incident notification and persists delivery record', async () => {
      const dispatcher = new NotificationDispatcher();
      const testIncidentId = 'inc_test_notif_100';

      await dispatcher.dispatch(env.DB, {
        workspaceId,
        incidentId: testIncidentId,
        eventType: 'monitor.down',
        targetId: 'mon_test_1',
        targetName: 'Payment Gateway',
        targetType: 'monitor',
        targetEndpoint: 'https://pay.example.com',
        reason: 'HTTP 503 Service Unavailable',
        timestamp: new Date().toISOString(),
      });

      // Query notification_deliveries table (delivered to both active channels)
      const rows = rawDb
        .prepare('SELECT * FROM notification_deliveries WHERE incident_id = ?')
        .all(testIncidentId) as any[];

      assert.strictEqual(rows.length, 2);
      assert.strictEqual(rows[0].event_type, 'monitor.down');
      assert.strictEqual(rows[0].status, 'sent');
    });

    it('suppresses duplicate alerts for the same incident and channel', async () => {
      const dispatcher = new NotificationDispatcher();
      const testIncidentId = 'inc_test_notif_100';

      // Dispatch identical event again
      await dispatcher.dispatch(env.DB, {
        workspaceId,
        incidentId: testIncidentId,
        eventType: 'monitor.down',
        targetId: 'mon_test_1',
        targetName: 'Payment Gateway',
        targetType: 'monitor',
        targetEndpoint: 'https://pay.example.com',
        reason: 'HTTP 503 Service Unavailable',
        timestamp: new Date().toISOString(),
      });

      // Must still only have 2 delivery records (1 per channel, no duplicates)
      const rows = rawDb
        .prepare('SELECT * FROM notification_deliveries WHERE incident_id = ?')
        .all(testIncidentId) as any[];

      assert.strictEqual(rows.length, 2, 'Duplicate alert should be deduplicated');
    });

    it('dispatches recovery notification when service recovers', async () => {
      const dispatcher = new NotificationDispatcher();
      const testIncidentId = 'inc_test_notif_100';

      await dispatcher.dispatch(env.DB, {
        workspaceId,
        incidentId: testIncidentId,
        eventType: 'monitor.up',
        targetId: 'mon_test_1',
        targetName: 'Payment Gateway',
        targetType: 'monitor',
        targetEndpoint: 'https://pay.example.com',
        reason: 'Service responded with HTTP 200 OK',
        timestamp: new Date().toISOString(),
      });

      const rows = rawDb
        .prepare('SELECT * FROM notification_deliveries WHERE incident_id = ? AND event_type = ?')
        .all(testIncidentId, 'monitor.up') as any[];

      assert.strictEqual(rows.length, 2);
      assert.strictEqual(rows[0].status, 'sent');
    });
  });

  // ---------------------------------------------------------------------------
  // WORKFLOW E: Cron Scheduler Authorization & Security
  // ---------------------------------------------------------------------------
  describe('Workflow E — Cron Scheduler Security & Authentication', () => {
    it('rejects unauthorized cron dispatch without secret header with 401', async () => {
      const res = await api('/api/v1/cron/dispatch', {
        method: 'POST',
      });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error.code, 'UNAUTHORIZED_CRON');
    });

    it('rejects cron dispatch with incorrect secret with 401', async () => {
      const res = await api('/api/v1/cron/dispatch', {
        method: 'POST',
        headers: {
          'X-Jobwhistle-Cron-Secret': 'wrong_secret_123',
        },
      });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    it('executes cron dispatch with valid cron secret header with 200', async () => {
      const res = await api('/api/v1/cron/dispatch', {
        method: 'POST',
        headers: {
          'X-Jobwhistle-Cron-Secret': 'whistle_cron_test_secret_9988',
        },
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.monitors);
      assert.ok(res.body.data.heartbeats);
    });
  });
});
