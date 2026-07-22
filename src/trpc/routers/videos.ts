import { TRPCError } from "@trpc/server";
import {
  and,
  desc,
  eq,
  getTableColumns,
  inArray,
  lt,
  or,
} from "drizzle-orm";
import { z } from "zod";
import {
  DEFAULT_LIMIT,
  DESCRIPTION_MAX_LENGTH,
  MAX_LIMIT,
  TITLE_MAX_LENGTH,
} from "@/constants/videos";
import { db } from "@/db";
import { profiles, videos } from "@/db/schema";
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

function toPage<T extends { createdAt: Date; id: string }>(
  items: T[],
  limit: number,
) {
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

const videoWithUser = {
  ...getTableColumns(videos),
  user: {
    firstName: profiles.firstName,
    lastName: profiles.lastName,
    avatarUrl: profiles.avatarUrl,
  },
};

export const videosRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().trim().min(1).max(TITLE_MAX_LENGTH),
        description: z.string().trim().max(DESCRIPTION_MAX_LENGTH).nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const upload = await getMux().video.uploads.create({
        cors_origin: process.env.MUX_UPLOAD_CORS_ORIGIN ?? "*",
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
          title: input.title,
          description: input.description || null,
          muxUploadId: upload.id,
        })
        .returning();

      return { videoId: video.id, uploadUrl: upload.url };
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
        title: z.string().trim().min(1).max(TITLE_MAX_LENGTH),
        description: z.string().trim().max(DESCRIPTION_MAX_LENGTH).nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [video] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description || null,
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, ctx.user.id)))
        .returning();

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return video;
    }),
  remove: protectedProcedure
    .input(z.object({ ids: z.array(z.uuid()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      const removed = await db
        .delete(videos)
        .where(
          and(inArray(videos.id, input.ids), eq(videos.userId, ctx.user.id)),
        )
        .returning();

      if (removed.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const results = await Promise.allSettled(
        removed
          .map((video) => video.muxAssetId)
          .filter((assetId): assetId is string => assetId !== null)
          .map((assetId) => getMux().video.assets.delete(assetId)),
      );
      for (const result of results) {
        if (result.status === "rejected") {
          console.error("Failed to delete Mux asset:", result.reason);
        }
      }

      return { deletedCount: removed.length };
    }),
  getOne: baseProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ input }) => {
      const [video] = await db
        .select(videoWithUser)
        .from(videos)
        .innerJoin(profiles, eq(videos.userId, profiles.id))
        .where(and(eq(videos.id, input.id), eq(videos.status, "ready")))
        .limit(1);

      if (!video) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return video;
    }),
  getMine: protectedProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      const items = await db
        .select()
        .from(videos)
        .where(
          and(eq(videos.userId, ctx.user.id), afterCursor(input.cursor)),
        )
        .orderBy(desc(videos.createdAt), desc(videos.id))
        .limit(input.limit + 1);

      return toPage(items, input.limit);
    }),
  list: baseProcedure
    .input(paginationSchema)
    .query(async ({ input }) => {
      const items = await db
        .select(videoWithUser)
        .from(videos)
        .innerJoin(profiles, eq(videos.userId, profiles.id))
        .where(and(eq(videos.status, "ready"), afterCursor(input.cursor)))
        .orderBy(desc(videos.createdAt), desc(videos.id))
        .limit(input.limit + 1);

      return toPage(items, input.limit);
    }),
});
