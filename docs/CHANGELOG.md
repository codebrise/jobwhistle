# Jobwhistle — Changelog

All notable changes to the Jobwhistle platform are documented here.

---

## [1.0.0-beta] - 2026-11-07

### Added
- **Brand & Assets:** Original Jobwhistle brand mark (geometric whistle + acoustic signal telemetry), SVG master files, complete favicon package, Android adaptive and iOS app icons, and social sharing banners.
- **Backend Architecture:** Hono framework running on Cloudflare Workers with Cloudflare D1 serverless database.
- **Database Schema & Migrations:** 13 tables covering users, workspaces, monitors, checks, heartbeats, incidents, deliveries, preferences, and sessions.
- **SSRF Defense Engine:** Strict IP/CIDR blocklists, cloud metadata shields, port filtering, and hop-by-hop redirect validation.
- **Monitoring Scheduler:** Minute-interval Cloudflare Cron Trigger executing bounded batches of due monitors with timeout boundaries.
- **Heartbeat Engine:** Cryptographic token-based cron check-in gateway with automated deadline calculation and missed execution detection.
- **Notification Engine:** Resend transactional email adapter with professional HTML and plain-text templates, deduplication, and delivery tracking.
- **Web Application & Dashboard:** Next.js 16 App Router application featuring full marketing pages, documentation portal, and interactive developer dashboard with latency charts and real-time probe telemetry.
- **Testing Suite:** 14 automated unit tests covering SSRF protection, Web Crypto PBKDF2 operations, and incident state arithmetic.
