CREATE TABLE IF NOT EXISTS "ad_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"advert_id" integer NOT NULL,
	"name" text,
	"type" integer,
	"status" integer,
	"cpm" integer,
	"views" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"orders" integer DEFAULT 0 NOT NULL,
	"spend" integer DEFAULT 0 NOT NULL,
	"revenue" integer DEFAULT 0 NOT NULL,
	"drr" real,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ad_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"target_drr" integer DEFAULT 10 NOT NULL,
	"max_cpm" integer DEFAULT 500 NOT NULL,
	"min_cpm" integer DEFAULT 100 NOT NULL,
	"auto" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ad_settings_store_id_unique" UNIQUE("store_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_campaigns" ADD CONSTRAINT "ad_campaigns_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_settings" ADD CONSTRAINT "ad_settings_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
