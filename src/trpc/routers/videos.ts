import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "../init";

export const videosRouter = createTRPCRouter({
  list: baseProcedure.query(async () => {
    return db
      .select()
      .from(videos)
      .where(eq(videos.status, "ready"))
      .orderBy(desc(videos.createdAt));
  }),
});
