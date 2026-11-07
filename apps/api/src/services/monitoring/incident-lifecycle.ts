import { eq, and } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../db/schema';
import { productLimits } from '@jobwhistle/config';
import { generateId } from '../../security/crypto';
import type { NotificationDispatcher } from '../notification/dispatcher';

export class IncidentLifecycleService {
  constructor(private dispatcher?: NotificationDispatcher) {}

  /**
   * Process monitor check outcome:
   * 1. Success check:
   *    - If active incident exists -> Resolve incident, reset consecutive failures, trigger recovery alert.
   *    - If suspected incident exists -> Delete suspected incident, reset consecutive failures.
   *    - Update lastSuccessAt.
   * 2. Failed check:
   *    - Increment consecutiveFailures.
   *    - If consecutiveFailures == 1 -> Create suspected incident.
   *    - If consecutiveFailures >= 2 -> Open confirmed incident (if not already open), trigger alert!
   *    - Update lastFailureAt.
   */
  async handleMonitorCheckResult(
    dbBinding: D1Database,
    monitor: typeof schema.monitors.$inferSelect,
    isUp: boolean,
    failureReason: string | null
  ): Promise<void> {
    const db = drizzle(dbBinding, { schema });
    const nowIso = new Date().toISOString();

    // Find any non-resolved incident for this monitor
    const existingIncidents = await db
      .select()
      .from(schema.incidents)
      .where(
        and(
          eq(schema.incidents.targetId, monitor.id),
          eq(schema.incidents.targetType, 'monitor')
        )
      );

    const activeIncident = existingIncidents.find((i) => i.state !== 'resolved');

    if (isUp) {
      // Monitor is UP
      if (activeIncident) {
        if (activeIncident.state === 'open') {
          // Confirm recovery of open incident
          const suspectedTime = new Date(activeIncident.suspectedAt).getTime();
          const resolvedTime = new Date(nowIso).getTime();
          const durationSeconds = Math.max(
            1,
            Math.round((resolvedTime - suspectedTime) / 1000)
          );

          await db
            .update(schema.incidents)
            .set({
              state: 'resolved',
              resolvedAt: nowIso,
              durationSeconds,
              updatedAt: nowIso,
            })
            .where(eq(schema.incidents.id, activeIncident.id));

          // Dispatch recovery notification
          if (this.dispatcher) {
            await this.dispatcher.dispatch(dbBinding, {
              workspaceId: monitor.workspaceId,
              incidentId: activeIncident.id,
              eventType: 'monitor.up',
              targetId: monitor.id,
              targetName: monitor.name,
              targetType: 'monitor',
              targetEndpoint: monitor.url,
              reason: 'Service recovered and responded successfully.',
              timestamp: nowIso,
            });
          }
        } else if (activeIncident.state === 'suspected') {
          // Suspected blip resolved before confirmation: mark resolved without sending alerts
          await db
            .update(schema.incidents)
            .set({
              state: 'resolved',
              resolvedAt: nowIso,
              durationSeconds: 0,
              updatedAt: nowIso,
            })
            .where(eq(schema.incidents.id, activeIncident.id));
        }
      }

      await db
        .update(schema.monitors)
        .set({
          status: 'up',
          consecutiveFailures: 0,
          lastCheckedAt: nowIso,
          lastSuccessAt: nowIso,
          updatedAt: nowIso,
        })
        .where(eq(schema.monitors.id, monitor.id));
    } else {
      // Monitor is DOWN / FAILED
      const newConsecutive = (monitor.consecutiveFailures || 0) + 1;
      const threshold = productLimits.consecutiveFailuresForIncident; // 2
      const reason = failureReason || 'Probe check failed';

      if (newConsecutive >= threshold) {
        // Confirmed Failure -> Incident OPEN
        let incidentId = activeIncident?.id;

        if (!activeIncident) {
          incidentId = generateId('inc');
          await db.insert(schema.incidents).values({
            id: incidentId,
            workspaceId: monitor.workspaceId,
            targetType: 'monitor',
            targetId: monitor.id,
            targetName: monitor.name,
            targetEndpoint: monitor.url,
            state: 'open',
            failureReason: reason,
            suspectedAt: monitor.lastCheckedAt || nowIso,
            confirmedAt: nowIso,
            createdAt: nowIso,
            updatedAt: nowIso,
          });

          // Dispatch incident open notification
          if (this.dispatcher) {
            await this.dispatcher.dispatch(dbBinding, {
              workspaceId: monitor.workspaceId,
              incidentId,
              eventType: 'monitor.down',
              targetId: monitor.id,
              targetName: monitor.name,
              targetType: 'monitor',
              targetEndpoint: monitor.url,
              reason,
              timestamp: nowIso,
            });
          }
        } else if (activeIncident.state === 'suspected') {
          // Transition suspected to open
          await db
            .update(schema.incidents)
            .set({
              state: 'open',
              confirmedAt: nowIso,
              failureReason: reason,
              updatedAt: nowIso,
            })
            .where(eq(schema.incidents.id, activeIncident.id));

          if (this.dispatcher) {
            await this.dispatcher.dispatch(dbBinding, {
              workspaceId: monitor.workspaceId,
              incidentId: activeIncident.id,
              eventType: 'monitor.down',
              targetId: monitor.id,
              targetName: monitor.name,
              targetType: 'monitor',
              targetEndpoint: monitor.url,
              reason,
              timestamp: nowIso,
            });
          }
        }

        await db
          .update(schema.monitors)
          .set({
            status: 'down',
            consecutiveFailures: newConsecutive,
            lastCheckedAt: nowIso,
            lastFailureAt: nowIso,
            updatedAt: nowIso,
          })
          .where(eq(schema.monitors.id, monitor.id));
      } else {
        // Suspected failure (1 failure)
        if (!activeIncident) {
          const incidentId = generateId('inc');
          await db.insert(schema.incidents).values({
            id: incidentId,
            workspaceId: monitor.workspaceId,
            targetType: 'monitor',
            targetId: monitor.id,
            targetName: monitor.name,
            targetEndpoint: monitor.url,
            state: 'suspected',
            failureReason: reason,
            suspectedAt: nowIso,
            createdAt: nowIso,
            updatedAt: nowIso,
          });
        }

        await db
          .update(schema.monitors)
          .set({
            status: 'degraded',
            consecutiveFailures: newConsecutive,
            lastCheckedAt: nowIso,
            lastFailureAt: nowIso,
            updatedAt: nowIso,
          })
          .where(eq(schema.monitors.id, monitor.id));
      }
    }
  }

