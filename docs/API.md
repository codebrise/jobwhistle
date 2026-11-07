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
// Response (200 OK)
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
Lists all monitors with 24h & 7d uptime percentages and P95 latency.

### `POST /monitors`
Creates a monitor and performs an initial connectivity probe immediately.
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

### `GET /heartbeats/check-in/:token` or `POST /heartbeats/check-in/:token`
Public ping check-in endpoint for scheduled jobs. Hashes incoming token, records arrival timestamp, recalculates deadline, and closes any open incident.

---

## 4. Incidents Endpoints

### `GET /incidents`
Lists incidents with optional `?state=open` or `?state=resolved` query filters.

### `GET /incidents/:id`
Retrieves detailed incident record with full chronological event timeline.
