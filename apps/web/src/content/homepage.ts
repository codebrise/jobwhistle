export const homepageContent = {
  hero: {
    badge: 'Jobwhistle V1 Public Beta &bull; Free-first developer monitoring',
    tagline: 'Know when something goes quiet.',
    subhead:
      'Lightweight website uptime, API endpoint, and scheduled-job monitoring. Instant notifications when your services stumble, zero noise when they run smoothly.',
    primaryCta: {
      label: 'Start Monitoring Free',
      href: '/register',
    },
    secondaryCta: {
      label: 'Read Architecture & Docs',
      href: '/docs',
    },
    endorsement: 'Built with care by CodeBrise',
  },

  metricsHighlight: [
    { label: 'Uptime Precision', value: '100% Deterministic', sub: 'No fabricated or guessed statistics' },
    { label: 'Incident Confirmation', value: '2 Consec. Checks', sub: 'Suppresses transient network blips' },
    { label: 'Execution Engine', value: 'Edge Serverless', sub: 'Sub-second probe dispatch on Cloudflare' },
    { label: 'Setup Velocity', value: '< 60 Seconds', sub: 'Zero agent installation or complex SDKs' },
  ],

  capabilities: [
    {
      id: 'http-monitoring',
      title: 'HTTP & HTTPS Probing',
      tagline: 'Continuous validation for web apps and APIs.',
      description:
        'Probe your endpoints from independent edge nodes. Verify exact HTTP status codes, measure real-world response latency, track redirect chains safely, and spot degradation before your users do.',
      features: [
        'Configurable 5-minute check intervals in free tier',
        'Strict SSRF defense blocking private IP & cloud metadata leaks',
        'Controlled redirect tracing up to 5 hops with hop-by-hop verification',
        '7-day high-resolution check history retention',
      ],
      codePreview: `curl -I https://api.yourdomain.com/health\n# HTTP/2 200 OK\n# latency: 142ms\n# status: operational`,
    },
    {
      id: 'heartbeats',
      title: 'Scheduled-Job Heartbeats',
      tagline: 'Know when your cron jobs silently stop executing.',
      description:
        'Backups fail silently. Nightly ETL syncs hang. Billing scripts crash midway. Jobwhistle heartbeats listen for incoming pings and alert you the moment a scheduled execution deadline passes without word.',
      features: [
        'Unique cryptographically secure check-in tokens',
        'Configurable expected intervals and customizable grace periods',
        'Drop-in 1-liner cURL, Python, Node.js, and Bash snippets',
        'Automatic recovery notification when overdue jobs resume',
      ],
      codePreview: `0 3 * * * /backup.sh && curl -fsS -m 10 "https://api.jobwhistle.codebrise.com/api/v1/heartbeats/check-in/whistle_hb_9f...3a"`,
    },
    {
      id: 'incident-lifecycle',
      title: 'Idempotent Incident Lifecycle',
      tagline: 'Confirmation before alarm. Recovery without noise.',
      description:
        'Nobody wants an urgent 3:00 AM wake-up email for a transient 200ms routing flutter. Jobwhistle confirms failures across consecutive checks before declaring an incident, logging every transition from suspected to resolved.',
      features: [
        'Two consecutive failed checks required before opening an incident',
        'Downtime duration calculated accurately down to the second',
        'Automatic recovery alerts sent as soon as services return to health',
        'Immutable check history and delivery audit trail',
      ],
      codePreview: `[03:15:00] First probe failure detected -> State: Suspected\n[03:20:00] Second probe failure confirmed -> State: Open Incident\n[03:20:01] Alert dispatched via Resend Email\n[03:32:00] Probe responds HTTP 200 OK -> State: Resolved (Duration: 17m)`,
    },
  ],

  howItWorks: [
    {
      step: '01',
      title: 'Create Your Monitor',
      description: 'Add your web URL or cron schedule. Set your expected HTTP status code and timeout threshold.',
    },
    {
      step: '02',
      title: 'Edge Probes Listen',
      description: 'Jobwhistle dispatchers check your endpoint at scheduled intervals with strict SSRF defense.',
    },
    {
      step: '03',
      title: 'Receive Honest Alerts',
      description: 'If a service fails two consecutive checks, an alert reaches your inbox immediately with full diagnostics.',
    },
  ],
};
