import { createHmac } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { videos } from "@/db/schema";
import { POST } from "./route";

vi.mock("server-only", () => ({}));

// Drizzle の update チェーン(update().set().where())をモックし、実DBに接続せず検証する
const { updateMock, setMock, whereMock } = vi.hoisted(() => {
  const whereMock = vi.fn(async () => []);
  const setMock = vi.fn(() => ({ where: whereMock }));
  const updateMock = vi.fn(() => ({ set: setMock }));
  return { updateMock, setMock, whereMock };
});

vi.mock("@/db", () => ({
  db: { update: updateMock },
}));

const TEST_SECRET = "test-webhook-secret";
const ENDPOINT = "http://localhost:3000/api/webhooks/mux";

beforeAll(() => {
  vi.stubEnv("MUX_TOKEN_ID", "test-token-id");
  vi.stubEnv("MUX_TOKEN_SECRET", "test-token-secret");
  vi.stubEnv("MUX_WEBHOOK_SECRET", TEST_SECRET);
});

beforeEach(() => {
  updateMock.mockClear();
  setMock.mockClear();
  whereMock.mockClear();
});

function signedHeaders(body: string, secret: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  return { "mux-signature": `t=${timestamp},v1=${signature}` };
}

function buildSignedRequest(payload: object, secret = TEST_SECRET) {
  const body = JSON.stringify(payload);
  return new Request(ENDPOINT, {
    method: "POST",
    headers: signedHeaders(body, secret),
    body,
  });
}

describe("POST /api/webhooks/mux", () => {
  const readyPayload = { type: "video.asset.ready", data: {} };

  it("正しい署名のリクエストを受理する", async () => {
    const response = await POST(buildSignedRequest(readyPayload));
    expect(response.status).toBe(200);
  });

  it("署名が不正なリクエストを 401 で拒否する", async () => {
    const response = await POST(
      buildSignedRequest(readyPayload, "wrong-secret"),
    );
    expect(response.status).toBe(401);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("署名ヘッダーが無いリクエストを 401 で拒否する", async () => {
    const body = JSON.stringify(readyPayload);
    const response = await POST(
      new Request(ENDPOINT, { method: "POST", body }),
    );
    expect(response.status).toBe(401);
  });

  it("video.upload.asset_created でアセットIDと preparing 状態を保存する", async () => {
    const response = await POST(
      buildSignedRequest({
        type: "video.upload.asset_created",
        data: { id: "upload-1", asset_id: "asset-1" },
      }),
    );
    expect(response.status).toBe(200);
    expect(setMock).toHaveBeenNthCalledWith(1, { muxAssetId: "asset-1" });
    expect(setMock).toHaveBeenNthCalledWith(2, { status: "preparing" });
  });

  it("video.upload.asset_created は status 単独の更新に waiting の条件を付ける", async () => {
    await POST(
      buildSignedRequest({
        type: "video.upload.asset_created",
        data: { id: "upload-1", asset_id: "asset-1" },
      }),
    );
    expect(whereMock).toHaveBeenNthCalledWith(
      2,
      and(eq(videos.muxUploadId, "upload-1"), eq(videos.status, "waiting")),
    );
  });

  it("video.asset.ready で再生ID・長さ・ready 状態を保存する", async () => {
    const response = await POST(
      buildSignedRequest({
        type: "video.asset.ready",
        data: {
          id: "asset-1",
          upload_id: "upload-1",
          duration: 12.34,
          playback_ids: [{ id: "playback-1", policy: "public" }],
        },
      }),
    );
    expect(response.status).toBe(200);
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "ready",
        muxPlaybackId: "playback-1",
        duration: 12.34,
      }),
    );
  });

  it("video.asset.errored で errored 状態を保存する", async () => {
    const response = await POST(
      buildSignedRequest({
        type: "video.asset.errored",
        data: { id: "asset-1", upload_id: "upload-1" },
      }),
    );
    expect(response.status).toBe(200);
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "errored" }),
    );
  });

  it("処理対象外のイベントは DB を更新せず 200 を返す", async () => {
    const response = await POST(
      buildSignedRequest({
        type: "video.asset.created",
        data: { id: "asset-1" },
      }),
    );
    expect(response.status).toBe(200);
    expect(updateMock).not.toHaveBeenCalled();
  });
});
