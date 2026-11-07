import { eq, and, lte } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../db/schema';
import { executeHttpCheck } from './http-checker';
import { IncidentLifecycleService } from './incident-lifecycle';
import { NotificationDispatcher } from '../notification/dispatcher';
import { generateId } from '../../security/crypto';

export class MonitoringDispatcher {
  private incidentLifecycle: IncidentLifecycleService;

  constructor(resendApiKey?: string, emailFrom?: string) {
    const notificationDispatcher = new NotificationDispatcher(resendApiKey, emailFrom);
    this.incidentLifecycle = new IncidentLifecycleService(notificationDispatcher);
  }

  /**
   * Scan and process due monitors in bounded batches
   */
  async processDueMonitors(dbBinding: D1Database, batchSize = 10): Promise<{
    processed: number;
    errors: number;
  }> {
    const db = drizzle(dbBinding, { schema });
    const nowIso = new Date().toISOString();

    // Query due monitors where nextCheckAt <= now and active = true
    const dueMonitors = await db
      .select()
      .from(schema.monitors)
      .where(
        and(
          lte(schema.monitors.nextCheckAt, nowIso),
          eq(schema.monitors.active, true)
        )
      )
      .limit(batchSize);

    if (dueMonitors.length === 0) {
      return { processed: 0, errors: 0 };
    }

    let errorCount = 0;

    // Process concurrently up to batchSize
    await Promise.all(
      dueMonitors.map(async (monitor) => {
        try {
          // 1. Run HTTP check
          const result = await executeHttpCheck({
            url: monitor.url,
            method: monitor.method,
            expectedStatusCode: monitor.expectedStatusCode,
            timeoutSeconds: monitor.timeoutSeconds,
          });

          // 2. Persist check result
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

          // 3. Update nextCheckAt (now + intervalMinutes)
          const nextCheckDate = new Date(
            Date.now() + monitor.intervalMinutes * 60 * 1000
          );
          await db
            .update(schema.monitors)
            .set({
              nextCheckAt: nextCheckDate.toISOString(),
            })
            .where(eq(schema.monitors.id, monitor.id));

          // 4. Update incident state machine
          await this.incidentLifecycle.handleMonitorCheckResult(
            dbBinding,
            monitor,
            result.isUp,
            result.errorMessage
          );
        } catch (err) {
          errorCount++;
          console.error(`Error checking monitor ${monitor.id}:`, err);
        }
      })
    );

    return { processed: dueMonitors.length, errors: errorCount };
  }

  /**
   * Scan heartbeats for missed deadlines
   */
  async processMissedHeartbeats(dbBinding: D1Database, batchSize = 20): Promise<{
    missed: number;
  }> {
    const db = drizzle(dbBinding, { schema });
    const nowIso = new Date().toISOString();

    const overdueHeartbeats = await db
      .select()
      .from(schema.heartbeatTokens)
      .where(
        and(
          lte(schema.heartbeatTokens.deadlineAt, nowIso),
          eq(schema.heartbeatTokens.active, true)
        )
      )
      .limit(batchSize);

    let missedCount = 0;

    for (const hb of overdueHeartbeats) {
      if (hb.status !== 'down') {
        await this.incidentLifecycle.handleMissedHeartbeat(dbBinding, hb);
        missedCount++;
      }
    }

    return { missed: missedCount };
  }

  /**
   * Data retention cleanup: Delete raw monitor checks older than retention days (e.g. 7 days)
   * while strictly preserving active monitors and incidents.
   */
  async cleanupOldChecks(dbBinding: D1Database, retentionDays = 7): Promise<number> {
    const db = drizzle(dbBinding, { schema });
    const cutoffDate = new Date(
      Date.now() - retentionDays * 24 * 60 * 60 * 1000
    ).toISOString();

    const deleted = await db
      .delete(schema.monitorChecks)
      .where(lte(schema.monitorChecks.createdAt, cutoffDate))
      .returning({ id: schema.monitorChecks.id });

    return deleted.length;
  }
}
