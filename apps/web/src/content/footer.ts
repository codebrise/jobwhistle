export const footerContent = {
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Overview', href: '/' },
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Integrations', href: '/integrations' },
        { label: 'Changelog', href: '/changelog' },
      ],
    },
    {
      title: 'Documentation',
      links: [
        { label: 'Getting Started', href: '/docs' },
        { label: 'HTTP Probing', href: '/docs/http-monitoring' },
        { label: 'Heartbeats & Cron', href: '/docs/heartbeats' },
        { label: 'API Reference', href: '/docs/api' },
        { label: 'Architecture', href: '/docs/architecture' },
      ],
    },
    {
      title: 'Trust & Legal',
      links: [
        { label: 'Security Policy', href: '/security' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'About CodeBrise', href: '/about' },
      ],
    },
  ],
  copyright: `© ${new Date().getFullYear()} Jobwhistle by CodeBrise. All rights reserved.`,
  tagline: 'Know when something goes quiet.',
};
