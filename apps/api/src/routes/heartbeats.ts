import { Hono } from 'hono';
import { eq, and, desc, count } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import {
  CreateHeartbeatSchema,
} from '@jobwhistle/contracts';
import { productLimits, brandConfig } from '@jobwhistle/config';
import { generateToken, sha256Hex, generateId } from '../security/crypto';
import { IncidentLifecycleService } from '../services/monitoring/incident-lifecycle';
import { NotificationDispatcher } from '../services/notification/dispatcher';
import { authMiddleware, type Env, type AuthContextVariables } from '../middleware/auth';

const heartbeatsApp = new Hono<{ Bindings: Env; Variables: AuthContextVariables }>();

// -------------------------------------------------------------
// PUBLIC CHECK-IN ENDPOINT (No auth required, authenticated by secret token)
// -------------------------------------------------------------
const publicCheckInHandler = async (c: any) => {
  const token = c.req.param('token');
  if (!token || typeof token !== 'string') {
    return c.json({ success: false, error: 'Token missing' }, 400);
  }

  const tokenHash = await sha256Hex(token);
  const db = drizzle(c.env.DB, { schema });

  const [heartbeat] = await db
    .select()
    .from(schema.heartbeatTokens)
    .where(eq(schema.heartbeatTokens.tokenHash, tokenHash))
    .limit(1);

  if (!heartbeat) {
    return c.json(
      { success: false, error: 'Invalid or unrecognized heartbeat token.' },
      404
    );
  }

  if (!heartbeat.active) {
    return c.json(
      { success: false, error: 'This heartbeat monitor is currently paused.' },
      400
    );
  }

  const nowIso = new Date().toISOString();
  const nextExpectedDate = new Date(
    Date.now() + heartbeat.expectedIntervalMinutes * 60 * 1000
  );
  const deadlineDate = new Date(
    nextExpectedDate.getTime() + heartbeat.gracePeriodMinutes * 60 * 1000
  );

  // 1. Record check-in
  const checkInId = generateId('hbc');
  const ipAddress = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || null;
  const userAgent = c.req.header('User-Agent') || null;

  await db.insert(schema.heartbeatCheckIns).values({
    id: checkInId,
    heartbeatId: heartbeat.id,
    receivedAt: nowIso,
    ipAddress,
    userAgent,
    durationMs: null,
  });

  // 2. If it was down, trigger recovery
  const wasDown = heartbeat.status === 'down';

  // 3. Update heartbeat deadlines
  await db
    .update(schema.heartbeatTokens)
    .set({
      status: 'up',
      lastCheckInAt: nowIso,
      nextExpectedAt: nextExpectedDate.toISOString(),
      deadlineAt: deadlineDate.toISOString(),
      updatedAt: nowIso,
    })
    .where(eq(schema.heartbeatTokens.id, heartbeat.id));

  if (wasDown) {
    const notificationDispatcher = new NotificationDispatcher(
      c.env.RESEND_API_KEY,
      c.env.EMAIL_FROM
    );
    const lifecycle = new IncidentLifecycleService(notificationDispatcher);
    await lifecycle.handleHeartbeatRecovered(c.env.DB, heartbeat);
  }

  return c.json({
    success: true,
    status: 'ok',
    message: 'Check-in recorded successfully.',
    nextExpectedAt: nextExpectedDate.toISOString(),
    deadlineAt: deadlineDate.toISOString(),
  });
};

heartbeatsApp.get('/check-in/:token', publicCheckInHandler);
heartbeatsApp.post('/check-in/:token', publicCheckInHandler);

// -------------------------------------------------------------
// AUTHENTICATED WORKSPACE ROUTES
// -------------------------------------------------------------

// GET / - List heartbeats for workspace
heartbeatsApp.get('/', authMiddleware, async (c) => {
  const workspace = c.get('workspace');
  const db = drizzle(c.env.DB, { schema });

  const records = await db
    .select()
    .from(schema.heartbeatTokens)
    .where(eq(schema.heartbeatTokens.workspaceId, workspace.id))
    .orderBy(desc(schema.heartbeatTokens.createdAt));

  return c.json({
    success: true,
    data: records,
  });
});

// POST / - Create new heartbeat
heartbeatsApp.post('/', authMiddleware, async (c) => {
  const workspace = c.get('workspace');
  const body = await c.req.json().catch(() => null);

  const parseResult = CreateHeartbeatSchema.safeParse(body);
  if (!parseResult.success) {
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid heartbeat configuration.',
          details: parseResult.error.flatten(),
        },
      },
      400
    );
  }

  const { name, expectedIntervalMinutes, gracePeriodMinutes, active } =
    parseResult.data;
  const db = drizzle(c.env.DB, { schema });

  // Check quota
  const [existingCount] = await db
    .select({ val: count() })
    .from(schema.heartbeatTokens)
    .where(eq(schema.heartbeatTokens.workspaceId, workspace.id));

  if (existingCount.val >= productLimits.heartbeatMonitors) {
    return c.json(
      {
        success: false,
        error: {
          code: 'LIMIT_EXCEEDED',
          message: `Workspace limit of ${productLimits.heartbeatMonitors} heartbeat monitors reached.`,
        },
      },
      403
    );
  }

  const rawToken = generateToken('whistle_hb');
  const tokenHash = await sha256Hex(rawToken);
  const tokenPreview = `${rawToken.slice(0, 14)}...${rawToken.slice(-4)}`;

  const nowIso = new Date().toISOString();
  const nextExpectedDate = new Date(Date.now() + expectedIntervalMinutes * 60 * 1000);
  const deadlineDate = new Date(
    nextExpectedDate.getTime() + gracePeriodMinutes * 60 * 1000
  );
  const heartbeatId = generateId('hb');

  await db.insert(schema.heartbeatTokens).values({
    id: heartbeatId,
    workspaceId: workspace.id,
    name,
    tokenHash,
    tokenPreview,
    expectedIntervalMinutes,
    gracePeriodMinutes,
    status: 'pending',
    nextExpectedAt: nextExpectedDate.toISOString(),
    deadlineAt: deadlineDate.toISOString(),
    active,
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  const checkInUrl = `${brandConfig.apiUrl}/api/v1/heartbeats/check-in/${rawToken}`;

  return c.json({
    success: true,
    data: {
      id: heartbeatId,
      name,
      token: rawToken, // Returned ONLY on creation
      tokenPreview,
      checkInUrl,
      expectedIntervalMinutes,
      gracePeriodMinutes,
      status: 'pending',
      nextExpectedAt: nextExpectedDate.toISOString(),
      deadlineAt: deadlineDate.toISOString(),
    },
    message: 'Heartbeat created. Save the secret check-in token safely.',
  });
});

