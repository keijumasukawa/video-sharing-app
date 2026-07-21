ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "videos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "videos_status_created_at_id_idx" ON "videos" USING btree ("status","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "videos_user_id_created_at_id_idx" ON "videos" USING btree ("user_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_mux_upload_id_unique" UNIQUE("mux_upload_id");--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_mux_asset_id_unique" UNIQUE("mux_asset_id");--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_mux_playback_id_unique" UNIQUE("mux_playback_id");