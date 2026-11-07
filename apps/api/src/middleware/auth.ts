import type { Context, Next } from 'hono';
import { eq, and, gt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { sha256Hex } from '../security/crypto';
import type { UserProfile, WorkspaceRecord } from '@jobwhistle/contracts';

export interface Env {
  DB: D1Database;
  APP_ENV: string;
  APP_URL: string;
  WEB_ORIGIN: string;
  CRON_SECRET?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
}

export interface AuthContextVariables {
  user: UserProfile;
  workspace: WorkspaceRecord;
}

export async function authMiddleware(
  c: Context<{ Bindings: Env; Variables: AuthContextVariables }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');
  let token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    // Check cookie
    const cookies = c.req.header('Cookie');
    if (cookies) {
      const match = cookies.match(/whistle_session=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  }

  if (!token) {
    return c.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token required.',
        },
      },
      401
    );
  }

  const tokenHash = await sha256Hex(token);
  const nowIso = new Date().toISOString();
  const db = drizzle(c.env.DB, { schema });

  // Find active session
  const [session] = await db
    .select()
    .from(schema.sessions)
    .where(
      and(
        eq(schema.sessions.id, tokenHash),
        gt(schema.sessions.expiresAt, nowIso)
      )
    )
    .limit(1);

  if (!session) {
    return c.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired session.',
        },
      },
      401
    );
  }

  // Fetch user
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .limit(1);

  if (!user) {
    return c.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Associated user account not found.',
        },
      },
      401
    );
  }

  // Fetch workspace
  const [workspace] = await db
    .select()
    .from(schema.workspaces)
    .where(eq(schema.workspaces.id, session.workspaceId))
    .limit(1);

  if (!workspace) {
    return c.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Active workspace not found.',
        },
      },
      403
    );
  }

  c.set('user', {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    activeWorkspaceId: workspace.id,
    createdAt: user.createdAt,
  });

  c.set('workspace', {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    ownerId: workspace.ownerId,
    createdAt: workspace.createdAt,
  });

  return await next();
}
