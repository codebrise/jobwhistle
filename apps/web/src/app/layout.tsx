import type { Metadata } from 'next';
import { brandConfig } from '@jobwhistle/config';
import '../styles/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(brandConfig.appUrl),
  title: {
    default: `${brandConfig.name} — ${brandConfig.tagline}`,
    template: `%s | ${brandConfig.name}`,
  },
  description: brandConfig.description,
  keywords: [
    'website monitoring',
    'uptime monitoring',
    'cron monitoring',
    'heartbeat monitoring',
    'api monitoring',
    'incident alerts',
    'codebrise',
    'developer tools',
  ],
  authors: [{ name: brandConfig.parentBrand, url: 'https://codebrise.com' }],
  creator: brandConfig.parentBrand,
  publisher: brandConfig.parentBrand,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: `${brandConfig.name} — ${brandConfig.tagline}`,
    description: brandConfig.description,
    url: brandConfig.appUrl,
    siteName: brandConfig.name,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${brandConfig.name} by ${brandConfig.parentBrand}`,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${brandConfig.name} — ${brandConfig.tagline}`,
    description: brandConfig.description,
    images: ['/twitter-card.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://codebrise.com/#organization',
      name: 'CodeBrise',
      url: 'https://codebrise.com',
      logo: `${brandConfig.appUrl}/favicon-512x512.png`,
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${brandConfig.appUrl}/#software`,
      name: 'Jobwhistle',
      description: brandConfig.description,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      author: {
        '@id': 'https://codebrise.com/#organization',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#0D1515] text-[#EAF0EC] antialiased selection:bg-[#C8F169] selection:text-[#142522]">
        {children}
      </body>
    </html>
  );
}

