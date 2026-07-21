import { TRPCError } from "@trpc/server";
import { and, desc, eq, lt, or, type SQL } from "drizzle-orm";
import { z } from "zod";
import {
  DEFAULT_LIMIT,
  DEFAULT_VIDEO_TITLE,
  MAX_LIMIT,
} from "@/constants/videos";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { getMux } from "@/lib/mux";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";

const cursorSchema = z
  .object({
    createdAt: z.date(),
    id: z.uuid(),
  })
  .nullish();

const paginationSchema = z.object({
  cursor: cursorSchema,
  limit: z.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

type Pagination = z.infer<typeof paginationSchema>;

function afterCursor(cursor: Pagination["cursor"]) {
  if (!cursor) {
    return undefined;
  }

  return or(
    lt(videos.createdAt, cursor.createdAt),
    and(eq(videos.createdAt, cursor.createdAt), lt(videos.id, cursor.id)),
  );
}

async function paginateVideos(
  { cursor, limit }: Pagination,
  filter: SQL | undefined,
) {
  const items = await db
    .select()
    .from(videos)
    .where(and(filter, afterCursor(cursor)))
    .orderBy(desc(videos.createdAt), desc(videos.id))
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
}

export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const upload = await getMux().video.uploads.create({
      cors_origin: "*",
      new_asset_settings: {
        playback_policies: ["public"],
      },
    });

    if (!upload.url) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    const [video] = await db
      .insert(videos)
      .values({
        userId: ctx.user.id,
        title: DEFAULT_VIDEO_TITLE,
        muxUploadId: upload.id,
      })
      .returning();

    return { videoId: video.id, uploadUrl: upload.url };
  }),
  getOne: baseProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ input }) => {
      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.status, "ready")))
        .limit(1);

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return video;
    }),
  getMine: protectedProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) =>
      paginateVideos(input, eq(videos.userId, ctx.user.id)),
    ),
  list: baseProcedure
    .input(paginationSchema)
    .query(async ({ input }) =>
      paginateVideos(input, eq(videos.status, "ready")),
    ),
});
