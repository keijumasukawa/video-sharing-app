import { VideoGrid } from "@/components/videos/video-grid";
import { DEFAULT_LIMIT } from "@/constants/videos";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default function VideosPage() {
  prefetch(
    trpc.videos.list.infiniteQueryOptions(
      { limit: DEFAULT_LIMIT },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <HydrateClient>
      <VideoGrid />
    </HydrateClient>
  );
}
