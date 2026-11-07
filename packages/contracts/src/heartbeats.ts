import { z } from 'zod';
import { productLimits } from '@jobwhistle/config';

export const HeartbeatStatusSchema = z.enum([
  'up',
  'down',
  'pending',
  'paused',
]);
export type HeartbeatStatus = z.infer<typeof HeartbeatStatusSchema>;

export const CreateHeartbeatSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(64),
  expectedIntervalMinutes: z
    .number()
    .int()
    .min(1, 'Minimum interval is 1 minute')
    .max(43200, 'Maximum interval is 30 days (43200 minutes)'), // up to 30 days
  gracePeriodMinutes: z
    .number()
    .int()
    .min(1, 'Minimum grace period is 1 minute')
    .max(1440, 'Maximum grace period is 24 hours')
    .default(productLimits.defaultGracePeriodMinutes),
  active: z.boolean().default(true),
});
export type CreateHeartbeatInput = z.infer<typeof CreateHeartbeatSchema>;

export const UpdateHeartbeatSchema = CreateHeartbeatSchema.partial();
export type UpdateHeartbeatInput = z.infer<typeof UpdateHeartbeatSchema>;

export interface HeartbeatRecord {
  id: string;
  workspaceId: string;
  name: string;
  tokenPreview: string; // e.g. "whistle_hb_9f...3a"
  status: HeartbeatStatus;
  expectedIntervalMinutes: number;
  gracePeriodMinutes: number;
  lastCheckInAt: string | null;
  nextExpectedAt: string | null;
  deadlineAt: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HeartbeatCheckInRecord {
  id: string;
  heartbeatId: string;
  receivedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  durationMs: number | null;
}

export interface HeartbeatWithDetails extends HeartbeatRecord {
  checkInUrl: string;
  recentCheckIns: HeartbeatCheckInRecord[];
  activeIncidentId: string | null;
}
