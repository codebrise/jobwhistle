import { Hono } from 'hono';
import { eq, and, count } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { CreateNotificationChannelSchema } from '@jobwhistle/contracts';
import { productLimits } from '@jobwhistle/config';
import { validateMonitorUrl } from '../security/ssrf';
import { generateId } from '../security/crypto';
import { authMiddleware, type Env, type AuthContextVariables } from '../middleware/auth';

const notificationsApp = new Hono<{ Bindings: Env; Variables: AuthContextVariables }>();

notificationsApp.use('*', authMiddleware);

// GET /channels - List channels
notificationsApp.get('/channels', async (c) => {
  const workspace = c.get('workspace');
  const db = drizzle(c.env.DB, { schema });

  const channels = await db
    .select()
    .from(schema.notificationChannels)
    .where(eq(schema.notificationChannels.workspaceId, workspace.id));

  return c.json({
    success: true,
    data: channels,
  });
});

// POST /channels - Create notification channel
notificationsApp.post('/channels', async (c) => {
  const workspace = c.get('workspace');
  const body = await c.req.json().catch(() => null);

  const parseResult = CreateNotificationChannelSchema.safeParse(body);
  if (!parseResult.success) {
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid notification channel configuration.',
          details: parseResult.error.flatten(),
        },
      },
      400
    );
  }

  const { name, provider, destination } = parseResult.data;
  const db = drizzle(c.env.DB, { schema });

  // Check quota (2 channels in free beta)
  const [existingCount] = await db
    .select({ val: count() })
    .from(schema.notificationChannels)
    .where(eq(schema.notificationChannels.workspaceId, workspace.id));

  if (existingCount.val >= productLimits.notificationChannels) {
    return c.json(
      {
        success: false,
        error: {
          code: 'LIMIT_EXCEEDED',
          message: `Limit of ${productLimits.notificationChannels} notification channels reached.`,
        },
      },
      403
    );
  }

  // If webhook, validate destination against SSRF
  if (provider === 'webhook') {
    const ssrfCheck = validateMonitorUrl(destination);
    if (!ssrfCheck.valid) {
      return c.json(
        {
          success: false,
          error: {
            code: 'SSRF_RESTRICTED',
            message: ssrfCheck.reason || 'Restricted webhook destination URL.',
          },
        },
        400
      );
    }
  }

  const nowIso = new Date().toISOString();
  const channelId = generateId('chan');

  await db.insert(schema.notificationChannels).values({
    id: channelId,
    workspaceId: workspace.id,
    provider,
    name,
    destination,
    isVerified: true,
    active: true,
    createdAt: nowIso,
  });

  const [created] = await db
    .select()
    .from(schema.notificationChannels)
    .where(eq(schema.notificationChannels.id, channelId))
    .limit(1);

  return c.json({
    success: true,
    data: created,
    message: 'Notification channel added.',
  });
});

// DELETE /channels/:id - Delete channel
notificationsApp.delete('/channels/:id', async (c) => {
  const workspace = c.get('workspace');
  const id = c.req.param('id');
  const db = drizzle(c.env.DB, { schema });

  await db
    .delete(schema.notificationChannels)
    .where(
      and(
        eq(schema.notificationChannels.id, id),
        eq(schema.notificationChannels.workspaceId, workspace.id)
      )
    );

  return c.json({
    success: true,
    message: 'Notification channel deleted.',
  });
});

// GET /preferences
notificationsApp.get('/preferences', async (c) => {
  const workspace = c.get('workspace');
  const db = drizzle(c.env.DB, { schema });

  const [prefs] = await db
    .select()
    .from(schema.notificationPreferences)
    .where(eq(schema.notificationPreferences.workspaceId, workspace.id))
    .limit(1);

  return c.json({
    success: true,
    data: prefs || {
      notifyOnDown: true,
      notifyOnRecovery: true,
      notifyOnDegraded: false,
    },
  });
});

// PATCH /preferences
notificationsApp.patch('/preferences', async (c) => {
  const workspace = c.get('workspace');
  const body = (await c.req.json().catch(() => ({}))) as {
    notifyOnDown?: boolean;
    notifyOnRecovery?: boolean;
    notifyOnDegraded?: boolean;
  };

  const db = drizzle(c.env.DB, { schema });
  const nowIso = new Date().toISOString();

  const [existing] = await db
    .select()
    .from(schema.notificationPreferences)
    .where(eq(schema.notificationPreferences.workspaceId, workspace.id))
    .limit(1);

  if (existing) {
    await db
      .update(schema.notificationPreferences)
      .set({
        ...body,
        updatedAt: nowIso,
      })
      .where(eq(schema.notificationPreferences.workspaceId, workspace.id));
  } else {
    await db.insert(schema.notificationPreferences).values({
      id: generateId('pref'),
      workspaceId: workspace.id,
      notifyOnDown: body.notifyOnDown ?? true,
      notifyOnRecovery: body.notifyOnRecovery ?? true,
      notifyOnDegraded: body.notifyOnDegraded ?? false,
      updatedAt: nowIso,
    });
  }

  const [updated] = await db
    .select()
    .from(schema.notificationPreferences)
    .where(eq(schema.notificationPreferences.workspaceId, workspace.id))
    .limit(1);

  return c.json({
    success: true,
    data: updated,
    message: 'Notification preferences updated.',
  });
});

export { notificationsApp };
