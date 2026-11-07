import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { authMiddleware, type Env, type AuthContextVariables } from '../middleware/auth';

const incidentsApp = new Hono<{ Bindings: Env; Variables: AuthContextVariables }>();

incidentsApp.use('*', authMiddleware);

// GET / - List incidents
incidentsApp.get('/', async (c) => {
  const workspace = c.get('workspace');
  const stateFilter = c.req.query('state'); // 'open' | 'resolved' | undefined
  const db = drizzle(c.env.DB, { schema });

  let query = db
    .select()
    .from(schema.incidents)
    .where(
      stateFilter
        ? and(
            eq(schema.incidents.workspaceId, workspace.id),
            eq(schema.incidents.state, stateFilter)
          )
        : eq(schema.incidents.workspaceId, workspace.id)
    )
    .orderBy(desc(schema.incidents.createdAt));

  const list = await query;

  return c.json({
    success: true,
    data: list,
  });
});

// GET /:id - Detailed incident with timeline & notifications
incidentsApp.get('/:id', async (c) => {
  const workspace = c.get('workspace');
  const id = c.req.param('id');
  const db = drizzle(c.env.DB, { schema });

  const [incident] = await db
    .select()
    .from(schema.incidents)
    .where(
      and(
        eq(schema.incidents.id, id),
        eq(schema.incidents.workspaceId, workspace.id)
      )
    )
    .limit(1);

  if (!incident) {
    return c.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } },
      404
    );
  }

  // Fetch notification deliveries
  const deliveries = await db
    .select()
    .from(schema.notificationDeliveries)
    .where(eq(schema.notificationDeliveries.incidentId, incident.id))
    .orderBy(desc(schema.notificationDeliveries.sentAt));

  // Build chronological timeline
  const timeline: {
    timestamp: string;
    event: 'suspected' | 'confirmed' | 'notification_sent' | 'resolved';
    message: string;
  }[] = [];

  timeline.push({
    timestamp: incident.suspectedAt,
    event: 'suspected',
    message: `Probe or heartbeat failure first detected: ${incident.failureReason}`,
  });

  if (incident.confirmedAt) {
    timeline.push({
      timestamp: incident.confirmedAt,
      event: 'confirmed',
      message: 'Incident confirmed after failure confirmation thresholds were met.',
    });
  }

  for (const deliv of deliveries) {
    timeline.push({
      timestamp: deliv.sentAt,
      event: 'notification_sent',
      message: `Alert (${deliv.eventType}) dispatched via ${deliv.provider}: ${deliv.status}`,
    });
  }

  if (incident.resolvedAt) {
    timeline.push({
      timestamp: incident.resolvedAt,
      event: 'resolved',
      message: `Incident resolved. Total downtime duration: ${incident.durationSeconds || 0} seconds.`,
    });
  }

  timeline.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return c.json({
    success: true,
    data: {
      ...incident,
      deliveries,
      timeline,
    },
  });
});

export { incidentsApp };
