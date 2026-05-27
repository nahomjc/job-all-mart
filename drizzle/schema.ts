import { pgTable, index, unique, uuid, text, bigint, varchar, boolean, timestamp, foreignKey, jsonb, integer, uniqueIndex, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const auditAction = pgEnum("audit_action", ['user.ban', 'user.unban', 'user.role_change', 'job.create', 'job.update', 'job.approve', 'job.reject', 'job.schedule', 'job.post', 'job.expire', 'job.feature', 'payment.verify', 'payment.reject', 'category.create', 'category.update', 'category.delete'])
export const authProvider = pgEnum("auth_provider", ['supabase', 'telegram'])
export const employmentType = pgEnum("employment_type", ['full_time', 'part_time', 'contract', 'internship', 'remote'])
export const jobSource = pgEnum("job_source", ['web', 'telegram'])
export const jobStatus = pgEnum("job_status", ['draft', 'pending_payment', 'pending_review', 'approved', 'scheduled', 'posted', 'rejected', 'expired'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'verified', 'rejected'])
export const subscriptionTier = pgEnum("subscription_tier", ['free', 'basic', 'pro', 'enterprise'])
export const userRole = pgEnum("user_role", ['user', 'admin', 'owner'])
export const userSource = pgEnum("user_source", ['web', 'telegram'])
export const userStatus = pgEnum("user_status", ['active', 'banned', 'suspended'])


export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	supabaseUserId: uuid("supabase_user_id"),
	email: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	telegramId: bigint("telegram_id", { mode: "number" }),
	telegramUsername: varchar("telegram_username", { length: 64 }),
	telegramFirstName: varchar("telegram_first_name", { length: 128 }),
	telegramLastName: varchar("telegram_last_name", { length: 128 }),
	telegramVerifiedMembership: boolean("telegram_verified_membership").default(false).notNull(),
	displayName: varchar("display_name", { length: 128 }),
	avatarUrl: text("avatar_url"),
	authProvider: authProvider("auth_provider").notNull(),
	source: userSource().notNull(),
	role: userRole().default('user').notNull(),
	status: userStatus().default('active').notNull(),
	banReason: text("ban_reason"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("users_role_idx").using("btree", table.role.asc().nullsLast().op("enum_ops")),
	index("users_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	unique("users_supabase_user_id_unique").on(table.supabaseUserId),
	unique("users_email_unique").on(table.email),
	unique("users_telegram_id_unique").on(table.telegramId),
]);

export const auditLogs = pgTable("audit_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	actorId: uuid("actor_id"),
	action: auditAction().notNull(),
	targetType: varchar("target_type", { length: 32 }).notNull(),
	targetId: uuid("target_id"),
	metadata: jsonb(),
	ip: varchar({ length: 64 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("audit_actor_idx").using("btree", table.actorId.asc().nullsLast().op("uuid_ops")),
	index("audit_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("audit_target_idx").using("btree", table.targetType.asc().nullsLast().op("uuid_ops"), table.targetId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [users.id],
			name: "audit_logs_actor_id_users_id_fk"
		}).onDelete("set null"),
]);

export const jobs = pgTable("jobs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	categoryId: uuid("category_id"),
	title: varchar({ length: 200 }).notNull(),
	company: varchar({ length: 200 }).notNull(),
	description: text().notNull(),
	employmentType: employmentType("employment_type").default('full_time').notNull(),
	location: varchar({ length: 200 }).notNull(),
	salaryMin: integer("salary_min"),
	salaryMax: integer("salary_max"),
	salaryCurrency: varchar("salary_currency", { length: 8 }).default('USD').notNull(),
	applyUrl: text("apply_url"),
	contactInfo: text("contact_info"),
	logoUrl: text("logo_url"),
	status: jobStatus().default('draft').notNull(),
	source: jobSource().notNull(),
	rejectionReason: text("rejection_reason"),
	spamScore: integer("spam_score").default(0).notNull(),
	isFeatured: boolean("is_featured").default(false).notNull(),
	pinUntil: timestamp("pin_until", { withTimezone: true, mode: 'string' }),
	scheduledAt: timestamp("scheduled_at", { withTimezone: true, mode: 'string' }),
	postedAt: timestamp("posted_at", { withTimezone: true, mode: 'string' }),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	slug: varchar({ length: 220 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("jobs_category_idx").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("jobs_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
	index("jobs_posted_at_idx").using("btree", table.postedAt.asc().nullsLast().op("timestamptz_ops")),
	index("jobs_scheduled_at_idx").using("btree", table.scheduledAt.asc().nullsLast().op("timestamptz_ops")),
	index("jobs_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("jobs_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "jobs_category_id_categories_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "jobs_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("jobs_slug_unique").on(table.slug),
]);

export const jobViews = pgTable("job_views", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	jobId: uuid("job_id").notNull(),
	source: varchar({ length: 32 }).default('web').notNull(),
	visitorHash: varchar("visitor_hash", { length: 64 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("job_views_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("job_views_job_idx").using("btree", table.jobId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "job_views_job_id_jobs_id_fk"
		}).onDelete("cascade"),
]);

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slug: varchar({ length: 64 }).notNull(),
	name: varchar({ length: 128 }).notNull(),
	description: text(),
	icon: varchar({ length: 64 }),
	telegramTopicId: integer("telegram_topic_id"),
	sortOrder: integer("sort_order").default(0).notNull(),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("categories_topic_idx").using("btree", table.telegramTopicId.asc().nullsLast().op("int4_ops")),
	unique("categories_slug_unique").on(table.slug),
]);

export const subscriptions = pgTable("subscriptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	tier: subscriptionTier().default('free').notNull(),
	monthlyPostQuota: integer("monthly_post_quota").default(3).notNull(),
	monthlyPostsUsed: integer("monthly_posts_used").default(0).notNull(),
	quotaResetsAt: timestamp("quota_resets_at", { withTimezone: true, mode: 'string' }).default(sql`(now() + '30 days'::interval)`).notNull(),
	activeUntil: timestamp("active_until", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "subscriptions_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("subscriptions_user_id_unique").on(table.userId),
]);

export const telegramPosts = pgTable("telegram_posts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	jobId: uuid("job_id").notNull(),
	chatId: text("chat_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	messageId: bigint("message_id", { mode: "number" }).notNull(),
	topicId: integer("topic_id"),
	messageUrl: text("message_url"),
	clickCount: integer("click_count").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("telegram_posts_chat_msg_idx").using("btree", table.chatId.asc().nullsLast().op("int8_ops"), table.messageId.asc().nullsLast().op("int8_ops")),
	index("telegram_posts_job_idx").using("btree", table.jobId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "telegram_posts_job_id_jobs_id_fk"
		}).onDelete("cascade"),
]);

export const telegramTopics = pgTable("telegram_topics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	topicId: integer("topic_id").notNull(),
	name: varchar({ length: 128 }).notNull(),
	description: text(),
	categoryId: uuid("category_id"),
	active: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "telegram_topics_category_id_categories_id_fk"
		}).onDelete("set null"),
	unique("telegram_topics_topic_id_unique").on(table.topicId),
]);

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	jobId: uuid("job_id").notNull(),
	userId: uuid("user_id").notNull(),
	screenshotUrl: text("screenshot_url").notNull(),
	amount: integer().notNull(),
	currency: varchar({ length: 8 }).default('USD').notNull(),
	referenceCode: varchar("reference_code", { length: 64 }),
	method: varchar({ length: 32 }).default('telebirr').notNull(),
	status: paymentStatus().default('pending').notNull(),
	verifiedBy: uuid("verified_by"),
	verifiedAt: timestamp("verified_at", { withTimezone: true, mode: 'string' }),
	rejectionReason: text("rejection_reason"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	accountSuffix: varchar("account_suffix", { length: 32 }),
	phoneNumber: varchar("phone_number", { length: 20 }),
}, (table) => [
	index("payments_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("payments_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [jobs.id],
			name: "payments_job_id_jobs_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "payments_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.verifiedBy],
			foreignColumns: [users.id],
			name: "payments_verified_by_users_id_fk"
		}).onDelete("set null"),
	unique("payments_job_id_unique").on(table.jobId),
]);
