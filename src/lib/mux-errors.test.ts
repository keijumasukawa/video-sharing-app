import Mux from "@mux/mux-node";
import { describe, expect, it } from "vitest";
import { isMuxAssetLimitError } from "./mux-errors";

function makeApiError(status: number, messages: string[]) {
  return Mux.APIError.generate(
    status,
    { error: { type: "invalid_parameters", messages } },
    undefined,
    new Headers(),
  );
}

describe("isMuxAssetLimitError", () => {
  it("アセット上限超過の 400 エラーを判定できる", () => {
    const error = makeApiError(400, [
      "Free plan is limited to 10 assets, you cannot create direct uploads while exceeding this limit",
    ]);
    expect(isMuxAssetLimitError(error)).toBe(true);
  });

  it("上限以外の 400 エラーは対象外と判定する", () => {
    const error = makeApiError(400, ["cors_origin is required"]);
    expect(isMuxAssetLimitError(error)).toBe(false);
  });

  it("400 以外のステータスは対象外と判定する", () => {
    const error = makeApiError(500, [
      "Free plan is limited to 10 assets, you cannot create direct uploads while exceeding this limit",
    ]);
    expect(isMuxAssetLimitError(error)).toBe(false);
  });

  it("Mux の API エラー以外は対象外と判定する", () => {
    expect(isMuxAssetLimitError(new Error("network error"))).toBe(false);
    expect(isMuxAssetLimitError(undefined)).toBe(false);
  });
});
