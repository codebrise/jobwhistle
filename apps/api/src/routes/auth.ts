import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import {
  UserRegisterSchema,
  UserLoginSchema,
  type AuthSession,
} from '@jobwhistle/contracts';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  sha256Hex,
  generateId,
} from '../security/crypto';
import { authMiddleware, type Env, type AuthContextVariables } from '../middleware/auth';

const authApp = new Hono<{ Bindings: Env; Variables: AuthContextVariables }>();

// POST /register
authApp.post('/register', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parseResult = UserRegisterSchema.safeParse(body);
  if (!parseResult.success) {
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid registration input',
          details: parseResult.error.flatten(),
        },
      },
      400
    );
  }

  const { name, email, password } = parseResult.data;
  const normalizedEmail = email.toLowerCase().trim();
  const db = drizzle(c.env.DB, { schema });

  // Check if email already exists
  const [existingUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, normalizedEmail))
    .limit(1);

  if (existingUser) {
    return c.json(
      {
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'An account with this email address already exists.',
        },
      },
      409
    );
  }

  const nowIso = new Date().toISOString();
  const userId = generateId('usr');
  const passwordHash = await hashPassword(password);

  // 1. Create User
  await db.insert(schema.users).values({
    id: userId,
    email: normalizedEmail,
    name,
    passwordHash,
    emailVerified: false,
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  // 2. Create Default Workspace
  const workspaceId = generateId('ws');
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

  await db.insert(schema.workspaces).values({
    id: workspaceId,
    name: `${name}'s Workspace`,
    slug,
    ownerId: userId,
    createdAt: nowIso,
  });

  // 3. Add Workspace Member
  await db.insert(schema.workspaceMembers).values({
    id: generateId('mem'),
    workspaceId,
    userId,
    role: 'owner',
    createdAt: nowIso,
  });

  // 4. Create Default Email Notification Channel
  await db.insert(schema.notificationChannels).values({
    id: generateId('chan'),
    workspaceId,
    provider: 'email',
    name: 'Default Email',
    destination: normalizedEmail,
    isVerified: true,
    active: true,
    createdAt: nowIso,
  });

  // 5. Initialize Notification Preferences
  await db.insert(schema.notificationPreferences).values({
    id: generateId('pref'),
    workspaceId,
    notifyOnDown: true,
    notifyOnRecovery: true,
    notifyOnDegraded: false,
    updatedAt: nowIso,
  });

  // 6. Generate Session
  const sessionToken = generateToken('whistle_sess');
  const sessionHash = await sha256Hex(sessionToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  await db.insert(schema.sessions).values({
    id: sessionHash,
    userId,
    workspaceId,
    expiresAt,
    createdAt: nowIso,
  });

  const sessionData: AuthSession = {
    user: {
      id: userId,
      name,
      email: normalizedEmail,
      emailVerified: false,
      activeWorkspaceId: workspaceId,
      createdAt: nowIso,
    },
    workspace: {
      id: workspaceId,
      name: `${name}'s Workspace`,
      slug,
      ownerId: userId,
      createdAt: nowIso,
    },
    token: sessionToken,
    expiresAt,
  };

  return c.json({
    success: true,
    data: sessionData,
    message: 'Registration successful.',
  });
});

// POST /login
authApp.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parseResult = UserLoginSchema.safeParse(body);
  if (!parseResult.success) {
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid credentials format.',
        },
      },
      400
    );
  }

  const { email, password } = parseResult.data;
  const normalizedEmail = email.toLowerCase().trim();
  const db = drizzle(c.env.DB, { schema });

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    return c.json(
      {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      },
      401
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return c.json(
      {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      },
      401
    );
  }

  // Get active workspace (first workspace user owns/belongs to)
  const [workspace] = await db
    .select()
    .from(schema.workspaces)
    .where(eq(schema.workspaces.ownerId, user.id))
    .limit(1);

  if (!workspace) {
    return c.json(
      {
        success: false,
        error: {
          code: 'NO_WORKSPACE',
          message: 'No active workspace found for user.',
        },
      },
      404
    );
  }

  const nowIso = new Date().toISOString();
  const sessionToken = generateToken('whistle_sess');
  const sessionHash = await sha256Hex(sessionToken);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  await db.insert(schema.sessions).values({
    id: sessionHash,
    userId: user.id,
    workspaceId: workspace.id,
    expiresAt,
    createdAt: nowIso,
  });

  const sessionData: AuthSession = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      activeWorkspaceId: workspace.id,
      createdAt: user.createdAt,
    },
    workspace: {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.ownerId,
      createdAt: workspace.createdAt,
    },
    token: sessionToken,
    expiresAt,
  };

  return c.json({
    success: true,
    data: sessionData,
    message: 'Login successful.',
  });
});

// GET /me
authApp.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  const workspace = c.get('workspace');
  return c.json({
    success: true,
    data: { user, workspace },
  });
});

// POST /logout
authApp.post('/logout', authMiddleware, async (c) => {
  const authHeader = c.req.header('Authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) {
    const cookies = c.req.header('Cookie');
    const match = cookies?.match(/whistle_session=([^;]+)/);
    if (match) token = match[1];
  }

  if (token) {
    const tokenHash = await sha256Hex(token);
    const db = drizzle(c.env.DB, { schema });
    await db.delete(schema.sessions).where(eq(schema.sessions.id, tokenHash));
  }

  return c.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

export { authApp };

