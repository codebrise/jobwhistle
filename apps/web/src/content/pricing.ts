import { productLimits } from '@jobwhistle/config';

export const pricingContent = {
  title: 'Transparent, Free-First Monitoring',
  subtitle:
    'No hidden credit card requirements, no trial expirations that lock you out, and no fabricated enterprise tiers.',
  plan: {
    name: 'Developer Free Beta',
    price: '$0',
    billingPeriod: 'Free forever during beta',
    description:
      'Everything an indie hacker, freelancer, or small engineering team needs to monitor production websites and cron jobs reliably.',
    features: [
      `Up to ${productLimits.monitors} active HTTP / HTTPS monitors`,
      `Up to ${productLimits.heartbeatMonitors} scheduled heartbeat / cron monitors`,
      `${productLimits.checkIntervalMinutes}-minute check intervals`,
      `Two-check consecutive failure confirmation`,
      `${productLimits.historyRetentionDays}-day granular check history retention`,
      `Up to ${productLimits.notificationChannels} notification destinations (Email & Webhook)`,
      'Comprehensive SSRF target protection',
      'Instant recovery notifications',
    ],
    cta: {
      label: 'Create Free Account',
      href: '/register',
    },
    note: 'Limits are backed by real serverless infrastructure on Cloudflare and Resend.',
  },
  quotas: [
    {
      metric: 'HTTP Check Interval',
      limit: '5 minutes',
      explanation: 'Schedules probes every 5 minutes across Cloudflare Workers edge nodes.',
    },
    {
      metric: 'Check Timeout',
      limit: '15 seconds max',
      explanation: 'Caps request duration to protect edge resources from hung sockets.',
    },
    {
      metric: 'Incident Confirmation',
      limit: '2 failures',
      explanation: 'Requires two consecutive failed probes before declaring an incident.',
    },
    {
      metric: 'History Retention',
      limit: '7 days',
      explanation: 'Raw checks stored for 7 days; automated routine cleanup prevents storage bloat.',
    },
  ],
};
