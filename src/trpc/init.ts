import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { getAuthUser } from "@/lib/auth";

export const createTRPCContext = cache(async () => {
  return {
    // 認証済みの場合のみユーザー情報を保持する(未認証なら null)
    user: await getAuthUser(),
  };
});

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  // user を非 null に絞り込んだコンテキストで後続の処理を実行する
  return opts.next({
    ctx: { user: ctx.user },
  });
});
