import { Hono } from 'hono';
import { eq, and, desc, gte } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import type { OverviewMetrics } from '@jobwhistle/contracts';
import { authMiddleware, type Env, type AuthContextVariables } from '../middleware/auth';

const overviewApp = new Hono<{ Bindings: Env; Variables: AuthContextVariables }>();

overviewApp.use('*', authMiddleware);

overviewApp.get('/', async (c) => {
  const workspace = c.get('workspace');
  const db = drizzle(c.env.DB, { schema });

  // 1. Monitors
  const workspaceMonitors = await db
    .select()
    .from(schema.monitors)
    .where(eq(schema.monitors.workspaceId, workspace.id));

  const totalMonitors = workspaceMonitors.length;
  const upMonitors = workspaceMonitors.filter((m) => m.status === 'up').length;
  const downMonitors = workspaceMonitors.filter((m) => m.status === 'down').length;
  const pausedMonitors = workspaceMonitors.filter((m) => !m.active || m.status === 'paused').length;

  // 2. Heartbeats
  const workspaceHeartbeats = await db
    .select()
    .from(schema.heartbeatTokens)
    .where(eq(schema.heartbeatTokens.workspaceId, workspace.id));

  const totalHeartbeats = workspaceHeartbeats.length;
  const healthyHeartbeats = workspaceHeartbeats.filter((h) => h.status === 'up').length;
  const missedHeartbeats = workspaceHeartbeats.filter((h) => h.status === 'down').length;

  // 3. Open Incidents
  const openIncidentsRecords = await db
    .select()
    .from(schema.incidents)
    .where(
      and(
        eq(schema.incidents.workspaceId, workspace.id),
        eq(schema.incidents.state, 'open')
      )
    );

  const openIncidents = openIncidentsRecords.length;

  // 4. 24h Checks across all monitors
  const now = Date.now();
  const day24hAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  let allChecks24h: (typeof schema.monitorChecks.$inferSelect)[] = [];
  if (workspaceMonitors.length > 0) {
    const monitorIds = new Set(workspaceMonitors.map((m) => m.id));
    // Query recent checks
    const recentAll = await db
      .select()
      .from(schema.monitorChecks)
      .where(gte(schema.monitorChecks.createdAt, day24hAgo))
      .orderBy(desc(schema.monitorChecks.createdAt));

    allChecks24h = recentAll.filter((chk) => monitorIds.has(chk.monitorId));
  }

  const totalChecks = allChecks24h.length;
  const successfulChecks = allChecks24h.filter((chk) => chk.isUp).length;
  const uptimePercentage24h =
    totalChecks > 0
      ? Math.round((successfulChecks / totalChecks) * 1000) / 10
      : 100.0;

  const totalDuration = allChecks24h.reduce((sum, chk) => sum + chk.responseTimeMs, 0);
  const avgResponseTimeMs =
    totalChecks > 0 ? Math.round(totalDuration / totalChecks) : 0;

  const metrics: OverviewMetrics = {
    totalMonitors,
    upMonitors,
    downMonitors,
    pausedMonitors,
    totalHeartbeats,
    healthyHeartbeats,
    missedHeartbeats,
    openIncidents,
    uptimePercentage24h,
    avgResponseTimeMs,
  };

  // Recent 5 incidents
  const recentIncidents = await db
    .select()
    .from(schema.incidents)
    .where(eq(schema.incidents.workspaceId, workspace.id))
    .orderBy(desc(schema.incidents.createdAt))
    .limit(5);

  return c.json({
    success: true,
    data: {
      metrics,
      monitors: workspaceMonitors.slice(0, 5),
      heartbeats: workspaceHeartbeats.slice(0, 5),
      recentIncidents,
    },
  });
});

export { overviewApp };

