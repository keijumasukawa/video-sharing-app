CREATE TYPE "public"."video_status" AS ENUM('waiting', 'preparing', 'ready', 'errored');--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "video_status" DEFAULT 'waiting' NOT NULL,
	"mux_upload_id" text,
	"mux_asset_id" text,
	"mux_playback_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
