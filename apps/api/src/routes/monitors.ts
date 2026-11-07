import { Hono } from 'hono';
import { eq, and, desc, gte, count } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import {
  CreateMonitorSchema,
  UpdateMonitorSchema,
  type MonitorWithStats,
} from '@jobwhistle/contracts';
import { productLimits } from '@jobwhistle/config';
import { validateMonitorUrl } from '../security/ssrf';
import { generateId } from '../security/crypto';
import { executeHttpCheck } from '../services/monitoring/http-checker';
import { IncidentLifecycleService } from '../services/monitoring/incident-lifecycle';
import { NotificationDispatcher } from '../services/notification/dispatcher';
import { authMiddleware, type Env, type AuthContextVariables } from '../middleware/auth';

const monitorsApp = new Hono<{ Bindings: Env; Variables: AuthContextVariables }>();

// All monitor routes require authentication
monitorsApp.use('*', authMiddleware);

// GET / - List monitors with real stats
monitorsApp.get('/', async (c) => {
  const workspace = c.get('workspace');
  const db = drizzle(c.env.DB, { schema });

  const monitorRecords = await db
    .select()
    .from(schema.monitors)
    .where(eq(schema.monitors.workspaceId, workspace.id))
    .orderBy(desc(schema.monitors.createdAt));

  const now = Date.now();
  const day24hAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const day7dAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Enrich monitors with stats
  const enriched: MonitorWithStats[] = await Promise.all(
    monitorRecords.map(async (m) => {
      // Recent checks (last 10)
      const recentChecks = await db
        .select()
        .from(schema.monitorChecks)
        .where(eq(schema.monitorChecks.monitorId, m.id))
        .orderBy(desc(schema.monitorChecks.createdAt))
        .limit(10);

      // 24h checks for uptime & avg latency
      const checks24h = await db
        .select()
        .from(schema.monitorChecks)
        .where(
          and(
            eq(schema.monitorChecks.monitorId, m.id),
            gte(schema.monitorChecks.createdAt, day24hAgo)
          )
        );

      // 7d checks for 7-day uptime
      const checks7d = await db
        .select()
        .from(schema.monitorChecks)
        .where(
          and(
            eq(schema.monitorChecks.monitorId, m.id),
            gte(schema.monitorChecks.createdAt, day7dAgo)
          )
        );

      const upChecks24h = checks24h.filter((c) => c.isUp).length;
      const uptimePercentage24h =
        checks24h.length > 0
          ? Math.round((upChecks24h / checks24h.length) * 1000) / 10
          : 100.0;

      const upChecks7d = checks7d.filter((c) => c.isUp).length;
      const uptimePercentage7d =
        checks7d.length > 0
          ? Math.round((upChecks7d / checks7d.length) * 1000) / 10
          : 100.0;

      const totalResponseTime = checks24h.reduce(
        (sum, c) => sum + (c.responseTimeMs || 0),
        0
      );
      const avgResponseTimeMs =
        checks24h.length > 0
          ? Math.round(totalResponseTime / checks24h.length)
          : recentChecks[0]?.responseTimeMs || 0;

      // Active incident
      const [activeInc] = await db
        .select()
        .from(schema.incidents)
        .where(
          and(
            eq(schema.incidents.targetId, m.id),
            eq(schema.incidents.targetType, 'monitor'),
            eq(schema.incidents.state, 'open')
          )
        )
        .limit(1);

      return {
        ...m,
        method: m.method as 'GET' | 'HEAD' | 'POST',
        status: m.status as 'up' | 'down' | 'degraded' | 'paused' | 'pending',
        uptimePercentage24h,
        uptimePercentage7d,
        avgResponseTimeMs,
        recentChecks,
        activeIncidentId: activeInc?.id || null,
      };
    })
  );

  return c.json({
    success: true,
    data: enriched,
  });
});

