CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"item_id" uuid NOT NULL,
	"level_pct" integer NOT NULL,
	"channel" text DEFAULT 'whatsapp' NOT NULL,
	"status" text NOT NULL,
	"provider_message_id" text,
	"detail" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kit_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"property_id" uuid NOT NULL,
	"name" text NOT NULL,
	"detail" text,
	"category" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"reorder_threshold" integer DEFAULT 30 NOT NULL,
	CONSTRAINT "kit_items_threshold_range" CHECK ("reorder_threshold" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"host_id" uuid NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"item_id" uuid NOT NULL,
	"level_pct" integer NOT NULL,
	"source" text DEFAULT 'diarista' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_levels" (
	"item_id" uuid PRIMARY KEY,
	"level_pct" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_levels_pct_range" CHECK ("level_pct" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"identity_id" text NOT NULL UNIQUE,
	"email" text NOT NULL,
	"name" text,
	"whatsapp" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "alerts_item_time_idx" ON "alerts" ("item_id","created_at");--> statement-breakpoint
CREATE INDEX "kit_items_property_idx" ON "kit_items" ("property_id");--> statement-breakpoint
CREATE INDEX "properties_host_idx" ON "properties" ("host_id");--> statement-breakpoint
CREATE INDEX "stock_events_item_time_idx" ON "stock_events" ("item_id","created_at");--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_item_id_kit_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "kit_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "kit_items" ADD CONSTRAINT "kit_items_property_id_properties_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_host_id_users_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "stock_events" ADD CONSTRAINT "stock_events_item_id_kit_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "kit_items"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "stock_levels" ADD CONSTRAINT "stock_levels_item_id_kit_items_id_fkey" FOREIGN KEY ("item_id") REFERENCES "kit_items"("id") ON DELETE CASCADE;