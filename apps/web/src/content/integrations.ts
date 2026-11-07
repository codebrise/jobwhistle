export const integrationsContent = {
  title: 'Alert Delivery & Channels',
  subtitle:
    'Reliable alert dispatch when incidents strike. Clear recovery notices when services resume.',
  activeChannels: [
    {
      id: 'email',
      name: 'Email (Resend)',
      status: 'operational',
      description:
        'Clean HTML and plain-text email alerts delivered via Resend with incident diagnostics, target endpoints, and 1-click links.',
      badge: 'Active in V1',
    },
    {
      id: 'webhook',
      name: 'Generic HTTP Webhooks',
      status: 'operational',
      description:
        'POST JSON payload to any custom HTTP/HTTPS endpoint with signature headers and SSRF verification.',
      badge: 'Active in V1',
    },
  ],
  plannedChannels: [
    {
      id: 'telegram',
      name: 'Telegram Bot',
      description: 'Receive instant alerts in private chats or team channels via Telegram bot.',
      stage: 'V1.1 Planned',
    },
    {
      id: 'discord',
      name: 'Discord Webhooks',
      description: 'Color-coded embeds posted directly to your developer server channels.',
      stage: 'V1.1 Planned',
    },
    {
      id: 'slack',
      name: 'Slack Incoming Webhooks',
      description: 'Structured incident notices with actionable buttons for Slack workspaces.',
      stage: 'V1.1 Planned',
    },
    {
      id: 'ntfy',
      name: 'ntfy.sh & UnifiedPush',
      description: 'Privacy-respecting open-source push notifications for Android, iOS, and desktop.',
      stage: 'V1.1 Planned',
    },
    {
      id: 'mobile-push',
      name: 'Native Mobile Push',
      description: 'Low-latency push alerts for the upcoming Jobwhistle Android and iOS mobile applications.',
      stage: 'V4 Planned',
    },
  ],
};
