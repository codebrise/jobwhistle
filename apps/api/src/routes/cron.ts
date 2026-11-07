import { Hono } from 'hono';
import { MonitoringDispatcher } from '../services/monitoring/dispatcher';
import type { Env } from '../middleware/auth';

const cronApp = new Hono<{ Bindings: Env }>();

// POST /dispatch - Trigger monitoring scheduler execution with cron secret validation
cronApp.post('/dispatch', async (c) => {
  // Validate cron authentication
  const expectedSecret = c.env.CRON_SECRET;
  if (expectedSecret) {
    const headerSecret =
      c.req.header('X-Jobwhistle-Cron-Secret') ||
      c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');

    if (!headerSecret || headerSecret !== expectedSecret) {
      return c.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED_CRON',
            message: 'Unauthorized: Invalid or missing cron dispatch secret.',
          },
        },
        401
      );
    }
  }

  const dispatcher = new MonitoringDispatcher(
    c.env.RESEND_API_KEY,
    c.env.EMAIL_FROM
  );

  const monitorsResult = await dispatcher.processDueMonitors(c.env.DB, 15);
  const heartbeatsResult = await dispatcher.processMissedHeartbeats(c.env.DB, 20);

  // Clean up checks older than 7 days once per hour or occasionally
  let cleanedRecords = 0;
  if (Math.random() < 0.1) {
    cleanedRecords = await dispatcher.cleanupOldChecks(c.env.DB, 7);
  }

  return c.json({
    success: true,
    data: {
      monitors: monitorsResult,
      heartbeats: heartbeatsResult,
      cleanedRecords,
      timestamp: new Date().toISOString(),
    },
    message: 'Cron monitoring cycle executed successfully.',
  });
});

export { cronApp };
