# Jobwhistle — Notification Architecture & Email Delivery

---

## 1. Provider Adapter Pattern

Jobwhistle uses an extensible adapter pattern:

```typescript
export interface NotificationProvider {
  id: string;
  send(event: NotificationEvent, destination: string): Promise<NotificationResult>;
  validateDestination(destination: string): boolean;
}
```

- **V1 Provider:** `EmailNotificationProvider` (powered by Resend).
- **V1.1 Planned:** Telegram, Discord, Slack, Generic Webhooks, ntfy.

---

## 2. Deduplication & Idempotency

Before sending an alert, the `NotificationDispatcher` checks the `notification_deliveries` table. If an alert has already been successfully delivered for that `(incidentId, channelId, eventType)` tuple, the duplicate send is suppressed. This guarantees that developers receive **exactly one email** when a service goes down, and **exactly one email** when it recovers.

