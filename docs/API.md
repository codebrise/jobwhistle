# Jobwhistle — REST API Reference

**Base URL:** `https://api.jobwhistle.codebrise.com/api/v1`  
**Authentication:** `Authorization: Bearer <session_token>` or cookie `whistle_session`.

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new user, default workspace, and default email notification channel.
```json
// Request
{
  "name": "Alex Dev",
  "email": "alex@domain.com",
  "password": "SecurePassword123!"
}
// Response (201 Created)
{
  "success": true,
  "data": {
    "user": { "id": "usr_...", "email": "alex@domain.com", "name": "Alex Dev" },
    "workspace": { "id": "ws_...", "name": "Alex Dev's Workspace" },
    "token": "whistle_sess_...",
    "expiresAt": "2026-12-07T..."
  }
}
```

### `POST /auth/login`
Authenticates credentials using PBKDF2 Web Crypto.
```json
// Request
{
  "email": "alex@domain.com",
  "password": "SecurePassword123!"
}
```

### `GET /auth/me`
Retrieves authenticated profile and active workspace.

---

## 2. Monitor Endpoints

### `GET /monitors`
Lists all monitors with 24h & 7d uptime percentages and average latency.

### `POST /monitors`
Creates a monitor, validates URL against SSRF and wildcard DNS, and performs an initial connectivity probe immediately.
```json
{
  "name": "Production API",
  "url": "https://api.domain.com/health",
  "method": "GET",
  "intervalMinutes": 5,
  "timeoutSeconds": 10,
  "expectedStatusCode": 200,
  "active": true
}
```

### `GET /monitors/:id`
Retrieves single monitor details along with recent probe check history.

### `PATCH /monitors/:id`
Updates monitor configuration (strictly scoped to owning workspace).

### `POST /monitors/:id/pause`
Pauses probe checks for the monitor. Sets `active: false, status: 'paused'`.

### `POST /monitors/:id/resume`
Resumes probe checks for the monitor. Sets `active: true, status: 'pending'`.

### `DELETE /monitors/:id`
Permanently deletes monitor and cascades check telemetry.

### `POST /monitors/:id/check-now`
Triggers an immediate on-demand probe check, updates state, and returns latest latency.

---

## 3. Heartbeat Endpoints

### `GET /heartbeats`
Lists all cron heartbeats for the workspace.

### `POST /heartbeats`
Creates a heartbeat, generates a cryptographically random secret token, stores its SHA-256 hash, and returns the check-in URL.
```json
{
  "name": "Daily Backup",
  "expectedIntervalMinutes": 1440,
  "gracePeriodMinutes": 30
}
```

### `GET /heartbeats/:id`
Retrieves heartbeat details, recent check-in timestamps, and integration code snippets (curl, bash, node, python, php).

### `POST /heartbeats/:id/pause`
Pauses heartbeat tracking.

### `POST /heartbeats/:id/resume`
Resumes heartbeat tracking, resetting expectation deadline.

### `POST /heartbeats/:id/rotate-token`
Generates a new cryptographically random token, hashes and saves it, and immediately invalidates the previous token.

### `DELETE /heartbeats/:id`
Permanently deletes heartbeat monitor and check-in history.

### `GET /heartbeats/check-in/:token` or `POST /heartbeats/check-in/:token`
Public check-in endpoint for scheduled jobs. Hashes incoming token, records arrival timestamp, recalculates deadline, and closes any open incident.

---

## 4. Incidents Endpoints

### `GET /incidents`
Lists incidents with optional `?state=open` or `?state=resolved` query filters.

### `GET /incidents/:id`
Retrieves detailed incident record with full chronological event timeline.

---

## 5. Notification Endpoints

### `GET /notifications/channels`
Lists notification channels configured for the workspace.

### `POST /notifications/channels`
Adds an alert channel (V1 supports email; webhooks/Slack/Discord planned for V1.1).
```json
{
  "name": "Primary SRE On-Call",
  "provider": "email",
  "destination": "sre-alerts@company.com"
}
```

### `DELETE /notifications/channels/:id`
Removes notification channel.

### `GET /notifications/preferences`
Retrieves alerting preferences (`notifyOnDown`, `notifyOnRecovery`).

### `PATCH /notifications/preferences`
Updates alerting preferences.

---

## 6. Overview & System Telemetry

### `GET /overview`
Returns workspace telemetry metrics (monitors, heartbeats, open incidents, rolling uptime, avg latency).

---

## 7. Cron Scheduler Dispatcher

### `POST /cron/dispatch`
Invoked on schedule by Cloudflare Cron Triggers or external runner. Requires `X-Jobwhistle-Cron-Secret` header matching `CRON_SECRET`.
