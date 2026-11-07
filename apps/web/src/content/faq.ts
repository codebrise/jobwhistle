export const faqContent = [
  {
    question: 'How is Jobwhistle different from traditional uptime services?',
    answer:
      'Jobwhistle is designed free-first and developer-focused. We avoid noisy false alarms through a two-check confirmation lifecycle, provide clean code snippets for cron jobs, and run on serverless edge nodes without bloated features or aggressive upselling.',
  },
  {
    question: 'What is a heartbeat monitor and why do I need one?',
    answer:
      'A heartbeat monitor tracks scheduled tasks (like database backups, email queues, or daily syncs). Instead of pinging your server, your script sends an HTTP GET or POST request to a unique Jobwhistle URL when it finishes. If that request fails to arrive within your expected window plus grace period, Jobwhistle alerts you immediately.',
  },
  {
    question: 'Will I get spammed with emails if my service flutters?',
    answer:
      'No. Jobwhistle uses strict deduplication and idempotent incident state transitions. You receive exactly one alert when an incident is confirmed, and one alert when the service has recovered. We never email on every single failed probe.',
  },
  {
    question: 'What are the free beta limits?',
    answer:
      'You get up to 3 HTTP monitors, 3 heartbeat monitors, 5-minute check intervals, 7-day granular check retention, and 2 notification destinations completely free during the public beta.',
  },
  {
    question: 'How does Jobwhistle protect against SSRF attacks?',
    answer:
      'Every URL configured by a user is validated against our SSRF defense engine. We prohibit private IPv4/IPv6 ranges (like 127.0.0.1, 10.0.0.0/8, 192.168.0.0/16), block cloud metadata endpoints (169.254.169.254), restrict probe ports to standard web ports, and re-verify destinations on every redirect hop.',
  },
  {
    question: 'Who is behind Jobwhistle?',
    answer:
      'Jobwhistle is developed and maintained by CodeBrise, focused on building straightforward, high-utility developer tools.',
  },
];
