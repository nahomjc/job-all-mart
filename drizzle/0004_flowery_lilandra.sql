ALTER TYPE "public"."audit_action" ADD VALUE 'plan.create' BEFORE 'settings.update';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'plan.update' BEFORE 'settings.update';--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'plan.delete' BEFORE 'settings.update';--> statement-breakpoint
CREATE TABLE "pricing_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"price_label" varchar(64) NOT NULL,
	"cadence" varchar(32) DEFAULT '/post' NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cta_label" varchar(64) DEFAULT 'Post a job' NOT NULL,
	"cta_href" varchar(256) DEFAULT '/post/new' NOT NULL,
	"highlight" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pricing_plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "pricing_plans_slug_idx" ON "pricing_plans" USING btree ("slug");