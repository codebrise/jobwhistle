# Jobwhistle — Monitoring Engine & Scheduler

---

## 1. Dispatcher Architecture

Monitoring probes run via **Cloudflare Cron Triggers** (`*/1 * * * *`):

1. **Trigger Activation:** Cloudflare Workers runtime triggers `scheduled(event, env, ctx)`.
2. **Querying Due Monitors:** Dispatcher selects up to 15 monitors where `nextCheckAt <= now` and `active = 1`.
3. **Concurrent Execution:** Probes run in parallel using `Promise.all()` with individual timeout controllers.
4. **Result Persistence:** Raw metrics (status code, latency ms, success flag) are written to `monitor_checks`.
5. **Schedule Advancement:** `nextCheckAt` is updated to `now + intervalMinutes`.
6. **Incident State Machine:** Evaluates consecutive failures:
   - Check succeeds: If active incident exists, marks `resolved`, triggers recovery email alert.
   - Check fails: Increments `consecutive_failures`. If threshold (2) reached, creates open incident and triggers alert.
7. **Heartbeat Scanner:** Scans for overdue heartbeats where `deadlineAt <= now` and status != `down`.

---

## 2. Retention & Housekeeping

Raw check records are purged after **7 days** to respect Cloudflare D1 storage limits. Aggregated uptime percentages (24h and 7d) and historical incident logs are permanently preserved.
