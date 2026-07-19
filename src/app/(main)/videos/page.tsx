import { VideoGrid } from "@/components/videos/video-grid";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default function VideosPage() {
  prefetch(trpc.videos.list.queryOptions());

  return (
    <HydrateClient>
      <VideoGrid />
    </HydrateClient>
  );
}
