import type Mux from "@mux/mux-node";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { getMux } from "@/lib/mux";

type WebhookEvent = Awaited<ReturnType<Mux["webhooks"]["unwrap"]>>;

export async function POST(request: Request) {
  const body = await request.text();

  let event: WebhookEvent;
  try {
    event = await getMux().webhooks.unwrap(body, request.headers);
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }

  switch (event.type) {
    // アップロード完了によりアセットが作成された(エンコード開始)
    case "video.upload.asset_created": {
      if (event.data.asset_id) {
        await db
          .update(videos)
          .set({ muxAssetId: event.data.asset_id })
          .where(eq(videos.muxUploadId, event.data.id));
        await db
          .update(videos)
          .set({ status: "preparing" })
          .where(
            and(
              eq(videos.muxUploadId, event.data.id),
              eq(videos.status, "waiting"),
            ),
          );
      }
      break;
    }
    // エンコードが完了し再生可能になった
    case "video.asset.ready": {
      if (event.data.upload_id) {
        await db
          .update(videos)
          .set({
            status: "ready",
            muxPlaybackId: event.data.playback_ids?.[0]?.id ?? null,
            duration: event.data.duration ?? null,
          })
          .where(eq(videos.muxUploadId, event.data.upload_id));
      }
      break;
    }
    // エンコードに失敗した
    case "video.asset.errored": {
      if (event.data.upload_id) {
        await db
          .update(videos)
          .set({ status: "errored" })
          .where(eq(videos.muxUploadId, event.data.upload_id));
      }
      break;
    }
    default:
      // 上記以外のイベントは処理対象外。200 を返して正常受信として応答する
      // (エラーを返すと Mux が再送を繰り返すため)
      break;
  }

  return Response.json({ received: true });
}
