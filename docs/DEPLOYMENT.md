# Jobwhistle — Production Deployment Guide

**Frontend Platform:** Vercel Free / Any Node or Edge host  
**API & Scheduler Platform:** Cloudflare Workers (Free)  
**Database:** Cloudflare D1 (Free)  
**Email Delivery:** Resend (Free Tier)  

---

## 1. Cloudflare D1 Database Setup

1. Login to Cloudflare CLI:
   ```bash
   pnpm dlx wrangler login
   ```
2. Create D1 database:
   ```bash
   pnpm dlx wrangler d1 create jobwhistle-production
   ```
3. Copy the returned `database_id` into `apps/api/wrangler.toml`.
4. Apply database migrations:
   ```bash
   pnpm --filter @jobwhistle/api exec wrangler d1 execute jobwhistle-production --file=./drizzle/0000_messy_jane_foster.sql
   ```

---

## 2. Deploy Backend API & Scheduler

1. Configure environment secrets in Cloudflare Workers:
   ```bash
   cd apps/api
   wrangler secret put RESEND_API_KEY
   wrangler secret put CRON_SECRET
   ```
2. Deploy the Worker:
   ```bash
   pnpm --filter @jobwhistle/api deploy
   ```
   The cron trigger `*/1 * * * *` will automatically activate to run probe checks every minute.

---

## 3. Deploy Frontend on Vercel

1. Link repository to Vercel.
2. Set root directory to `apps/web`.
3. Configure environment variables:
   - `NEXT_PUBLIC_APP_URL`: `https://jobwhistle.codebrise.com`
   - `NEXT_PUBLIC_API_URL`: `https://api.jobwhistle.codebrise.com`
4. Deploy!
