# Jobwhistle — Product Overview & Philosophy

**Product Name:** Jobwhistle  
**Parent Brand:** CodeBrise  
**Endorsement:** Jobwhistle by CodeBrise  
**Category:** Website uptime and scheduled-job monitoring  
**Tagline:** Know when something goes quiet.  
**Secondary Tagline:** Small signals. Clear answers.  

---

## 1. Executive Summary

Jobwhistle is the inaugural developer product launched under CodeBrise. It provides straightforward, reliable, and lightweight monitoring for web applications, APIs, and background cron jobs.

Unlike legacy observability platforms that bombard developers with convoluted APM dashboards, artificial intelligence upselling, or opaque pricing tiers, Jobwhistle focuses on deterministic signals:
- Is your HTTP/HTTPS endpoint responding with the expected status code?
- Did your scheduled database backup or cron job report in on time?
- Has an outage been confirmed across multiple consecutive checks?
- Has recovery occurred, and how long was the service down?

---

## 2. Product Principles

1. **Simple Setup:** Less than 60 seconds from account creation to first probe check.
2. **Deterministic Reporting:** All uptime percentages and latencies are calculated from real probe results; no guessed numbers.
3. **Calm Incident Confirmation:** Requires two consecutive failed checks before raising an alert, eliminating false alarms from momentary network flutters.
4. **Free-First Edge Architecture:** Built on serverless Cloudflare Workers, Cloudflare D1, and Resend to guarantee scalability without mandatory paid infrastructure.
5. **Defense by Default:** Comprehensive Server-Side Request Forgery (SSRF) defense protects private networks and cloud metadata from probing abuse.
6. **Token-Based Cron Tracking:** Heartbeats listen for secret tokens whose plaintext is never stored in the database.
7. **Transparent Limits:** Publicly documented quotas during beta with zero hidden fees.
