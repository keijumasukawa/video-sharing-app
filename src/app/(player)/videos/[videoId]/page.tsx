import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { z } from "zod";
import { UserAvatar } from "@/components/user-avatar";
import { VideoPlayer } from "@/components/videos/video-player";
import { formatRelativeTime, formatUserName } from "@/lib/format";
import { caller } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface VideoPageProps {
  params: Promise<{ videoId: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { videoId } = await params;

  if (!z.uuid().safeParse(videoId).success) {
    notFound();
  }

  const video = await caller.videos.getOne({ id: videoId }).catch((error) => {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  });

  return (
    <>
      <div className="flex h-[calc(100svh-var(--header-height,3.5rem))] w-full items-center justify-center bg-black">
        {video.muxPlaybackId ? (
          <VideoPlayer
            playbackId={video.muxPlaybackId}
            title={video.title}
            videoId={video.id}
          />
        ) : (
          <p className="text-sm text-white/60">Video is being processed...</p>
        )}
      </div>
      <div className="flex-1 bg-card">
        <div className="mx-auto w-full max-w-4xl px-4 py-8">
          <h1 className="text-2xl font-semibold">{video.title}</h1>
          <div className="mt-4 flex items-center gap-3">
            <UserAvatar user={video.user} size="lg" />
            <p className="text-sm font-medium">{formatUserName(video.user)}</p>
          </div>
          <div className="mt-4 rounded-xl bg-muted/50 p-4">
            <p className="text-sm font-medium">
              {formatRelativeTime(video.createdAt)}
            </p>
            {video.description && (
              <p className="mt-2 text-sm whitespace-pre-wrap">
                {video.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
