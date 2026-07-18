import { createTRPCRouter } from "../init";
import { videosRouter } from "./videos";

export const appRouter = createTRPCRouter({
  videos: videosRouter,
});

export type AppRouter = typeof appRouter;