  /**
   * Handle missed heartbeat deadline
   */
  async handleMissedHeartbeat(
    dbBinding: D1Database,
    heartbeat: typeof schema.heartbeatTokens.$inferSelect
  ): Promise<void> {
    const db = drizzle(dbBinding, { schema });
    const nowIso = new Date().toISOString();

    // Check if an open incident already exists for this heartbeat
    const [existing] = await db
      .select()
      .from(schema.incidents)
      .where(
        and(
          eq(schema.incidents.targetId, heartbeat.id),
          eq(schema.incidents.targetType, 'heartbeat'),
          eq(schema.incidents.state, 'open')
        )
      )
      .limit(1);

    if (existing) {
      return; // Already open, prevent duplicate alert
    }

    const incidentId = generateId('inc');
    const reason = `Missed scheduled check-in. Expected every ${heartbeat.expectedIntervalMinutes}m + ${heartbeat.gracePeriodMinutes}m grace period.`;

    await db.insert(schema.incidents).values({
      id: incidentId,
      workspaceId: heartbeat.workspaceId,
      targetType: 'heartbeat',
      targetId: heartbeat.id,
      targetName: heartbeat.name,
      targetEndpoint: `Check-in Token: ${heartbeat.tokenPreview}`,
      state: 'open',
      failureReason: reason,
      suspectedAt: heartbeat.deadlineAt || nowIso,
      confirmedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    await db
      .update(schema.heartbeatTokens)
      .set({
        status: 'down',
        updatedAt: nowIso,
      })
      .where(eq(schema.heartbeatTokens.id, heartbeat.id));

    if (this.dispatcher) {
      await this.dispatcher.dispatch(dbBinding, {
        workspaceId: heartbeat.workspaceId,
        incidentId,
        eventType: 'heartbeat.missed',
        targetId: heartbeat.id,
        targetName: heartbeat.name,
        targetType: 'heartbeat',
        targetEndpoint: heartbeat.tokenPreview,
        reason,
        timestamp: nowIso,
      });
    }
  }

  /**
   * Handle heartbeat recovery when check-in arrives after being down
   */
  async handleHeartbeatRecovered(
    dbBinding: D1Database,
    heartbeat: typeof schema.heartbeatTokens.$inferSelect
  ): Promise<void> {
    const db = drizzle(dbBinding, { schema });
    const nowIso = new Date().toISOString();

    const [activeIncident] = await db
      .select()
      .from(schema.incidents)
      .where(
        and(
          eq(schema.incidents.targetId, heartbeat.id),
          eq(schema.incidents.targetType, 'heartbeat'),
          eq(schema.incidents.state, 'open')
        )
      )
      .limit(1);

    if (activeIncident) {
      const suspectedTime = new Date(activeIncident.suspectedAt).getTime();
      const resolvedTime = new Date(nowIso).getTime();
      const durationSeconds = Math.max(
        1,
        Math.round((resolvedTime - suspectedTime) / 1000)
      );

      await db
        .update(schema.incidents)
        .set({
          state: 'resolved',
          resolvedAt: nowIso,
          durationSeconds,
          updatedAt: nowIso,
        })
        .where(eq(schema.incidents.id, activeIncident.id));

      if (this.dispatcher) {
        await this.dispatcher.dispatch(dbBinding, {
          workspaceId: heartbeat.workspaceId,
          incidentId: activeIncident.id,
          eventType: 'heartbeat.recovered',
          targetId: heartbeat.id,
          targetName: heartbeat.name,
          targetType: 'heartbeat',
          targetEndpoint: heartbeat.tokenPreview,
          reason: 'Scheduled heartbeat received. Service reporting on time.',
          timestamp: nowIso,
        });
      }
    }
  }
}
