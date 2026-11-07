import { z } from 'zod';

export const NotificationProviderSchema = z.enum([
  'email',
  'webhook',
  'telegram',
  'slack',
  'discord',
  'ntfy',
]);
export type NotificationProvider = z.infer<typeof NotificationProviderSchema>;

export const NotificationEventTypeSchema = z.enum([
  'monitor.down',
  'monitor.up',
  'heartbeat.missed',
  'heartbeat.recovered',
]);
export type NotificationEventType = z.infer<typeof NotificationEventTypeSchema>;

export const CreateEmailChannelSchema = z.object({
  name: z.string().min(2).max(64),
  destination: z.string().email('Must be a valid email address'),
  provider: z.literal('email').default('email'),
});

export const CreateWebhookChannelSchema = z.object({
  name: z.string().min(2).max(64),
  destination: z.string().url('Must be a valid HTTP or HTTPS webhook URL'),
  provider: z.literal('webhook'),
});

export const CreateNotificationChannelSchema = z.discriminatedUnion('provider', [
  CreateEmailChannelSchema,
  CreateWebhookChannelSchema,
]);
export type CreateNotificationChannelInput = z.infer<
  typeof CreateNotificationChannelSchema
>;

export interface NotificationChannelRecord {
  id: string;
  workspaceId: string;
  provider: NotificationProvider;
  name: string;
  destination: string; // obfuscated if webhook secret, or email address
  isVerified: boolean;
  active: boolean;
  createdAt: string;
}

export interface NotificationDeliveryRecord {
  id: string;
  workspaceId: string;
  incidentId: string;
  channelId: string;
  provider: NotificationProvider;
  eventType: NotificationEventType;
  status: 'sent' | 'failed' | 'retrying';
  errorMessage: string | null;
  sentAt: string;
}

export interface NotificationEvent {
  workspaceId: string;
  incidentId: string;
  eventType: NotificationEventType;
  targetId: string;
  targetName: string;
  targetType: 'monitor' | 'heartbeat';
  targetEndpoint: string;
  reason: string;
  timestamp: string;
}

