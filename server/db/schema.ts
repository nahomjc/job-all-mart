import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

export const authProviderEnum = pgEnum("auth_provider", [
  "supabase", // web users
  "telegram", // bot-only users
]);

export const userSourceEnum = pgEnum("user_source", ["web", "telegram"]);

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "owner"]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "banned",
  "suspended",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "pending_payment",
  "pending_review",
  "approved",
  "scheduled",
  "posted",
  "rejected",
  "expired",
]);

export const jobSourceEnum = pgEnum("job_source", ["web", "telegram"]);

export const employmentTypeEnum = pgEnum("employment_type", [
  "full_time",
  "part_time",
  "contract",
  "internship",
  "remote",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "verified",
  "rejected",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "user.ban",
  "user.unban",
  "user.role_change",
  "job.create",
  "job.update",
  "job.approve",
  "job.reject",
  "job.schedule",
  "job.post",
  "job.expire",
  "job.feature",
  "payment.verify",
  "payment.reject",
  "category.create",
  "category.update",
  "category.delete",
  "plan.create",
  "plan.update",
  "plan.delete",
  "settings.update",
]);

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "basic",
  "pro",
  "enterprise",
]);

// ──────────────────────────────────────────────
// users
// Supports BOTH web-auth users and Telegram-only users.
// At least one of (supabaseUserId, telegramId) must be set.
// ──────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Web auth
    supabaseUserId: uuid("supabase_user_id").unique(),
    email: text("email").unique(),

    // Telegram auth
    telegramId: bigint("telegram_id", { mode: "number" }).unique(),
    telegramUsername: varchar("telegram_username", { length: 64 }),
    telegramFirstName: varchar("telegram_first_name", { length: 128 }),
    telegramLastName: varchar("telegram_last_name", { length: 128 }),
    telegramVerifiedMembership: boolean("telegram_verified_membership")
      .notNull()
      .default(false),

    // Telegram account-linking (for web users connecting their Telegram)
    telegramLinkCode: varchar("telegram_link_code", { length: 64 }),
    telegramLinkExpiresAt: timestamp("telegram_link_expires_at", {
      withTimezone: true,
    }),

    // Profile
    displayName: varchar("display_name", { length: 128 }),
    avatarUrl: text("avatar_url"),

    // Meta
    authProvider: authProviderEnum("auth_provider").notNull(),
    source: userSourceEnum("source").notNull(),
    role: userRoleEnum("role").notNull().default("user"),
    status: userStatusEnum("status").notNull().default("active"),
    banReason: text("ban_reason"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("users_role_idx").on(t.role),
    index("users_status_idx").on(t.status),
  ],
);

// ──────────────────────────────────────────────
// categories
// Each category maps to a forum topic in the Telegram supergroup.
// ──────────────────────────────────────────────

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 64 }).notNull().unique(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 64 }),
    telegramTopicId: integer("telegram_topic_id"),
    sortOrder: integer("sort_order").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("categories_topic_idx").on(t.telegramTopicId),
  ],
);

// ──────────────────────────────────────────────
// jobs
// The central entity. Goes through the status state machine.
// ──────────────────────────────────────────────

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),

    // Core
    title: varchar("title", { length: 200 }).notNull(),
    company: varchar("company", { length: 200 }).notNull(),
    description: text("description").notNull(),
    employmentType: employmentTypeEnum("employment_type")
      .notNull()
      .default("full_time"),
    location: varchar("location", { length: 200 }).notNull(),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryCurrency: varchar("salary_currency", { length: 8 })
      .notNull()
      .default("USD"),
    applyUrl: text("apply_url"),
    contactInfo: text("contact_info"),
    logoUrl: text("logo_url"),

    // Moderation
    status: jobStatusEnum("status").notNull().default("draft"),
    source: jobSourceEnum("source").notNull(),
    rejectionReason: text("rejection_reason"),
    spamScore: integer("spam_score").notNull().default(0),
    isFeatured: boolean("is_featured").notNull().default(false),
    pinUntil: timestamp("pin_until", { withTimezone: true }),

    // Scheduling / lifecycle
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),

    // Search
    slug: varchar("slug", { length: 220 }).notNull().unique(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("jobs_user_idx").on(t.userId),
    index("jobs_status_idx").on(t.status),
    index("jobs_category_idx").on(t.categoryId),
    index("jobs_posted_at_idx").on(t.postedAt),
    index("jobs_scheduled_at_idx").on(t.scheduledAt),
    index("jobs_expires_at_idx").on(t.expiresAt),
  ],
);

// ──────────────────────────────────────────────
// payments
// One payment per job submission. Admin must verify it before approval.
// ──────────────────────────────────────────────

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" })
      .unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    screenshotUrl: text("screenshot_url").notNull(),
    amount: integer("amount").notNull(), // in minor units (cents/santims)
    currency: varchar("currency", { length: 8 }).notNull().default("USD"),
    referenceCode: varchar("reference_code", { length: 64 }),
    accountSuffix: varchar("account_suffix", { length: 32 }),
    phoneNumber: varchar("phone_number", { length: 20 }),
    method: varchar("method", { length: 32 }).notNull().default("telebirr"),

    status: paymentStatusEnum("status").notNull().default("pending"),
    verifiedBy: uuid("verified_by").references(() => users.id, {
      onDelete: "set null",
    }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("payments_status_idx").on(t.status),
    index("payments_user_idx").on(t.userId),
  ],
);

