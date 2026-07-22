import { TRPCClientError } from "@trpc/client";
import { describe, expect, it } from "vitest";
import { resolveMutationErrorMessage } from "./mutation-errors";

function makeClientError(
  message: string,
  code: "CONFLICT" | "INTERNAL_SERVER_ERROR",
  httpStatus: number,
) {
  return new TRPCClientError(message, {
    result: {
      error: {
        message,
        code: -32009,
        data: { code, httpStatus },
      },
    },
  });
}

describe("resolveMutationErrorMessage", () => {
  it("CONFLICT エラーはサーバーのメッセージを返す", () => {
    const error = makeClientError("Upload limit reached.", "CONFLICT", 409);
    expect(resolveMutationErrorMessage(error, "fallback")).toBe(
      "Upload limit reached.",
    );
  });

  it("CONFLICT 以外の tRPC エラーはフォールバックを返す", () => {
    const error = makeClientError(
      "Something internal",
      "INTERNAL_SERVER_ERROR",
      500,
    );
    expect(resolveMutationErrorMessage(error, "fallback")).toBe("fallback");
  });

  it("tRPC 以外のエラーはフォールバックを返す", () => {
    expect(resolveMutationErrorMessage(new Error("boom"), "fallback")).toBe(
      "fallback",
    );
  });

  it("フォールバック未指定の場合は undefined を返す", () => {
    expect(resolveMutationErrorMessage(new Error("boom"), undefined)).toBe(
      undefined,
    );
  });
});
