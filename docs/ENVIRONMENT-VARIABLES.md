# Jobwhistle — Environment Variables Reference

---

## 1. Frontend (`apps/web/.env.example`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public base URL of the web dashboard | `https://jobwhistle.codebrise.com` |
| `NEXT_PUBLIC_API_URL` | Base URL of the Jobwhistle Cloudflare API | `https://api.jobwhistle.codebrise.com` |

---

## 2. Backend (`apps/api/.env.example`)

| Variable | Description | Example |
|---|---|---|
| `APP_ENV` | Application environment (`production`, `development`) | `production` |
| `APP_URL` | Web application origin for notification links | `https://jobwhistle.codebrise.com` |
| `WEB_ORIGIN` | Allowed origin for CORS headers | `https://jobwhistle.codebrise.com` |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier | `<account_id>` |
| `CLOUDFLARE_DATABASE_ID` | Cloudflare D1 database UUID | `<uuid>` |
| `RESEND_API_KEY` | Resend API key for transactional emails | `re_123456789...` |
| `EMAIL_FROM` | Sender address for alert emails | `Jobwhistle <alerts@jobwhistle.codebrise.com>` |
| `CRON_SECRET` | Secret token to authenticate manual `/api/v1/cron/dispatch` calls | `<random_hex>` |
