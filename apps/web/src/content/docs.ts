export interface DocArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  content: string;
}

export const docArticles: Record<string, DocArticle> = {
  index: {
    slug: '',
    title: 'Jobwhistle Documentation',
    category: 'Getting Started',
    description: 'Learn how to set up uptime monitoring, cron heartbeats, and alert delivery with Jobwhistle.',
    content: `
### What is Jobwhistle?

Jobwhistle is a lightweight, developer-focused monitoring platform built by **CodeBrise**. It is designed to solve two core reliability challenges without enterprise overhead:

1. **Website & API Uptime:** Continually probe endpoints over HTTP/HTTPS from the edge to ensure they respond with the expected status code within strict latency bounds.
2. **Scheduled-Job Heartbeats:** Receive periodic HTTP pings from cron jobs, workers, and background scripts, alerting you whenever a scheduled deadline passes without a check-in.

---

### Key Product Principles

- **No False Alarms:** Transient network blips are filtered through a mandatory two-check consecutive failure confirmation rule before declaring an incident.
- **SSRF Defense by Default:** Target URLs are validated against private IP ranges, loopback addresses, cloud metadata services, and dangerous ports.
- **Quiet Recovery:** When an incident resolves, a recovery notification is dispatched with total downtime duration in seconds.
    `,
  },
  'getting-started': {
    slug: 'getting-started',
    title: 'Quickstart Guide',
    category: 'Getting Started',
    description: 'Create your first HTTP monitor or cron heartbeat in under 60 seconds.',
    content: `
### Step 1: Create an Account

Navigate to [/register](/register) and sign up with your email and password. A default workspace is automatically created, and your registered email is wired up as your primary alert channel.

### Step 2: Add an HTTP Monitor

1. Open the **Monitors** tab in your dashboard.
2. Click **New Monitor**.
3. Enter your service name (e.g. \`Production API\`) and URL (e.g. \`https://api.yourdomain.com/health\`).
4. Select your interval (default is 5 minutes) and timeout (default 10s).
5. Click **Create Monitor**. Jobwhistle will instantly perform an initial probe to verify connectivity.

### Step 3: Add a Heartbeat Monitor

1. Open the **Heartbeats** tab.
2. Click **New Heartbeat**.
3. Choose your expected interval (e.g. \`60 minutes\` for an hourly script) and grace period (e.g. \`15 minutes\`).
4. Copy the unique check-in URL containing your secret token.
5. Append a cURL call to the end of your cron command:

\`\`\`bash
# Example crontab entry
0 * * * * /usr/local/bin/my-job.sh && curl -fsS -m 10 "https://api.jobwhistle.codebrise.com/api/v1/heartbeats/check-in/whistle_hb_YOUR_TOKEN"
\`\`\`
    `,
  },
  'http-monitoring': {
    slug: 'http-monitoring',
    title: 'HTTP & HTTPS Probing',
    category: 'Core Monitoring',
    description: 'Technical details of probe execution, status code validation, and redirect handling.',
    content: `
### Probe Execution Engine

Jobwhistle runs probe checks using serverless workers distributed on the edge. Each scheduled execution follows this exact lifecycle:

1. **SSRF Validation:** The target URL is inspected against our destination filter. Blocked IPs or restricted hostnames result in immediate check rejection.
2. **Timeout Boundary:** Checks execute with an \`AbortController\` enforcing your configured timeout (max 15 seconds).
3. **Redirect Loop Defense:** HTTP 301, 302, 303, 307, and 308 redirects are followed manually up to a maximum of 5 hops. Each hop is independently re-validated against SSRF blocklists.
4. **Memory Guard:** The response body stream is capped at 512 KB to prevent probe memory starvation.
5. **Result Recording:** Roundtrip latency is measured via high-resolution timers (\`performance.now()\`) and recorded to the database.
    `,
  },
  heartbeats: {
    slug: 'heartbeats',
    title: 'Heartbeat & Cron Tracking',
    category: 'Core Monitoring',
    description: 'Detect when scheduled jobs, backups, or batch scripts fail to run.',
    content: `
### The Heartbeat Concept

When a cron job crashes due to out-of-memory errors or syntax faults, it usually fails silently without throwing an alert. Heartbeat monitoring inverts the monitoring relationship:

- You define an **Expected Interval** (e.g. 1440 minutes for daily backups).
- You define a **Grace Period** (e.g. 30 minutes to account for fluctuating execution runtimes).
- The **Deadline** is calculated as \`LastCheckIn + ExpectedInterval + GracePeriod\`.
- If the current wall-clock time exceeds the Deadline, Jobwhistle automatically opens an incident and sends an email notification.

### Token Security

Heartbeat check-in tokens are generated using 192 bits of cryptographic entropy. Only the **SHA-256 hash** of the token is stored in Jobwhistle databases, ensuring that leaked database backups cannot compromise check-in URLs.
    `,
  },
  notifications: {
    slug: 'notifications',
    title: 'Alert Notifications & Deduplication',
    category: 'Alerting & Security',
    description: 'Understand incident alerts, recovery notifications, and deduplication rules.',
    content: `
### Notification Lifecycle

Jobwhistle treats notification delivery with extreme care to avoid alert fatigue:

- **Incident Open:** When a monitor fails 2 consecutive checks, or a heartbeat misses its deadline, an incident is opened and an email is dispatched.
- **Deduplication:** Subsequent failed checks while an incident remains open do **not** generate additional emails.
- **Recovery:** As soon as an HTTP probe succeeds or a missed heartbeat checks in, the incident is closed, and an email is dispatched detailing the exact downtime duration.

### Email Delivery Provider

All emails are delivered via **Resend** using verified SPF, DKIM, and DMARC authentication from \`alerts@jobwhistle.codebrise.com\`.
    `,
  },
  api: {
    slug: 'api',
    title: 'REST API Reference',
    category: 'Alerting & Security',
    description: 'Complete documentation of the Jobwhistle REST API endpoints and schemas.',
    content: `
### Base URL

\`\`\`text
https://api.jobwhistle.codebrise.com/api/v1
\`\`\`

### Authentication

Include your session token in the \`Authorization\` header:

\`\`\`http
Authorization: Bearer whistle_sess_YOUR_TOKEN
\`\`\`

### Core Endpoints

| Method | Endpoint | Description |
|---|---|---|
| \`POST\` | \`/auth/register\` | Register user and create workspace |
| \`POST\` | \`/auth/login\` | Authenticate and obtain session token |
| \`GET\` | \`/auth/me\` | Get profile and active workspace |
| \`GET\` | \`/overview\` | Get workspace overview metrics |
| \`GET\` | \`/monitors\` | List monitors with 24h & 7d stats |
| \`POST\` | \`/monitors\` | Create a new HTTP monitor |
| \`GET\` | \`/monitors/:id\` | Get monitor details & check history |
| \`POST\` | \`/monitors/:id/check-now\` | Trigger immediate on-demand probe |
| \`GET\` | \`/heartbeats\` | List heartbeat monitors |
| \`POST\` | \`/heartbeats\` | Create heartbeat and obtain token |
| \`GET/POST\` | \`/heartbeats/check-in/:token\` | Public ping check-in endpoint |
| \`GET\` | \`/incidents\` | List incidents with timeline |
| \`GET\` | \`/notifications/channels\` | List notification channels |
    `,
  },
};

