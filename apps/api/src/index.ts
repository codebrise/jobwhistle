import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authApp } from './routes/auth';
import { monitorsApp } from './routes/monitors';
import { heartbeatsApp } from './routes/heartbeats';
import { incidentsApp } from './routes/incidents';
import { notificationsApp } from './routes/notifications';
import { overviewApp } from './routes/overview';
import { cronApp } from './routes/cron';
import { MonitoringDispatcher } from './services/monitoring/dispatcher';
import type { Env, AuthContextVariables } from './middleware/auth';
import { brandConfig } from '@jobwhistle/config';

const app = new Hono<{ Bindings: Env; Variables: AuthContextVariables }>();

// 1. CORS Configuration
app.use('*', async (c, next) => {
  const allowedOrigin = c.env?.WEB_ORIGIN || brandConfig.appUrl;
  return cors({
    origin: (origin) => {
      // Allow configured web origin or local development
      if (!origin || origin === allowedOrigin || origin.includes('localhost')) {
        return origin || allowedOrigin;
      }
      return allowedOrigin;
    },
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Jobwhistle-Cron-Secret'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
    credentials: true,
  })(c, next);
});

// 2. Security Headers Middleware
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
});

// 3. Health & Status Check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: brandConfig.name,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (c) => {
  return c.json({
    name: brandConfig.name,
    parentBrand: brandConfig.parentBrand,
    tagline: brandConfig.tagline,
    docs: brandConfig.docsUrl,
    version: '1.0.0',
    status: 'operational',
  });
});

// 4. API v1 Routes
app.route('/api/v1/auth', authApp);
app.route('/api/v1/monitors', monitorsApp);
app.route('/api/v1/heartbeats', heartbeatsApp);
app.route('/api/v1/incidents', incidentsApp);
app.route('/api/v1/notifications', notificationsApp);
app.route('/api/v1/overview', overviewApp);
app.route('/api/v1/cron', cronApp);

// 5. Global 404 Handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${c.req.method} ${c.req.path} not found on Jobwhistle API`,
      },
    },
    404
  );
});

// 6. Global Error Handler
app.onError((err, c) => {
  console.error('[Unhandled Error]:', err);
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
      },
    },
    500
  );
});

// 7. Cloudflare Workers Scheduled Cron Trigger Handler
export { app };
export default {
  fetch: app.fetch,
  async scheduled(
    event: { scheduledTime: number; cron: string },
    env: Env,
    ctx: { waitUntil: (promise: Promise<unknown>) => void }
  ) {
    console.log(`[Jobwhistle Cron] Triggered at ${new Date(event.scheduledTime).toISOString()}`);
    const dispatcher = new MonitoringDispatcher(env.RESEND_API_KEY, env.EMAIL_FROM);

    ctx.waitUntil(
      Promise.all([
        dispatcher.processDueMonitors(env.DB, 15),
        dispatcher.processMissedHeartbeats(env.DB, 20),
        // Occasional retention cleanup
        Math.random() < 0.05 ? dispatcher.cleanupOldChecks(env.DB, 7) : Promise.resolve(0),
      ]).then(([monitors, heartbeats, cleaned]) => {
        console.log(
          `[Jobwhistle Cron Complete] Monitors processed: ${monitors.processed}, Errors: ${monitors.errors}, Heartbeats missed: ${heartbeats.missed}, Cleaned checks: ${cleaned}`
        );
      })
    );
  },
};

