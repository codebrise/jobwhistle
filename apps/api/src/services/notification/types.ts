import type { NotificationEvent } from '@jobwhistle/contracts';

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  errorMessage?: string;
}

export interface NotificationProvider {
  id: string;
  send(
    event: NotificationEvent,
    destination: string,
    config?: Record<string, unknown>
  ): Promise<NotificationResult>;
  validateDestination(destination: string): boolean;
}

