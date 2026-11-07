import type { MetadataRoute } from 'next';
import { brandConfig } from '@jobwhistle/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = brandConfig.appUrl;
  const now = new Date();

  const routes = [
    '',
    '/features',
    '/pricing',
    '/integrations',
    '/docs',
    '/docs/getting-started',
    '/docs/http-monitoring',
    '/docs/heartbeats',
    '/docs/notifications',
    '/docs/api',
    '/changelog',
    '/about',
    '/privacy',
    '/terms',
    '/security',
    '/login',
    '/register',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/docs') ? 0.8 : 0.6,
  }));
}

