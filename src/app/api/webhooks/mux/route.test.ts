import { createHmac } from "node:crypto";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("server-only", () => ({}));

const TEST_SECRET = "test-webhook-secret";
const ENDPOINT = "http://localhost:3000/api/webhooks/mux";

beforeAll(() => {
  vi.stubEnv("MUX_TOKEN_ID", "test-token-id");
  vi.stubEnv("MUX_TOKEN_SECRET", "test-token-secret");
  vi.stubEnv("MUX_WEBHOOK_SECRET", TEST_SECRET);
});

function signedHeaders(body: string, secret: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  return { "mux-signature": `t=${timestamp},v1=${signature}` };
}

function buildRequest(body: string, headers: Record<string, string>) {
  return new Request(ENDPOINT, { method: "POST", headers, body });
}

describe("POST /api/webhooks/mux", () => {
  const body = JSON.stringify({ type: "video.asset.ready", data: {} });

  it("正しい署名のリクエストを受理する", async () => {
    const response = await POST(
      buildRequest(body, signedHeaders(body, TEST_SECRET)),
    );
    expect(response.status).toBe(200);
  });

  it("署名が不正なリクエストを 401 で拒否する", async () => {
    const response = await POST(
      buildRequest(body, signedHeaders(body, "wrong-secret")),
    );
    expect(response.status).toBe(401);
  });

  it("署名ヘッダーが無いリクエストを 401 で拒否する", async () => {
    const response = await POST(buildRequest(body, {}));
    expect(response.status).toBe(401);
  });
});