// ──────────────────────────────────────────────
// telegram_topics
// Optional standalone table (categories already hold a topic_id), but kept
// for richer mapping like multiple topics per category or labels per topic.
// ──────────────────────────────────────────────

export const telegramTopics = pgTable("telegram_topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  topicId: integer("topic_id").notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ──────────────────────────────────────────────
// telegram_posts
// Tracks each Telegram message we've sent for a job (e.g. main post + photo).
// Lets us edit/delete later, track clicks, etc.
// ──────────────────────────────────────────────

export const telegramPosts = pgTable(
  "telegram_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    chatId: text("chat_id").notNull(),
    messageId: bigint("message_id", { mode: "number" }).notNull(),
    topicId: integer("topic_id"),
    messageUrl: text("message_url"),
    clickCount: integer("click_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("telegram_posts_chat_msg_idx").on(t.chatId, t.messageId),
    index("telegram_posts_job_idx").on(t.jobId),
  ],
);

// ──────────────────────────────────────────────
// audit_logs
// ──────────────────────────────────────────────

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: auditActionEnum("action").notNull(),
    targetType: varchar("target_type", { length: 32 }).notNull(), // 'job' | 'user' | 'payment' | 'category'
    targetId: uuid("target_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_actor_idx").on(t.actorId),
    index("audit_target_idx").on(t.targetType, t.targetId),
    index("audit_created_at_idx").on(t.createdAt),
  ],
);

// ──────────────────────────────────────────────
// job_views
// Lightweight click/view tracking. One row per view.
// ──────────────────────────────────────────────

export const jobViews = pgTable(
  "job_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    source: varchar("source", { length: 32 }).notNull().default("web"),
    visitorHash: varchar("visitor_hash", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("job_views_job_idx").on(t.jobId),
    index("job_views_created_idx").on(t.createdAt),
  ],
);

// ──────────────────────────────────────────────
// subscriptions
// Lightweight tier tracking for an employer's plan.
// ──────────────────────────────────────────────

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    tier: subscriptionTierEnum("tier").notNull().default("free"),
    monthlyPostQuota: integer("monthly_post_quota").notNull().default(3),
    monthlyPostsUsed: integer("monthly_posts_used").notNull().default(0),
    quotaResetsAt: timestamp("quota_resets_at", { withTimezone: true })
      .notNull()
      .default(sql`now() + interval '30 days'`),
    activeUntil: timestamp("active_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
);

// ──────────────────────────────────────────────
// app_settings
// Key/value store for admin-configurable options (e.g. broadcast channel).
// ──────────────────────────────────────────────

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ──────────────────────────────────────────────
// pricing_plans
// Public /pricing cards — editable from admin.
// ──────────────────────────────────────────────

export const pricingPlans = pgTable(
  "pricing_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 64 }).notNull().unique(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    priceLabel: varchar("price_label", { length: 64 }).notNull(),
    cadence: varchar("cadence", { length: 32 }).notNull().default("/post"),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    ctaLabel: varchar("cta_label", { length: 64 }).notNull().default("Post a job"),
    ctaHref: varchar("cta_href", { length: 256 }).notNull().default("/post/new"),
    highlight: boolean("highlight").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("pricing_plans_slug_idx").on(t.slug)],
);

// ──────────────────────────────────────────────
// Relations
// ──────────────────────────────────────────────

export const usersRelations = relations(users, ({ many, one }) => ({
  jobs: many(jobs),
  payments: many(payments),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  user: one(users, { fields: [jobs.userId], references: [users.id] }),
  category: one(categories, {
    fields: [jobs.categoryId],
    references: [categories.id],
  }),
  payment: one(payments, { fields: [jobs.id], references: [payments.jobId] }),
  telegramPosts: many(telegramPosts),
  views: many(jobViews),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  job: one(jobs, { fields: [payments.jobId], references: [jobs.id] }),
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  verifier: one(users, {
    fields: [payments.verifiedBy],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  jobs: many(jobs),
  topics: many(telegramTopics),
}));

export const telegramPostsRelations = relations(telegramPosts, ({ one }) => ({
  job: one(jobs, { fields: [telegramPosts.jobId], references: [jobs.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, { fields: [auditLogs.actorId], references: [users.id] }),
}));

// ──────────────────────────────────────────────
// Inferred types — re-exported for app code
// ──────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type TelegramPost = typeof telegramPosts.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type AppSetting = typeof appSettings.$inferSelect;
export type PricingPlan = typeof pricingPlans.$inferSelect;
export type NewPricingPlan = typeof pricingPlans.$inferInsert;
