ALTER TABLE "users" ADD COLUMN "telegram_link_code" varchar(64);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "telegram_link_expires_at" timestamp with time zone;