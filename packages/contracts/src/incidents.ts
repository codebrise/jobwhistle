import { z } from 'zod';

export const IncidentStateSchema = z.enum(['suspected', 'open', 'resolved']);
export type IncidentState = z.infer<typeof IncidentStateSchema>;

export const IncidentTargetTypeSchema = z.enum(['monitor', 'heartbeat']);
export type IncidentTargetType = z.infer<typeof IncidentTargetTypeSchema>;

export interface IncidentRecord {
  id: string;
  workspaceId: string;
  targetType: IncidentTargetType;
  targetId: string;
  targetName: string;
  targetUrlOrToken?: string;
  targetEndpoint: string;
  state: IncidentState;
  failureReason: string;
  suspectedAt: string;
  confirmedAt: string | null;
  resolvedAt: string | null;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentWithDetails extends IncidentRecord {
  timeline: {
    timestamp: string;
    event: 'suspected' | 'confirmed' | 'notification_sent' | 'resolved';
    message: string;
  }[];
}
