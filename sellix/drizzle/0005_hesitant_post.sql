CREATE TABLE IF NOT EXISTS "keyword_positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nm_id" integer NOT NULL,
	"query" text NOT NULL,
	"date" text NOT NULL,
	"position" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kwpos_uniq" UNIQUE("nm_id","query","date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "keyword_tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nm_id" integer NOT NULL,
	"query" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kwtrack_uniq" UNIQUE("user_id","nm_id","query")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "keyword_tracks" ADD CONSTRAINT "keyword_tracks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
