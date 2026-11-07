CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`details` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_ws_idx` ON `audit_logs` (`workspace_id`);--> statement-breakpoint
CREATE TABLE `heartbeat_check_ins` (
	`id` text PRIMARY KEY NOT NULL,
	`heartbeat_id` text NOT NULL,
	`received_at` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`duration_ms` integer,
	FOREIGN KEY (`heartbeat_id`) REFERENCES `heartbeat_tokens`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `hb_checkins_hb_idx` ON `heartbeat_check_ins` (`heartbeat_id`);--> statement-breakpoint
CREATE TABLE `heartbeat_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`token_hash` text NOT NULL,
	`token_preview` text NOT NULL,
	`expected_interval_minutes` integer DEFAULT 60 NOT NULL,
	`grace_period_minutes` integer DEFAULT 15 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`last_check_in_at` text,
	`next_expected_at` text,
	`deadline_at` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `heartbeat_tokens_token_hash_unique` ON `heartbeat_tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX `heartbeats_ws_idx` ON `heartbeat_tokens` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `heartbeats_deadline_idx` ON `heartbeat_tokens` (`deadline_at`,`active`);--> statement-breakpoint
CREATE INDEX `heartbeats_hash_idx` ON `heartbeat_tokens` (`token_hash`);--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`target_name` text NOT NULL,
	`target_endpoint` text NOT NULL,
	`state` text DEFAULT 'suspected' NOT NULL,
	`failure_reason` text NOT NULL,
	`suspected_at` text NOT NULL,
	`confirmed_at` text,
	`resolved_at` text,
	`duration_seconds` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `incidents_ws_idx` ON `incidents` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `incidents_target_idx` ON `incidents` (`target_id`,`state`);--> statement-breakpoint
CREATE TABLE `monitor_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`monitor_id` text NOT NULL,
	`status_code` integer,
	`response_time_ms` integer NOT NULL,
	`is_up` integer NOT NULL,
	`error_message` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`monitor_id`) REFERENCES `monitors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `checks_monitor_idx` ON `monitor_checks` (`monitor_id`);--> statement-breakpoint
CREATE INDEX `checks_created_idx` ON `monitor_checks` (`created_at`);--> statement-breakpoint
CREATE TABLE `monitors` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`method` text DEFAULT 'GET' NOT NULL,
	`interval_minutes` integer DEFAULT 5 NOT NULL,
	`timeout_seconds` integer DEFAULT 10 NOT NULL,
	`expected_status_code` integer DEFAULT 200 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`consecutive_failures` integer DEFAULT 0 NOT NULL,
	`last_checked_at` text,
	`last_success_at` text,
	`last_failure_at` text,
	`next_check_at` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `monitors_ws_idx` ON `monitors` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `monitors_next_check_idx` ON `monitors` (`next_check_at`,`active`);--> statement-breakpoint
CREATE TABLE `notification_channels` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`provider` text DEFAULT 'email' NOT NULL,
	`name` text NOT NULL,
	`destination` text NOT NULL,
	`is_verified` integer DEFAULT true NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `notif_channels_ws_idx` ON `notification_channels` (`workspace_id`);--> statement-breakpoint
CREATE TABLE `notification_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`incident_id` text NOT NULL,
	`channel_id` text NOT NULL,
	`provider` text NOT NULL,
	`event_type` text NOT NULL,
	`status` text NOT NULL,
	`error_message` text,
	`sent_at` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`channel_id`) REFERENCES `notification_channels`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `notif_deliv_incident_idx` ON `notification_deliveries` (`incident_id`);--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`notify_on_down` integer DEFAULT true NOT NULL,
	`notify_on_recovery` integer DEFAULT true NOT NULL,
	`notify_on_degraded` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notification_preferences_workspace_id_unique` ON `notification_preferences` (`workspace_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `sessions_expires_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `workspace_members` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'owner' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ws_members_ws_idx` ON `workspace_members` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `ws_members_user_idx` ON `workspace_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`owner_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workspaces_slug_unique` ON `workspaces` (`slug`);