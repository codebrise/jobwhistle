# Jobwhistle — Database Schema & D1 Migrations

**Engine:** Cloudflare D1 (SQLite-compatible serverless database)  
**ORM:** Drizzle ORM  
**Migrations:** `apps/api/drizzle/`

---

## 1. Tables & Relationships

### `users`
- `id` (TEXT, PK): Unique user identifier (`usr_...`).
- `email` (TEXT, UNIQUE): Normalized lowercase email.
- `password_hash` (TEXT): PBKDF2 hash formatted `pbkdf2:100000:<salt>:<hash>`.
- `name` (TEXT): User display name.
- `email_verified` (INTEGER): Boolean flag.
- `created_at`, `updated_at` (TEXT): ISO 8601 timestamps.

### `workspaces`
- `id` (TEXT, PK): Workspace identifier (`ws_...`).
- `name` (TEXT): Workspace name.
- `slug` (TEXT, UNIQUE): URL-friendly slug.
- `owner_id` (TEXT, FK -> users.id).

### `monitors`
- `id` (TEXT, PK): Monitor identifier (`mon_...`).
- `workspace_id` (TEXT, FK -> workspaces.id).
- `name` (TEXT): Friendly label.
- `url` (TEXT): Verified HTTP/HTTPS URL.
- `method` (TEXT): `GET`, `HEAD`, `POST`.
- `interval_minutes` (INTEGER): Scheduled frequency (1, 5, 10, etc.).
- `timeout_seconds` (INTEGER): Hard request timeout (1-15s).
- `expected_status_code` (INTEGER): Target response code (default 200).
- `status` (TEXT): `up`, `down`, `degraded`, `paused`, `pending`.
- `consecutive_failures` (INTEGER): Consecutive probe fail count.
- `next_check_at` (TEXT): Indexed timestamp determining schedule dispatch.
- `active` (INTEGER): Boolean active toggle.

### `monitor_checks`
- `id` (TEXT, PK): Check record identifier (`chk_...`).
- `monitor_id` (TEXT, FK -> monitors.id ON DELETE CASCADE).
- `status_code` (INTEGER): Received HTTP status code or null.
- `response_time_ms` (INTEGER): Measured latency in milliseconds.
- `is_up` (INTEGER): Boolean success flag.
- `error_message` (TEXT): Diagnostic string if probe failed.
- `created_at` (TEXT): Execution timestamp.

### `heartbeat_tokens`
- `id` (TEXT, PK): Heartbeat identifier (`hb_...`).
- `workspace_id` (TEXT, FK -> workspaces.id).
- `name` (TEXT): Job label.
- `token_hash` (TEXT, UNIQUE): SHA-256 hash of the secret check-in token.
- `token_preview` (TEXT): Obfuscated preview (e.g. `whistle_hb_9f...3a`).
- `expected_interval_minutes` (INTEGER): Expected ping frequency.
- `grace_period_minutes` (INTEGER): Buffer period before declaring failure.
- `status` (TEXT): `up`, `down`, `pending`, `paused`.
- `last_check_in_at` (TEXT): Timestamp of last ping received.
- `next_expected_at` (TEXT): Expected next check-in.
- `deadline_at` (TEXT): Indexed deadline (`next_expected_at + grace_period`).

### `incidents`
- `id` (TEXT, PK): Incident identifier (`inc_...`).
- `workspace_id` (TEXT, FK -> workspaces.id).
- `target_type` (TEXT): `monitor` or `heartbeat`.
- `target_id` (TEXT): Associated monitor or heartbeat ID.
- `target_name` (TEXT): Cached target friendly name.
- `target_endpoint` (TEXT): Target URL or token preview.
- `state` (TEXT): `suspected`, `open`, `resolved`.
- `failure_reason` (TEXT): Diagnosed failure reason.
- `suspected_at` (TEXT): First detection timestamp.
- `confirmed_at` (TEXT): Incident confirmation timestamp (after 2 consecutive fails).
- `resolved_at` (TEXT): Recovery timestamp.
- `duration_seconds` (INTEGER): Total outage duration in seconds.

### `notification_channels` & `notification_deliveries`
- Stores channel destinations (email, webhook) and immutable delivery audit logs per incident.

