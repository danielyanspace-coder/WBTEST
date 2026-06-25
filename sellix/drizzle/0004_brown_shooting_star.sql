CREATE TABLE IF NOT EXISTS "market_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nm_id" integer NOT NULL,
	"date" text NOT NULL,
	"price" integer,
	"stock" integer,
	"rating" real,
	"feedbacks" integer,
	"source" text DEFAULT 'public' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "market_snap_uniq" UNIQUE("nm_id","date","source")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watch_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nm_id" integer NOT NULL,
	"title" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watch_uniq" UNIQUE("user_id","nm_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watch_items" ADD CONSTRAINT "watch_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
