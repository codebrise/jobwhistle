/**
 * Jobwhistle - Shared Brand and Product Configuration
 * Parent brand: CodeBrise
 */

export const brandConfig = {
  name: 'Jobwhistle',
  parentBrand: 'CodeBrise',
  endorsement: 'Jobwhistle by CodeBrise',
  tagline: 'Know when something goes quiet.',
  secondaryTagline: 'Small signals. Clear answers.',
  description:
    'Lightweight website uptime and scheduled-job monitoring for developers and independent teams.',
  appUrl:
    (typeof globalThis !== 'undefined' &&
      (globalThis as unknown as { process?: { env?: Record<string, string> } })
        .process?.env?.NEXT_PUBLIC_APP_URL) ||
    'https://jobwhistle.codebrise.com',
  apiUrl:
    (typeof globalThis !== 'undefined' &&
      (globalThis as unknown as { process?: { env?: Record<string, string> } })
        .process?.env?.NEXT_PUBLIC_API_URL) ||
    'https://api.jobwhistle.codebrise.com',
  supportEmail: 'support@codebrise.com',
  docsUrl: '/docs',
  repositoryUrl: 'https://github.com/codebrise/jobwhistle',
} as const;

export const productLimits = {
  // Free Beta Limits
  monitors: 3,
  checkIntervalMinutes: 5,
  minCheckIntervalMinutes: 1,
  maxTimeoutSeconds: 15,
  defaultTimeoutSeconds: 10,
  heartbeatMonitors: 3,
  historyRetentionDays: 7,
  notificationChannels: 2,
  consecutiveFailuresForIncident: 2,
  defaultGracePeriodMinutes: 15,
  maxRedirects: 5,
  maxResponseBodySizeBytes: 1024 * 512, // 512 KB to prevent memory exhaustion
} as const;

export const brandColors = {
  deepPine: '#142522',
  signalLime: '#C8F169',
  signalTeal: '#347D72',
  sage: '#A9C5B1',
  status: {
    up: '#19875D',
    degraded: '#C48A28',
    down: '#D45252',
    paused: '#74847D',
    pending: '#477DA8',
    unknown: '#858F95',
  },
} as const;

export type BrandConfig = typeof brandConfig;
export type ProductLimits = typeof productLimits;
export type BrandColors = typeof brandColors;
