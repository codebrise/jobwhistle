export const featuresContent = {
  title: 'Engineered for Clarity and Precision',
  subtitle:
    'A lightweight, honest monitoring foundation built for developers who want reliable alerts without enterprise bloat.',
  sections: [
    {
      category: 'Website & API Uptime',
      headline: 'Deterministic HTTP Probing from the Edge',
      description:
        'Verify uptime, HTTP response codes, and round-trip latencies without heavy agent installations or complex tracing instrumentation.',
      items: [
        {
          title: 'Custom Expected Status Codes',
          description: 'Match standard 200 OK or custom API response codes like 201, 204, or 302.',
        },
        {
          title: 'Hop-by-Hop Redirect Validation',
          description: 'Follow redirect chains up to 5 hops with SSRF destination re-verification at every step.',
        },
        {
          title: 'Bounded Response Readers',
          description: 'Stream headers and cap body consumption at 512 KB to avoid probe memory exhaustion.',
        },
        {
          title: 'Latency Telemetry',
          description: 'High-resolution roundtrip timing with 7-day historical percentile metrics.',
        },
      ],
    },
    {
      category: 'Cron & Background Jobs',
      headline: 'Heartbeat Deadlines for Silent Cron Jobs',
      description:
        'When a background process hangs, crashes, or runs out of memory, no exception reaches your error tracker. Heartbeats alert you when something fails to report in.',
      items: [
        {
          title: 'Cryptographic Secret Tokens',
          description: 'Tokens generated with 192 bits of entropy; only the SHA-256 hash is persisted in our database.',
        },
        {
          title: 'Flexible Grace Periods',
          description: 'Allow buffer time (e.g. 15 minutes) for heavy database backups or elastic workloads.',
        },
        {
          title: '1-Click Token Rotation',
          description: 'Safely rotate check-in tokens at any time with immediate deprecation of the old secret.',
        },
        {
          title: 'Multi-Language Snippets',
          description: 'Tested integration examples for cURL, Node.js, Python, Bash, and PHP.',
        },
      ],
    },
    {
      category: 'Security & Integrity',
      headline: 'Zero-Trust SSRF & Data Protection',
      description:
        'Probing user-configured URLs requires defense against malicious SSRF attempts, loopback spoofing, and metadata extraction.',
      items: [
        {
          title: 'Private IP & Loopback Filter',
          description: 'Strict rejection of 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, and ::1.',
        },
        {
          title: 'Cloud Metadata Shield',
          description: 'Hard-coded blocklists protecting AWS, GCP, Azure, and Docker metadata addresses.',
        },
        {
          title: 'Restricted Port Matrix',
          description: 'Probe traffic restricted to verified web ports (80, 443, 8080, 8443, etc.), preventing intranet port scanning.',
        },
        {
          title: 'PBKDF2 Web Crypto',
          description: '100,000 iterations of PBKDF2 with SHA-256 and unique cryptographic salts for passwords.',
        },
      ],
    },
  ],
};

