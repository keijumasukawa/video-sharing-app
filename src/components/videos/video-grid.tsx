"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTRPC } from "@/trpc/client";
import { VideoGridCard, VideoGridCardSkeleton } from "./video-grid-card";

const SKELETON_COUNT = 6;

const gridClassName = "grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3";

export function VideoGrid() {
  return (
    <ErrorBoundary
      fallback={
        <p className="p-4 text-sm text-muted-foreground">
          Failed to load videos. Please try again later.
        </p>
      }
    >
      <Suspense fallback={<VideoGridSkeleton />}>
        <VideoGridList />
      </Suspense>
    </ErrorBoundary>
  );
}

function VideoGridList() {
  const trpc = useTRPC();
  const { data: videos } = useSuspenseQuery(trpc.videos.list.queryOptions());

  if (videos.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">No videos yet.</p>;
  }

  return (
    <div className={gridClassName}>
      {videos.map((video) => (
        <VideoGridCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function VideoGridSkeleton() {
  return (
    <div className={gridClassName}>
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <VideoGridCardSkeleton key={index} />
      ))}
    </div>
  );
}
