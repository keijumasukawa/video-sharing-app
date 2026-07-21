import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime, formatUserName } from "@/lib/format";
import type { RouterOutputs } from "@/trpc/types";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";

type VideoListItem = RouterOutputs["videos"]["list"]["items"][number];

interface VideoGridCardProps {
  video: VideoListItem;
}

export function VideoGridCard({ video }: VideoGridCardProps) {
  return (
    <Link href={`/videos/${video.id}`} className="group flex flex-col gap-2">
      <VideoThumbnail
        playbackId={video.muxPlaybackId}
        duration={video.duration}
        title={video.title}
      />
      <div className="flex gap-3">
        <UserAvatar user={video.user} />
        <div className="flex flex-col gap-0.5">
          <p className="line-clamp-2 text-sm font-medium group-hover:text-primary">
            {video.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatUserName(video.user)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function VideoGridCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <VideoThumbnailSkeleton />
      <div className="flex gap-3">
        <Skeleton className="size-8 rounded-full" />
        <div className="flex flex-1 flex-col gap-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </div>
  );
}
