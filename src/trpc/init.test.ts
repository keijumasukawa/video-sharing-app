import { describe, expect, it } from "vitest";
import { createTRPCRouter, protectedProcedure } from "./init";

const testRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => ctx.user.id),
});

describe("protectedProcedure", () => {
  it("未認証の呼び出しを UNAUTHORIZED で拒否する", async () => {
    const caller = testRouter.createCaller({ user: null });
    await expect(caller.me()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("認証済みの呼び出しではコンテキストのユーザーを参照できる", async () => {
    const caller = testRouter.createCaller({
      user: { id: "11111111-1111-1111-1111-111111111111", email: null },
    });
    await expect(caller.me()).resolves.toBe(
      "11111111-1111-1111-1111-111111111111",
    );
  });
});
