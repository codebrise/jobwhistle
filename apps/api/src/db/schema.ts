import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const workspaces = sqliteTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerId: text('owner_id').notNull().references(() => users.id),
  createdAt: text('created_at').notNull(),
});

export const workspaceMembers = sqliteTable(
  'workspace_members',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    userId: text('user_id').notNull().references(() => users.id),
    role: text('role').notNull().default('owner'),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    workspaceIdx: index('ws_members_ws_idx').on(table.workspaceId),
    userIdx: index('ws_members_user_idx').on(table.userId),
  })
);

export const monitors = sqliteTable(
  'monitors',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    name: text('name').notNull(),
    url: text('url').notNull(),
    method: text('method').notNull().default('GET'),
    intervalMinutes: integer('interval_minutes').notNull().default(5),
    timeoutSeconds: integer('timeout_seconds').notNull().default(10),
    expectedStatusCode: integer('expected_status_code').notNull().default(200),
    status: text('status').notNull().default('pending'), // 'up' | 'down' | 'degraded' | 'paused' | 'pending'
    consecutiveFailures: integer('consecutive_failures').notNull().default(0),
    lastCheckedAt: text('last_checked_at'),
    lastSuccessAt: text('last_success_at'),
    lastFailureAt: text('last_failure_at'),
    nextCheckAt: text('next_check_at').notNull(),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    workspaceIdx: index('monitors_ws_idx').on(table.workspaceId),
    nextCheckIdx: index('monitors_next_check_idx').on(table.nextCheckAt, table.active),
  })
);

export const monitorChecks = sqliteTable(
  'monitor_checks',
  {
    id: text('id').primaryKey(),
    monitorId: text('monitor_id').notNull().references(() => monitors.id, { onDelete: 'cascade' }),
    statusCode: integer('status_code'),
    responseTimeMs: integer('response_time_ms').notNull(),
    isUp: integer('is_up', { mode: 'boolean' }).notNull(),
    errorMessage: text('error_message'),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    monitorIdIdx: index('checks_monitor_idx').on(table.monitorId),
    createdAtIdx: index('checks_created_idx').on(table.createdAt),
  })
);

export const heartbeatTokens = sqliteTable(
  'heartbeat_tokens',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    name: text('name').notNull(),
    tokenHash: text('token_hash').notNull().unique(),
    tokenPreview: text('token_preview').notNull(),
    expectedIntervalMinutes: integer('expected_interval_minutes').notNull().default(60),
    gracePeriodMinutes: integer('grace_period_minutes').notNull().default(15),
    status: text('status').notNull().default('pending'), // 'up' | 'down' | 'pending' | 'paused'
    lastCheckInAt: text('last_check_in_at'),
    nextExpectedAt: text('next_expected_at'),
    deadlineAt: text('deadline_at'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    workspaceIdx: index('heartbeats_ws_idx').on(table.workspaceId),
    deadlineIdx: index('heartbeats_deadline_idx').on(table.deadlineAt, table.active),
    tokenHashIdx: index('heartbeats_hash_idx').on(table.tokenHash),
  })
);

export const heartbeatCheckIns = sqliteTable(
  'heartbeat_check_ins',
  {
    id: text('id').primaryKey(),
    heartbeatId: text('heartbeat_id').notNull().references(() => heartbeatTokens.id, { onDelete: 'cascade' }),
    receivedAt: text('received_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    durationMs: integer('duration_ms'),
  },
  (table) => ({
    heartbeatIdIdx: index('hb_checkins_hb_idx').on(table.heartbeatId),
  })
);

export const incidents = sqliteTable(
  'incidents',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    targetType: text('target_type').notNull(), // 'monitor' | 'heartbeat'
    targetId: text('target_id').notNull(),
    targetName: text('target_name').notNull(),
    targetEndpoint: text('target_endpoint').notNull(),
    state: text('state').notNull().default('suspected'), // 'suspected' | 'open' | 'resolved'
    failureReason: text('failure_reason').notNull(),
    suspectedAt: text('suspected_at').notNull(),
    confirmedAt: text('confirmed_at'),
    resolvedAt: text('resolved_at'),
    durationSeconds: integer('duration_seconds'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    workspaceIdx: index('incidents_ws_idx').on(table.workspaceId),
    targetIdx: index('incidents_target_idx').on(table.targetId, table.state),
  })
);

export const notificationChannels = sqliteTable(
  'notification_channels',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    provider: text('provider').notNull().default('email'),
    name: text('name').notNull(),
    destination: text('destination').notNull(),
    isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(true),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    workspaceIdx: index('notif_channels_ws_idx').on(table.workspaceId),
  })
);

export const notificationDeliveries = sqliteTable(
  'notification_deliveries',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    incidentId: text('incident_id').notNull().references(() => incidents.id),
    channelId: text('channel_id').notNull().references(() => notificationChannels.id),
    provider: text('provider').notNull(),
    eventType: text('event_type').notNull(), // 'monitor.down' | 'monitor.up' | 'heartbeat.missed' | 'heartbeat.recovered'
    status: text('status').notNull(), // 'sent' | 'failed' | 'retrying'
    errorMessage: text('error_message'),
    sentAt: text('sent_at').notNull(),
  },
  (table) => ({
    incidentIdx: index('notif_deliv_incident_idx').on(table.incidentId),
  })
);

export const notificationPreferences = sqliteTable('notification_preferences', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().unique().references(() => workspaces.id),
  notifyOnDown: integer('notify_on_down', { mode: 'boolean' }).notNull().default(true),
  notifyOnRecovery: integer('notify_on_recovery', { mode: 'boolean' }).notNull().default(true),
  notifyOnDegraded: integer('notify_on_degraded', { mode: 'boolean' }).notNull().default(false),
  updatedAt: text('updated_at').notNull(),
});

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(), // session token hash
    userId: text('user_id').notNull().references(() => users.id),
    workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    expiresIdx: index('sessions_expires_idx').on(table.expiresAt),
  })
);

export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id').notNull(),
    userId: text('user_id'),
    action: text('action').notNull(),
    details: text('details'),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    workspaceIdx: index('audit_ws_idx').on(table.workspaceId),
  })
);
