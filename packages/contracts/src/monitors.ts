import { z } from 'zod';
import { productLimits } from '@jobwhistle/config';

export const MonitorStatusSchema = z.enum([
  'up',
  'down',
  'degraded',
  'paused',
  'pending',
]);
export type MonitorStatus = z.infer<typeof MonitorStatusSchema>;

export const HttpMethodSchema = z.enum(['GET', 'HEAD', 'POST']);
export type HttpMethod = z.infer<typeof HttpMethodSchema>;

export const CreateMonitorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(64),
  url: z
    .string()
    .url('Must be a valid URL')
    .refine(
      (val) => val.startsWith('http://') || val.startsWith('https://'),
      'URL must start with http:// or https://'
    ),
  intervalMinutes: z
    .number()
    .int()
    .min(productLimits.minCheckIntervalMinutes)
    .max(60)
    .default(productLimits.checkIntervalMinutes),
  timeoutSeconds: z
    .number()
    .int()
    .min(1)
    .max(productLimits.maxTimeoutSeconds)
    .default(productLimits.defaultTimeoutSeconds),
  method: HttpMethodSchema.default('GET'),
  expectedStatusCode: z.number().int().min(100).max(599).default(200),
  active: z.boolean().default(true),
});
export type CreateMonitorInput = z.infer<typeof CreateMonitorSchema>;

export const UpdateMonitorSchema = CreateMonitorSchema.partial();
export type UpdateMonitorInput = z.infer<typeof UpdateMonitorSchema>;

export interface MonitorRecord {
  id: string;
  workspaceId: string;
  name: string;
  url: string;
  method: HttpMethod;
  intervalMinutes: number;
  timeoutSeconds: number;
  expectedStatusCode: number;
  status: MonitorStatus;
  consecutiveFailures: number;
  lastCheckedAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  nextCheckAt?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MonitorCheckRecord {
  id: string;
  monitorId: string;
  statusCode: number | null;
  responseTimeMs: number;
  isUp: boolean;
  errorMessage: string | null;
  createdAt: string;
}

export interface MonitorWithStats extends MonitorRecord {
  uptimePercentage24h: number;
  uptimePercentage7d: number;
  avgResponseTimeMs: number;
  recentChecks: MonitorCheckRecord[];
  activeIncidentId: string | null;
}
