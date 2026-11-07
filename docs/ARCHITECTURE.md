# Jobwhistle — System Architecture & Data Flow

```
                     +---------------------------------------+
                     |         Web Application (Next.js)     |
                     |  - Marketing Website                  |
                     |  - Interactive Customer Dashboard     |
                     +-------------------+-------------------+
                                         |
                                         | HTTPS REST API (JSON)
                                         v
                     +---------------------------------------+
                     |       Cloudflare Worker API (Hono)    |
                     |  - Authentication & Session Guard     |
                     |  - SSRF Defense Engine                |
                     |  - Resource CRUD Handlers             |
                     +-------------------+-------------------+
                                         |
              +--------------------------+--------------------------+
              |                                                     |
              v                                                     v
+-----------------------------+                       +-----------------------------+
|    Cloudflare D1 Database   |                       |    Cron Trigger Dispatcher  |
|  - Users & Workspaces       |                       |  - Runs every 1 minute      |
|  - Monitors & Check History |                       |  - Bounded batch probing    |
|  - Heartbeat Hashes         |                       |  - Heartbeat deadline scan  |
|  - Incidents & Deliveries   |                       +--------------+--------------+
+-----------------------------+                                      |
                                                                     | Incident / Recovery
                                                                     v
                                                      +-----------------------------+
                                                      | Resend Transactional Email  |
                                                      |  - Verified DKIM & SPF      |
                                                      |  - Down & Recovery Alerts   |
                                                      +-----------------------------+
```

---

## 1. Monorepo Organization

The project uses `pnpm workspaces`:

- `apps/web`: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, Recharts.
- `apps/api`: Hono backend running on Cloudflare Workers edge runtime with Drizzle ORM.
- `packages/contracts`: Shared TypeScript types and Zod schemas.
- `packages/config`: Shared brand constants, theme tokens, and product limits.
- `assets/`: Master brand assets (SVGs, PNGs, mobile app icons, favicons, illustrations).
- `docs/`: Complete product, architecture, and security specifications.
