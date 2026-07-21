import {
  doublePrecision,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}).enableRLS();

export const videoStatus = pgEnum("video_status", [
  "waiting",
  "preparing",
  "ready",
  "errored",
]);

export const videos = pgTable(
  "videos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: videoStatus("status").notNull().default("waiting"),
    muxUploadId: text("mux_upload_id").unique(),
    muxAssetId: text("mux_asset_id").unique(),
    muxPlaybackId: text("mux_playback_id").unique(),
    duration: doublePrecision("duration"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // 公開一覧: status で絞り込み、作成日時 + id の複合カーソルで並べる
    index("videos_status_created_at_id_idx").on(
      table.status,
      table.createdAt.desc(),
      table.id.desc(),
    ),
    // 動画管理ページ: 自分の動画を同じ並びで取得する
    index("videos_user_id_created_at_id_idx").on(
      table.userId,
      table.createdAt.desc(),
      table.id.desc(),
    ),
  ],
).enableRLS();
