import type { MetadataRoute } from 'next';
import { brandConfig } from '@jobwhistle/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/api/'],
    },
    sitemap: `${brandConfig.appUrl}/sitemap.xml`,
  };
}
