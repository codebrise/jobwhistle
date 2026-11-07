# Jobwhistle — Product Requirements Document (PRD)

**Version:** 1.0.0 (V1 Beta)  
**Status:** Implemented  
**Target Audience:** Indie hackers, backend developers, freelancers, agency owners, and small engineering teams.

---

## 1. Feature Specifications

### 1.1 HTTP & HTTPS Uptime Monitoring
- **Protocols:** HTTP, HTTPS.
- **Methods:** GET (default for V1), HEAD, POST.
- **Intervals:** 1m, 5m (default), 10m, 15m, 30m, 60m.
- **Timeout:** 1s to 15s (default 10s).
- **Status Evaluation:** Compares response status against `expectedStatusCode` (default 200).
- **Redirects:** Manual redirect handling up to 5 hops with SSRF destination re-verification at every hop.
- **Response Guard:** Body consumption truncated at 512 KB to prevent memory bloat.

### 1.2 Heartbeat Monitoring (Cron & Scheduled Jobs)
- **Check-in Modes:** HTTP GET or POST request to unique secret endpoint.
- **Token Security:** 192-bit cryptographic entropy; only SHA-256 hash stored.
- **Interval & Grace:** Configurable expected frequency (e.g. 60m) + buffer grace period (e.g. 15m).
- **Deadline Calculation:** `deadline = lastCheckInAt + expectedInterval + gracePeriod`.
- **Missed Detection:** If `now > deadline`, status transitions to `down` and incident opens.

### 1.3 Incident Lifecycle Engine
- **States:** `suspected` (1 failure) &rarr; `open` (2 consecutive failures) &rarr; `resolved` (probe succeeds or check-in arrives).
- **Duration Tracking:** Outage duration recorded in integer seconds.
- **Deduplication:** Exactly one incident alert and one recovery alert dispatched per event cycle.

### 1.4 Notification Delivery
- **Provider:** Resend transactional email API with HTML and plain-text fallback templates.
- **Channels:** Up to 2 active channels per workspace in free tier.
- **Preferences:** Granular toggles for `notifyOnDown` and `notifyOnRecovery`.