// POST / - Create monitor
monitorsApp.post('/', async (c) => {
  const workspace = c.get('workspace');
  const body = await c.req.json().catch(() => null);

  const parseResult = CreateMonitorSchema.safeParse(body);
  if (!parseResult.success) {
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid monitor parameters.',
          details: parseResult.error.flatten(),
        },
      },
      400
    );
  }

  const { name, url, intervalMinutes, timeoutSeconds, method, expectedStatusCode, active } =
    parseResult.data;

  // 1. SSRF Check
  const ssrfValidation = validateMonitorUrl(url);
  if (!ssrfValidation.valid) {
    return c.json(
      {
        success: false,
        error: {
          code: 'SSRF_RESTRICTED',
          message: ssrfValidation.reason || 'Restricted target URL.',
        },
      },
      400
    );
  }

  const db = drizzle(c.env.DB, { schema });

  // 2. Check Plan Quota (Free Beta Limit)
  const [existingCount] = await db
    .select({ val: count() })
    .from(schema.monitors)
    .where(eq(schema.monitors.workspaceId, workspace.id));

  if (existingCount.val >= productLimits.monitors) {
    return c.json(
      {
        success: false,
        error: {
          code: 'LIMIT_EXCEEDED',
          message: `Workspace limit of ${productLimits.monitors} monitors reached in free beta.`,
        },
      },
      403
    );
  }

  const nowIso = new Date().toISOString();
  const monitorId = generateId('mon');

  // Insert monitor record
  await db.insert(schema.monitors).values({
    id: monitorId,
    workspaceId: workspace.id,
    name,
    url,
    method,
    intervalMinutes,
    timeoutSeconds,
    expectedStatusCode,
    status: 'pending',
    consecutiveFailures: 0,
    nextCheckAt: nowIso, // Check immediately
    active,
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  // Execute initial check immediately so user gets instant status feedback
  let initialCheckResult = null;
  if (active) {
    initialCheckResult = await executeHttpCheck({
      url,
      method,
      expectedStatusCode,
      timeoutSeconds,
    });

    const checkId = generateId('chk');
    await db.insert(schema.monitorChecks).values({
      id: checkId,
      monitorId,
      statusCode: initialCheckResult.statusCode,
      responseTimeMs: initialCheckResult.responseTimeMs,
      isUp: initialCheckResult.isUp,
      errorMessage: initialCheckResult.errorMessage,
      createdAt: nowIso,
    });

    const nextCheckDate = new Date(Date.now() + intervalMinutes * 60 * 1000).toISOString();
    await db
      .update(schema.monitors)
      .set({
        status: initialCheckResult.isUp ? 'up' : 'degraded',
        consecutiveFailures: initialCheckResult.isUp ? 0 : 1,
        lastCheckedAt: nowIso,
        lastSuccessAt: initialCheckResult.isUp ? nowIso : null,
        lastFailureAt: initialCheckResult.isUp ? null : nowIso,
        nextCheckAt: nextCheckDate,
      })
      .where(eq(schema.monitors.id, monitorId));
  }

  const [created] = await db
    .select()
    .from(schema.monitors)
    .where(eq(schema.monitors.id, monitorId))
    .limit(1);

  return c.json({
    success: true,
    data: created,
    message: 'Monitor created successfully.',
  });
});

// GET /:id - Get single monitor detail
monitorsApp.get('/:id', async (c) => {
  const workspace = c.get('workspace');
  const id = c.req.param('id');
  const db = drizzle(c.env.DB, { schema });

  const [monitor] = await db
    .select()
    .from(schema.monitors)
    .where(
      and(
        eq(schema.monitors.id, id),
        eq(schema.monitors.workspaceId, workspace.id)
      )
    )
    .limit(1);

  if (!monitor) {
    return c.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Monitor not found.' },
      },
      404
    );
  }

  const recentChecks = await db
    .select()
    .from(schema.monitorChecks)
    .where(eq(schema.monitorChecks.monitorId, monitor.id))
    .orderBy(desc(schema.monitorChecks.createdAt))
    .limit(50);

  const [activeInc] = await db
    .select()
    .from(schema.incidents)
    .where(
      and(
        eq(schema.incidents.targetId, monitor.id),
        eq(schema.incidents.targetType, 'monitor'),
        eq(schema.incidents.state, 'open')
      )
    )
    .limit(1);

  return c.json({
    success: true,
    data: {
      ...monitor,
      recentChecks,
      activeIncidentId: activeInc?.id || null,
    },
  });
});

