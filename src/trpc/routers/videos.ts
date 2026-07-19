import { and, desc, eq, lt, or } from "drizzle-orm";
import { z } from "zod";
import { DEFAULT_LIMIT, MAX_LIMIT } from "@/constants/videos";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "../init";

export const videosRouter = createTRPCRouter({
  list: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({
            createdAt: z.date(),
            id: z.uuid(),
          })
          .nullish(),
        limit: z.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
      }),
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input;

      const items = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.status, "ready"),
            // createdAt + id の複合カーソルより古いレコードのみ取得する。
            // 同時刻の動画があっても取りこぼし・重複が発生しない
            cursor
              ? or(
                  lt(videos.createdAt, cursor.createdAt),
                  and(
                    eq(videos.createdAt, cursor.createdAt),
                    lt(videos.id, cursor.id),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(videos.createdAt), desc(videos.id))
        // 次ページの有無を判定するため1件多く取得する
        .limit(limit + 1);

      const hasMore = items.length > limit;
      if (hasMore) {
        items.pop();
      }

      const lastItem = items.at(-1);
      const nextCursor =
        hasMore && lastItem
          ? { createdAt: lastItem.createdAt, id: lastItem.id }
          : null;

      return { items, nextCursor };
    }),
});
