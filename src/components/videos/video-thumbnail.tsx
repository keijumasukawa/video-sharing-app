import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { THUMBNAIL_FALLBACK } from "@/constants/videos";

interface VideoThumbnailProps {
  playbackId: string | null;
  title: string;
}

export function VideoThumbnail({ playbackId, title }: VideoThumbnailProps) {
  const src = playbackId
    ? `https://image.mux.com/${playbackId}/thumbnail.webp`
    : THUMBNAIL_FALLBACK;

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted/50">
      <Image
        src={src}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover group-hover:opacity-0"
        unoptimized={!playbackId}
      />
      {playbackId && (
        <Image
          src={`https://image.mux.com/${playbackId}/animated.webp`}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover opacity-0 group-hover:opacity-100"
          unoptimized
        />
      )}
    </div>
  );
}

export function VideoThumbnailSkeleton() {
  return <Skeleton className="aspect-video w-full rounded-lg" />;
}