// PATCH /:id - Update monitor
monitorsApp.patch('/:id', async (c) => {
  const workspace = c.get('workspace');
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => null);

  const parseResult = UpdateMonitorSchema.safeParse(body);
  if (!parseResult.success) {
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid update payload',
          details: parseResult.error.flatten(),
        },
      },
      400
    );
  }

  const updates = parseResult.data;
  if (updates.url) {
    const ssrfCheck = validateMonitorUrl(updates.url);
    if (!ssrfCheck.valid) {
      return c.json(
        {
          success: false,
          error: {
            code: 'SSRF_RESTRICTED',
            message: ssrfCheck.reason || 'Restricted target URL.',
          },
        },
        400
      );
    }
  }

  const db = drizzle(c.env.DB, { schema });
  const nowIso = new Date().toISOString();

  await db
    .update(schema.monitors)
    .set({
      ...updates,
      updatedAt: nowIso,
    })
    .where(
      and(
        eq(schema.monitors.id, id),
        eq(schema.monitors.workspaceId, workspace.id)
      )
    );

  const [updated] = await db
    .select()
    .from(schema.monitors)
    .where(eq(schema.monitors.id, id))
    .limit(1);

  return c.json({
    success: true,
    data: updated,
    message: 'Monitor updated.',
  });
});

// DELETE /:id - Delete monitor
monitorsApp.delete('/:id', async (c) => {
  const workspace = c.get('workspace');
  const id = c.req.param('id');
  const db = drizzle(c.env.DB, { schema });

  await db
    .delete(schema.monitors)
    .where(
      and(
        eq(schema.monitors.id, id),
        eq(schema.monitors.workspaceId, workspace.id)
      )
    );

  return c.json({
    success: true,
    message: 'Monitor deleted.',
  });
});

// POST /:id/check-now - Trigger immediate on-demand check
monitorsApp.post('/:id/check-now', async (c) => {
  const workspace = c.get('workspace');
  const id = c.req.param('id');
  const db = drizzle(c.env.DB, { schema });

  const [monitor] = await db
    .select()
    .from(schema.monitors)
    .where(
      and(
        eq(schema.monitors.id, id),
        eq(schema.monitors.workspaceId, workspace.id)
      )
    )
    .limit(1);

  if (!monitor) {
    return c.json(
      {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Monitor not found.' },
      },
      404
    );
  }

  const result = await executeHttpCheck({
    url: monitor.url,
    method: monitor.method,
    expectedStatusCode: monitor.expectedStatusCode,
    timeoutSeconds: monitor.timeoutSeconds,
  });

  const nowIso = new Date().toISOString();
  const checkId = generateId('chk');

  await db.insert(schema.monitorChecks).values({
    id: checkId,
    monitorId: monitor.id,
    statusCode: result.statusCode,
    responseTimeMs: result.responseTimeMs,
    isUp: result.isUp,
    errorMessage: result.errorMessage,
    createdAt: nowIso,
  });

  // Evaluate incident lifecycle
  const notificationDispatcher = new NotificationDispatcher(
    c.env.RESEND_API_KEY,
    c.env.EMAIL_FROM
  );
  const lifecycle = new IncidentLifecycleService(notificationDispatcher);
  await lifecycle.handleMonitorCheckResult(
    c.env.DB,
    monitor,
    result.isUp,
    result.errorMessage
  );

  const [refreshed] = await db
    .select()
    .from(schema.monitors)
    .where(eq(schema.monitors.id, monitor.id))
    .limit(1);

  return c.json({
    success: true,
    data: {
      monitor: refreshed,
      latestCheck: {
        id: checkId,
        ...result,
        createdAt: nowIso,
      },
    },
    message: 'Check completed.',
  });
});

export { monitorsApp };

