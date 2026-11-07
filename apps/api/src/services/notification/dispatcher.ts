import { eq, and } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../db/schema';
import type { NotificationEvent } from '@jobwhistle/contracts';
import { EmailNotificationProvider } from './email';
import { generateId } from '../../security/crypto';

export class NotificationDispatcher {
  private emailProvider: EmailNotificationProvider;

  constructor(resendApiKey?: string, emailFrom?: string) {
    this.emailProvider = new EmailNotificationProvider(resendApiKey, emailFrom);
  }

  async dispatch(dbBinding: D1Database, event: NotificationEvent): Promise<void> {
    const db = drizzle(dbBinding, { schema });

    // 1. Check workspace notification preferences
    const [prefs] = await db
      .select()
      .from(schema.notificationPreferences)
      .where(eq(schema.notificationPreferences.workspaceId, event.workspaceId))
      .limit(1);

    const isRecovery =
      event.eventType === 'monitor.up' || event.eventType === 'heartbeat.recovered';

    if (prefs) {
      if (isRecovery && !prefs.notifyOnRecovery) {
        return; // Suppressed by user preference
      }
      if (!isRecovery && !prefs.notifyOnDown) {
        return; // Suppressed by user preference
      }
    }

    // 2. Query active notification channels for this workspace
    const channels = await db
      .select()
      .from(schema.notificationChannels)
      .where(
        and(
          eq(schema.notificationChannels.workspaceId, event.workspaceId),
          eq(schema.notificationChannels.active, true)
        )
      );

    if (channels.length === 0) {
      return;
    }

    // 3. Deliver to each channel with deduplication
    for (const channel of channels) {
      // Check if already sent for this incident + channel + eventType
      const existing = await db
        .select()
        .from(schema.notificationDeliveries)
        .where(
          and(
            eq(schema.notificationDeliveries.incidentId, event.incidentId),
            eq(schema.notificationDeliveries.channelId, channel.id),
            eq(schema.notificationDeliveries.eventType, event.eventType),
            eq(schema.notificationDeliveries.status, 'sent')
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Already sent, avoid duplicate spam
        continue;
      }

      let result: { success: boolean; errorMessage?: string } = {
        success: false,
        errorMessage: 'Unknown provider',
      };

      if (channel.provider === 'email') {
        result = await this.emailProvider.send(event, channel.destination);
      }

      // Record delivery attempt
      await db.insert(schema.notificationDeliveries).values({
        id: generateId('deliv'),
        workspaceId: event.workspaceId,
        incidentId: event.incidentId,
        channelId: channel.id,
        provider: channel.provider,
        eventType: event.eventType,
        status: result.success ? 'sent' : 'failed',
        errorMessage: result.errorMessage || null,
        sentAt: new Date().toISOString(),
      });
    }
  }
}
