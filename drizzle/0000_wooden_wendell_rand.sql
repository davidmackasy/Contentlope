CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'Other' NOT NULL,
	`mime` text NOT NULL,
	`path` text NOT NULL,
	`size` integer NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`favorite` integer DEFAULT 0 NOT NULL,
	`source` text DEFAULT 'upload' NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `assets_business` ON `assets` (`business_id`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`business_id` text,
	`event` text NOT NULL,
	`details` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `auth_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`purpose` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`type` text DEFAULT 'SaaS / App' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`brain` text DEFAULT '{}' NOT NULL,
	`kit` text DEFAULT '{}' NOT NULL,
	`preferences` text DEFAULT '{}' NOT NULL,
	`onboarding_step` integer DEFAULT 1 NOT NULL,
	`onboarding_status` text DEFAULT 'in_progress' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `businesses_workspace` ON `businesses` (`workspace_id`);--> statement-breakpoint
CREATE TABLE `content_packages` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`created_by` text NOT NULL,
	`title` text NOT NULL,
	`prompt` text NOT NULL,
	`type` text DEFAULT 'carousel' NOT NULL,
	`platform` text DEFAULT 'Both' NOT NULL,
	`goal` text DEFAULT 'Engagement' NOT NULL,
	`tone` text DEFAULT 'Auto' NOT NULL,
	`cta_type` text DEFAULT 'Integrated' NOT NULL,
	`template` text DEFAULT 'Editorial' NOT NULL,
	`status` text DEFAULT 'generating' NOT NULL,
	`slides` text DEFAULT '[]' NOT NULL,
	`caption` text DEFAULT '' NOT NULL,
	`hashtags` text DEFAULT '[]' NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `content_business_status` ON `content_packages` (`business_id`,`status`);--> statement-breakpoint
CREATE TABLE `ai_generations` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`content_id` text,
	`stage` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`provider` text DEFAULT 'guided' NOT NULL,
	`state` text DEFAULT '{}' NOT NULL,
	`error` text,
	`locked_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`content_id`) REFERENCES `content_packages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `generations_business` ON `ai_generations` (`business_id`);--> statement-breakpoint
CREATE TABLE `workspace_members` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'owner' NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_members_unique` ON `workspace_members` (`workspace_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `metric_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`published_id` text NOT NULL,
	`data` text NOT NULL,
	`collected_at` text NOT NULL,
	FOREIGN KEY (`published_id`) REFERENCES `published_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ai_models` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`read` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `oauth_states` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`business_id` text,
	`provider` text NOT NULL,
	`verifier` text,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`description` text NOT NULL,
	`entitlements` text NOT NULL,
	`stripe_price` text,
	`enabled` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `publishing_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`idempotency_key` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`provider_id` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`error` text,
	`metadata` text DEFAULT '{}' NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `scheduled_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `publish_idempotency` ON `publishing_jobs` (`idempotency_key`);--> statement-breakpoint
CREATE TABLE `published_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`platform_id` text NOT NULL,
	`url` text,
	`published_at` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `scheduled_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `published_post` ON `published_posts` (`post_id`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scheduled_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`content_id` text NOT NULL,
	`social_id` text,
	`scheduled_at` text NOT NULL,
	`timezone` text NOT NULL,
	`status` text DEFAULT 'planned' NOT NULL,
	`options` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`content_id`) REFERENCES `content_packages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`social_id`) REFERENCES `social_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `scheduled_due` ON `scheduled_posts` (`status`,`scheduled_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `sessions_user` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `social_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`platform` text NOT NULL,
	`platform_user_id` text NOT NULL,
	`username` text NOT NULL,
	`token` text NOT NULL,
	`refresh_token` text,
	`expires_at` text,
	`status` text DEFAULT 'connected' NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `socials_unique` ON `social_accounts` (`business_id`,`platform`,`platform_user_id`);--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`config` text NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `usage_records` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`business_id` text,
	`feature` text NOT NULL,
	`quantity` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `usage_monthly` ON `usage_records` (`workspace_id`,`feature`,`created_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`platform_id` text,
	`timezone` text DEFAULT 'America/Los_Angeles' NOT NULL,
	`verified` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_platform` ON `users` (`platform_id`);--> statement-breakpoint
CREATE TABLE `content_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`content_id` text NOT NULL,
	`snapshot` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`content_id`) REFERENCES `content_packages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `versions_content` ON `content_versions` (`content_id`);--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `website_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`url` text NOT NULL,
	`status` text NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`business_id`) REFERENCES `businesses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `website_sources_business` ON `website_sources` (`business_id`);--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`plan_id` text DEFAULT 'trial' NOT NULL,
	`subscription_status` text DEFAULT 'trial' NOT NULL,
	`stripe_customer` text,
	`stripe_subscription` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `workspaces_owner` ON `workspaces` (`owner_id`);