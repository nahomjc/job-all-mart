CREATE TYPE "public"."telegram_web_login_status" AS ENUM('pending', 'approved', 'consumed', 'cancelled');--> statement-breakpoint
CREATE TABLE "telegram_web_logins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "telegram_web_login_status" DEFAULT 'pending' NOT NULL,
	"telegram_id" bigint,
	"next_path" varchar(256) DEFAULT '/post/new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "telegram_web_logins_status_idx" ON "telegram_web_logins" USING btree ("status");--> statement-breakpoint
CREATE INDEX "telegram_web_logins_expires_idx" ON "telegram_web_logins" USING btree ("expires_at");
