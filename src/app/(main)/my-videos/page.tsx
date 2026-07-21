import { AuthDialog } from "@/components/auth/auth-dialog";
import { VideoTable } from "@/components/videos/video-table";
import { DEFAULT_LIMIT } from "@/constants/videos";
import { getAuthUser } from "@/lib/auth";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function MyVideosPage() {
  const user = await getAuthUser();

  if (!user) {
    return (
      <div className="flex flex-1 flex-col items-center gap-4 p-6 pt-16 text-center">
        <h1 className="text-2xl font-semibold">Manage your videos</h1>
        <p className="text-muted-foreground">
          Sign in to upload and manage your videos.
        </p>
        <AuthDialog />
      </div>
    );
  }

  prefetch(
    trpc.videos.getMine.infiniteQueryOptions(
      { limit: DEFAULT_LIMIT },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <HydrateClient>
      <VideoTable />
    </HydrateClient>
  );
}
