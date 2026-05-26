CREATE TYPE "public"."audit_action" AS ENUM('user.ban', 'user.unban', 'user.role_change', 'job.create', 'job.update', 'job.approve', 'job.reject', 'job.schedule', 'job.post', 'job.expire', 'job.feature', 'payment.verify', 'payment.reject', 'category.create', 'category.update', 'category.delete');--> statement-breakpoint
CREATE TYPE "public"."auth_provider" AS ENUM('supabase', 'telegram');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'contract', 'internship', 'remote');--> statement-breakpoint
CREATE TYPE "public"."job_source" AS ENUM('web', 'telegram');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('draft', 'pending_payment', 'pending_review', 'approved', 'scheduled', 'posted', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'basic', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'owner');--> statement-breakpoint
CREATE TYPE "public"."user_source" AS ENUM('web', 'telegram');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'banned', 'suspended');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" "audit_action" NOT NULL,
	"target_type" varchar(32) NOT NULL,
	"target_id" uuid,
	"metadata" jsonb,
	"ip" varchar(64),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"icon" varchar(64),
	"telegram_topic_id" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "job_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"source" varchar(32) DEFAULT 'web' NOT NULL,
	"visitor_hash" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid,
	"title" varchar(200) NOT NULL,
	"company" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"employment_type" "employment_type" DEFAULT 'full_time' NOT NULL,
	"location" varchar(200) NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"salary_currency" varchar(8) DEFAULT 'USD' NOT NULL,
	"apply_url" text,
	"contact_info" text,
	"logo_url" text,
	"status" "job_status" DEFAULT 'draft' NOT NULL,
	"source" "job_source" NOT NULL,
	"rejection_reason" text,
	"spam_score" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"pin_until" timestamp with time zone,
	"scheduled_at" timestamp with time zone,
	"posted_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"slug" varchar(220) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"screenshot_url" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(8) DEFAULT 'USD' NOT NULL,
	"reference_code" varchar(64),
	"method" varchar(32) DEFAULT 'bank_transfer' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"verified_by" uuid,
	"verified_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_job_id_unique" UNIQUE("job_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tier" "subscription_tier" DEFAULT 'free' NOT NULL,
	"monthly_post_quota" integer DEFAULT 3 NOT NULL,
	"monthly_posts_used" integer DEFAULT 0 NOT NULL,
	"quota_resets_at" timestamp with time zone DEFAULT now() + interval '30 days' NOT NULL,
	"active_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "telegram_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"chat_id" text NOT NULL,
	"message_id" bigint NOT NULL,
	"topic_id" integer,
	"message_url" text,
	"click_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic_id" integer NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"category_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "telegram_topics_topic_id_unique" UNIQUE("topic_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supabase_user_id" uuid,
	"email" text,
	"telegram_id" bigint,
	"telegram_username" varchar(64),
	"telegram_first_name" varchar(128),
	"telegram_last_name" varchar(128),
	"telegram_verified_membership" boolean DEFAULT false NOT NULL,
	"display_name" varchar(128),
	"avatar_url" text,
	"auth_provider" "auth_provider" NOT NULL,
	"source" "user_source" NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"ban_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_supabase_user_id_unique" UNIQUE("supabase_user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telegram_posts" ADD CONSTRAINT "telegram_posts_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telegram_topics" ADD CONSTRAINT "telegram_topics_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_target_idx" ON "audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "audit_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_topic_idx" ON "categories" USING btree ("telegram_topic_id");--> statement-breakpoint
CREATE INDEX "job_views_job_idx" ON "job_views" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_views_created_idx" ON "job_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "jobs_user_idx" ON "jobs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "jobs_category_idx" ON "jobs" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "jobs_posted_at_idx" ON "jobs" USING btree ("posted_at");--> statement-breakpoint
CREATE INDEX "jobs_scheduled_at_idx" ON "jobs" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "jobs_expires_at_idx" ON "jobs" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_user_idx" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_posts_chat_msg_idx" ON "telegram_posts" USING btree ("chat_id","message_id");--> statement-breakpoint
CREATE INDEX "telegram_posts_job_idx" ON "telegram_posts" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");