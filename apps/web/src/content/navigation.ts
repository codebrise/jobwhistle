export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}

export const headerNavItems: NavItem[] = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Integrations', href: '/integrations' },
  { label: 'Docs', href: '/docs' },
  { label: 'Changelog', href: '/changelog' },
];

export const dashboardNavItems = [
  { label: 'Overview', href: '/app/overview', icon: 'LayoutDashboard' },
  { label: 'Monitors', href: '/app/monitors', icon: 'Activity' },
  { label: 'Heartbeats', href: '/app/heartbeats', icon: 'Clock' },
  { label: 'Incidents', href: '/app/incidents', icon: 'AlertTriangle' },
  { label: 'Notifications', href: '/app/notifications', icon: 'Bell' },
  { label: 'Settings', href: '/app/settings', icon: 'Settings' },
] as const;

export const docsNavSections = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Quickstart Guide', href: '/docs/getting-started' },
      { label: 'Architecture & Engine', href: '/docs/architecture' },
    ],
  },
  {
    title: 'Core Monitoring',
    items: [
      { label: 'HTTP / HTTPS Probing', href: '/docs/http-monitoring' },
      { label: 'Heartbeat & Cron Tracking', href: '/docs/heartbeats' },
      { label: 'Incident Lifecycle', href: '/docs/incidents' },
    ],
  },
  {
    title: 'Alerting & Security',
    items: [
      { label: 'Email Notifications', href: '/docs/notifications' },
      { label: 'SSRF & Destination Defense', href: '/docs/security' },
      { label: 'API Reference', href: '/docs/api' },
    ],
  },
];