// GET /:id - Heartbeat detail with code snippets
heartbeatsApp.get('/:id', authMiddleware, async (c) => {
  const workspace = c.get('workspace');
  const id = c.req.param('id');
  if (!id) {
    return c.json({ success: false, error: { code: 'BAD_REQUEST', message: 'ID required' } }, 400);
  }
  const db = drizzle(c.env.DB, { schema });

  const [hb] = await db
    .select()
    .from(schema.heartbeatTokens)
    .where(
      and(
        eq(schema.heartbeatTokens.id, id),
        eq(schema.heartbeatTokens.workspaceId, workspace.id)
      )
    )
    .limit(1);

  if (!hb) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Heartbeat not found.' } },
      404
    );
  }

  const recentCheckIns = await db
    .select()
    .from(schema.heartbeatCheckIns)
    .where(eq(schema.heartbeatCheckIns.heartbeatId, hb.id))
    .orderBy(desc(schema.heartbeatCheckIns.receivedAt))
    .limit(20);

  const [activeInc] = await db
    .select()
    .from(schema.incidents)
    .where(
      and(
        eq(schema.incidents.targetId, hb.id),
        eq(schema.incidents.targetType, 'heartbeat'),
        eq(schema.incidents.state, 'open')
      )
    )
    .limit(1);

  const checkInUrlPlaceholder = `${brandConfig.apiUrl}/api/v1/heartbeats/check-in/<YOUR_SECRET_TOKEN>`;

  const codeSnippets = {
    curl: `curl -fsS -m 10 --retry 3 "${checkInUrlPlaceholder}"`,
    bash: `#!/usr/bin/env bash\n# Run your job\n/path/to/backup.sh && curl -fsS -m 10 "${checkInUrlPlaceholder}"`,
    node: `// Node.js (fetch or axios)\nawait fetch("${checkInUrlPlaceholder}");`,
    python: `import urllib.request\ntry:\n    urllib.request.urlopen("${checkInUrlPlaceholder}", timeout=10)\nexcept Exception as e:\n    print(f"Heartbeat failed: {e}")`,
    php: `<?php\nfile_get_contents("${checkInUrlPlaceholder}");\n?>`,
  };

  return c.json({
    success: true,
    data: {
      ...hb,
      recentCheckIns,
      activeIncidentId: activeInc?.id || null,
      codeSnippets,
    },
  });
});

// POST /:id/rotate-token - Rotate secret token
heartbeatsApp.post('/:id/rotate-token', authMiddleware, async (c) => {
  const workspace = c.get('workspace');
  const id = c.req.param('id');
  if (!id) {
    return c.json({ success: false, error: { code: 'BAD_REQUEST', message: 'ID required' } }, 400);
  }
  const db = drizzle(c.env.DB, { schema });

  const [hb] = await db
    .select()
    .from(schema.heartbeatTokens)
    .where(
      and(
        eq(schema.heartbeatTokens.id, id),
        eq(schema.heartbeatTokens.workspaceId, workspace.id)
      )
    )
    .limit(1);

  if (!hb) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Heartbeat not found.' } },
      404
    );
  }

  const rawToken = generateToken('whistle_hb');
  const tokenHash = await sha256Hex(rawToken);
  const tokenPreview = `${rawToken.slice(0, 14)}...${rawToken.slice(-4)}`;
  const nowIso = new Date().toISOString();

  await db
    .update(schema.heartbeatTokens)
    .set({
      tokenHash,
      tokenPreview,
      updatedAt: nowIso,
    })
    .where(eq(schema.heartbeatTokens.id, id));

  const checkInUrl = `${brandConfig.apiUrl}/api/v1/heartbeats/check-in/${rawToken}`;

  return c.json({
    success: true,
    data: {
      token: rawToken,
      tokenPreview,
      checkInUrl,
    },
    message: 'Secret token rotated. Update your scheduled scripts with the new check-in URL.',
  });
});

// DELETE /:id
heartbeatsApp.delete('/:id', authMiddleware, async (c) => {
  const workspace = c.get('workspace');
  const id = c.req.param('id');
  if (!id) {
    return c.json({ success: false, error: { code: 'BAD_REQUEST', message: 'ID required' } }, 400);
  }
  const db = drizzle(c.env.DB, { schema });

  await db
    .delete(schema.heartbeatTokens)
    .where(
      and(
        eq(schema.heartbeatTokens.id, id),
        eq(schema.heartbeatTokens.workspaceId, workspace.id)
      )
    );

  return c.json({
    success: true,
    message: 'Heartbeat deleted.',
  });
});

export { heartbeatsApp };
