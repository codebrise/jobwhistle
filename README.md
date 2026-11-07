# Jobwhistle

> **Know when something goes quiet.**  
> *Jobwhistle by CodeBrise*

Lightweight website uptime, API endpoint, and scheduled-job monitoring for developers, indie hackers, and small engineering teams.

---

## Overview

Jobwhistle provides simple, reliable, and calm monitoring without enterprise bloat:
- **HTTP & HTTPS Probing:** Continuous edge checks with status code assertions, latency tracking, and strict SSRF defenses.
- **Cron Job Heartbeats:** Receive periodic HTTP check-ins from backups and batch jobs; get alerted immediately when a deadline passes.
- **Incident Lifecycle:** Two-check consecutive failure confirmation suppresses transient flutters.
- **Calm Email Alerts:** Transactional email delivery via Resend with deduplication and downtime duration summaries.

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts.
- **Backend API:** Hono on Cloudflare Workers edge runtime.
- **Database:** Cloudflare D1 serverless SQLite with Drizzle ORM.
- **Scheduler:** Cloudflare Cron Triggers (`*/1 * * * *`).
- **Emails:** Resend transactional email API.
- **Workspace:** `pnpm` monorepo.

---

## Monorepo Layout

```text
jobwhistle/
├── apps/
│   ├── web/            # Next.js marketing website & customer dashboard
│   └── api/            # Hono backend API and monitoring engine
├── packages/
│   ├── contracts/      # Shared TypeScript types & Zod schemas
│   └── config/         # Shared brand tokens & product limits
├── assets/             # Vector SVGs, icons, favicons, app icons, social banners
├── docs/               # Full technical documentation suite
└── scripts/            # Asset generation and utility scripts
```

---

## Quickstart

### Prerequisites
- Node.js 18+ (tested on Node 22 & 24)
- pnpm 10+

### Installation & Development
```bash
# Clone and install dependencies
git clone https://github.com/codebrise/jobwhistle.git
cd jobwhistle
pnpm install

# Run backend test suite
pnpm --filter @jobwhistle/api test

# Typecheck all packages and apps
pnpm -r run typecheck

# Start local web development server
pnpm dev:web

# Build for production
pnpm build
```

---

## Documentation

Full documentation is available in `docs/`:
- [Product Strategy](docs/PRODUCT.md)
- [PRD & Specifications](docs/PRD.md)
- [Brand Identity Guidelines](docs/BRAND-GUIDELINES.md)
- [Design System & Tokens](docs/DESIGN-SYSTEM.md)
- [Architecture & Data Flow](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE.md)
- [REST API Reference](docs/API.md)
- [Security & SSRF Mitigation](docs/SECURITY.md)
- [Monitoring Engine & Scheduler](docs/MONITORING-ENGINE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Roadmap](docs/ROADMAP.md)

---

## License

Jobwhistle is developed and maintained by **CodeBrise**. All rights reserved.
