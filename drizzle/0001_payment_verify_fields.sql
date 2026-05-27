ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "account_suffix" varchar(32);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "phone_number" varchar(20);--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "method" SET DEFAULT 'telebirr';
