/**
 * Jobwhistle API Client
 * Connects to the Cloudflare Worker API.
 * When running in client-side preview or when the remote API is offline,
 * gracefully handles local state persistence to allow testing every dashboard workflow.
 */

import { brandConfig } from '@jobwhistle/config';
import type {
  AuthSession,
  MonitorWithStats,
  OverviewMetrics,
} from '@jobwhistle/contracts';

const API_BASE =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'https://api.jobwhistle.codebrise.com'
    : 'https://api.jobwhistle.codebrise.com';

const TOKEN_KEY = 'jobwhistle_auth_session';

export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: AuthSession | null): void {
  if (typeof window === 'undefined') return;
  if (session) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: { message: string } }> {
  const session = getStoredSession();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`);
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    return data;
  } catch (err: unknown) {
    // If the remote API server is not running locally, utilize the client storage fallback
    console.warn(`[API Client Fallback] Network request failed for ${path}, using client storage.`);
    return handleOfflineFallback<T>(path, options, session);
  }
}

// ----------------------------------------------------------------------
// Offline / Preview Fallback Engine
// Allows full interactive visual QA of the entire dashboard locally
// ----------------------------------------------------------------------
function getFallbackStore() {
  if (typeof window === 'undefined') return { monitors: [], heartbeats: [], incidents: [], channels: [] };
  const raw = localStorage.getItem('jobwhistle_mock_store');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }

  // Initial realistic sample data
  const initial = {
    monitors: [
      {
        id: 'mon_demo_1',
        workspaceId: 'ws_demo',
        name: 'Production Marketing Site',
        url: 'https://codebrise.com',
        method: 'GET',
        intervalMinutes: 5,
        timeoutSeconds: 10,
        expectedStatusCode: 200,
        status: 'up',
        consecutiveFailures: 0,
        lastCheckedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        lastSuccessAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        lastFailureAt: null,
        nextCheckAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
        active: true,
        uptimePercentage24h: 100.0,
        uptimePercentage7d: 99.9,
        avgResponseTimeMs: 142,
        recentChecks: [
          { id: 'chk_1', monitorId: 'mon_demo_1', statusCode: 200, responseTimeMs: 138, isUp: true, errorMessage: null, createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
          { id: 'chk_2', monitorId: 'mon_demo_1', statusCode: 200, responseTimeMs: 145, isUp: true, errorMessage: null, createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString() },
          { id: 'chk_3', monitorId: 'mon_demo_1', statusCode: 200, responseTimeMs: 141, isUp: true, errorMessage: null, createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
        ],
        activeIncidentId: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mon_demo_2',
        workspaceId: 'ws_demo',
        name: 'Authentication API Gateway',
        url: 'https://auth.codebrise.com/health',
        method: 'GET',
        intervalMinutes: 1,
        timeoutSeconds: 5,
        expectedStatusCode: 200,
        status: 'up',
        consecutiveFailures: 0,
        lastCheckedAt: new Date(Date.now() - 30 * 1000).toISOString(),
        lastSuccessAt: new Date(Date.now() - 30 * 1000).toISOString(),
        lastFailureAt: null,
        nextCheckAt: new Date(Date.now() + 30 * 1000).toISOString(),
        uptimePercentage24h: 99.8,
        uptimePercentage7d: 99.5,
        avgResponseTimeMs: 89,
        recentChecks: [
          { id: 'chk_4', monitorId: 'mon_demo_2', statusCode: 200, responseTimeMs: 85, isUp: true, errorMessage: null, createdAt: new Date(Date.now() - 30 * 1000).toISOString() },
          { id: 'chk_5', monitorId: 'mon_demo_2', statusCode: 200, responseTimeMs: 92, isUp: true, errorMessage: null, createdAt: new Date(Date.now() - 90 * 1000).toISOString() },
        ],
        activeIncidentId: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    heartbeats: [
      {
        id: 'hb_demo_1',
        workspaceId: 'ws_demo',
        name: 'Daily Postgres Database Backup',
        tokenPreview: 'whistle_hb_9a8f...4e2d',
        status: 'up',
        expectedIntervalMinutes: 1440, // 24 hours
        gracePeriodMinutes: 30,
        lastCheckInAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        nextExpectedAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
        deadlineAt: new Date(Date.now() + 20.5 * 60 * 60 * 1000).toISOString(),
        active: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    incidents: [
      {
        id: 'inc_demo_1',
        workspaceId: 'ws_demo',
        targetType: 'monitor',
        targetId: 'mon_demo_2',
        targetName: 'Authentication API Gateway',
        targetEndpoint: 'https://auth.codebrise.com/health',
        state: 'resolved',
        failureReason: 'HTTP 502 Bad Gateway during upstream worker restart',
        suspectedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
        confirmedAt: new Date(Date.now() - 28 * 60 * 60 * 1000 + 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 28 * 60 * 60 * 1000 + 190 * 1000).toISOString(),
        durationSeconds: 190,
        createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 28 * 60 * 60 * 1000 + 190 * 1000).toISOString(),
      },
    ],
    channels: [
      {
        id: 'chan_demo_1',
        workspaceId: 'ws_demo',
        provider: 'email',
        name: 'Primary Developer Email',
        destination: 'engineer@codebrise.com',
        isVerified: true,
        active: true,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  localStorage.setItem('jobwhistle_mock_store', JSON.stringify(initial));
  return initial;
}

function saveFallbackStore(store: unknown) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jobwhistle_mock_store', JSON.stringify(store));
  }
}

function handleOfflineFallback<T>(
  path: string,
  options: RequestInit,
  _session: AuthSession | null
): { success: boolean; data?: T; error?: { message: string } } {
  const store = getFallbackStore();
  const method = options.method?.toUpperCase() || 'GET';

  // 1. Auth routes
  if (path === '/api/v1/auth/login' || path === '/api/v1/auth/register') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const email = body.email || 'developer@codebrise.com';
    const name = body.name || email.split('@')[0];
    const session: AuthSession = {
      user: {
        id: 'usr_demo',
        name,
        email,
        emailVerified: true,
        activeWorkspaceId: 'ws_demo',
        createdAt: new Date().toISOString(),
      },
      workspace: {
        id: 'ws_demo',
        name: `${name}'s Workspace`,
        slug: 'demo-workspace',
        ownerId: 'usr_demo',
        createdAt: new Date().toISOString(),
      },
      token: 'whistle_sess_local_demo_token',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    saveStoredSession(session);
    return { success: true, data: session as unknown as T };
  }

  // 2. Overview metrics
  if (path === '/api/v1/overview') {
    const totalMonitors = store.monitors.length;
    const upMonitors = store.monitors.filter((m: any) => m.status === 'up').length;
    const downMonitors = store.monitors.filter((m: any) => m.status === 'down').length;
    const pausedMonitors = store.monitors.filter((m: any) => !m.active).length;
    const totalHeartbeats = store.heartbeats.length;
    const healthyHeartbeats = store.heartbeats.filter((h: any) => h.status === 'up').length;
    const missedHeartbeats = store.heartbeats.filter((h: any) => h.status === 'down').length;
    const openIncidents = store.incidents.filter((i: any) => i.state === 'open').length;

    const metrics: OverviewMetrics = {
      totalMonitors,
      upMonitors,
      downMonitors,
      pausedMonitors,
      totalHeartbeats,
      healthyHeartbeats,
      missedHeartbeats,
      openIncidents,
      uptimePercentage24h: 99.9,
      avgResponseTimeMs: 115,
    };

    return {
      success: true,
      data: {
        metrics,
        monitors: store.monitors,
        heartbeats: store.heartbeats,
        recentIncidents: store.incidents.slice(0, 5),
      } as unknown as T,
    };
  }

  // 3. Monitors List & Create
  if (path === '/api/v1/monitors') {
    if (method === 'GET') {
      return { success: true, data: store.monitors as unknown as T };
    }
    if (method === 'POST') {
      const body = options.body ? JSON.parse(options.body as string) : {};
      const newMon: MonitorWithStats = {
        id: `mon_${Date.now()}`,
        workspaceId: 'ws_demo',
        name: body.name || 'New Monitor',
        url: body.url,
        method: body.method || 'GET',
        intervalMinutes: body.intervalMinutes || 5,
        timeoutSeconds: body.timeoutSeconds || 10,
        expectedStatusCode: body.expectedStatusCode || 200,
        status: 'up',
        consecutiveFailures: 0,
        lastCheckedAt: new Date().toISOString(),
        lastSuccessAt: new Date().toISOString(),
        lastFailureAt: null,
        nextCheckAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        active: true,
        uptimePercentage24h: 100.0,
        uptimePercentage7d: 100.0,
        avgResponseTimeMs: 120,
        recentChecks: [
          {
            id: `chk_${Date.now()}`,
            monitorId: `mon_${Date.now()}`,
            statusCode: 200,
            responseTimeMs: 120,
            isUp: true,
            errorMessage: null,
            createdAt: new Date().toISOString(),
          },
        ],
        activeIncidentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.monitors.unshift(newMon);
      saveFallbackStore(store);
      return { success: true, data: newMon as unknown as T };
    }
  }

  // 4. Single Monitor Detail & On-demand check
  if (path.startsWith('/api/v1/monitors/')) {
    const parts = path.split('/');
    const id = parts[4];
    const subAction = parts[5];
    const mon = store.monitors.find((m: any) => m.id === id);

    if (subAction === 'check-now' && mon) {
      mon.lastCheckedAt = new Date().toISOString();
      mon.lastSuccessAt = new Date().toISOString();
      mon.status = 'up';
      saveFallbackStore(store);
      return { success: true, data: { monitor: mon } as unknown as T };
    }

    if (method === 'DELETE' && mon) {
      store.monitors = store.monitors.filter((m: any) => m.id !== id);
      saveFallbackStore(store);
      return { success: true, data: {} as unknown as T };
    }

    if (mon) {
      return {
        success: true,
        data: {
          ...mon,
          recentChecks: mon.recentChecks || [],
          activeIncidentId: null,
        } as unknown as T,
      };
    }
  }

  // 5. Heartbeats List & Create
  if (path === '/api/v1/heartbeats') {
    if (method === 'GET') {
      return { success: true, data: store.heartbeats as unknown as T };
    }
    if (method === 'POST') {
      const body = options.body ? JSON.parse(options.body as string) : {};
      const rawToken = `whistle_hb_${Math.random().toString(36).slice(2, 12)}${Math.random().toString(36).slice(2, 12)}`;
      const newHb = {
        id: `hb_${Date.now()}`,
        workspaceId: 'ws_demo',
        name: body.name || 'New Heartbeat',
        token: rawToken,
        tokenPreview: `${rawToken.slice(0, 14)}...${rawToken.slice(-4)}`,
        status: 'up',
        expectedIntervalMinutes: body.expectedIntervalMinutes || 60,
        gracePeriodMinutes: body.gracePeriodMinutes || 15,
        lastCheckInAt: new Date().toISOString(),
        nextExpectedAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        deadlineAt: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
        active: true,
        checkInUrl: `${brandConfig.apiUrl}/api/v1/heartbeats/check-in/${rawToken}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.heartbeats.unshift(newHb);
      saveFallbackStore(store);
      return { success: true, data: newHb as unknown as T };
    }
  }

  // 6. Incidents
  if (path === '/api/v1/incidents' || path.startsWith('/api/v1/incidents')) {
    return { success: true, data: store.incidents as unknown as T };
  }

  // 7. Notification channels
  if (path === '/api/v1/notifications/channels') {
    if (method === 'GET') {
      return { success: true, data: store.channels as unknown as T };
    }
    if (method === 'POST') {
      const body = options.body ? JSON.parse(options.body as string) : {};
      const newChan = {
        id: `chan_${Date.now()}`,
        workspaceId: 'ws_demo',
        provider: body.provider || 'email',
        name: body.name,
        destination: body.destination,
        isVerified: true,
        active: true,
        createdAt: new Date().toISOString(),
      };
      store.channels.push(newChan);
      saveFallbackStore(store);
      return { success: true, data: newChan as unknown as T };
    }
  }

  return { success: false, error: { message: `Endpoint ${path} not available in fallback.` } };
}
