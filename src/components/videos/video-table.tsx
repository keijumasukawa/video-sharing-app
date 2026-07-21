"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEFAULT_LIMIT,
  PROCESSING_REFETCH_INTERVAL,
  VIDEO_STATUS_LABELS,
} from "@/constants/videos";
import { formatDate } from "@/lib/format";
import { useTRPC } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";
import { VideoEditDialog } from "./video-edit-dialog";
import { VideoThumbnail } from "./video-thumbnail";
import { VideoUploadDialog } from "./video-upload-dialog";

const SKELETON_COUNT = 5;

type VideoListItem =
  inferRouterOutputs<AppRouter>["videos"]["getMine"]["items"][number];

export function VideoTable() {
  return (
    <ErrorBoundary
      fallback={
        <p className="text-muted-foreground p-4 text-sm">
          Failed to load videos. Please try again later.
        </p>
      }
    >
      <Suspense fallback={<VideoTableSkeleton />}>
        <VideoTableContent />
      </Suspense>
    </ErrorBoundary>
  );
}

function StickyBar() {
  return (
    <div className="bg-background sticky top-(--header-height,3.5rem) z-10 flex items-center justify-between gap-4 border-b px-4 py-2">
      <h1 className="text-sm font-medium">My Videos</h1>
      <VideoUploadDialog />
    </div>
  );
}

function VideoTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-full">Video</TableHead>
        <TableHead className="w-32">Status</TableHead>
        <TableHead className="w-32">Date</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function VideoTableContent() {
  const trpc = useTRPC();
  const [editingVideo, setEditingVideo] = useState<VideoListItem | null>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      trpc.videos.getMine.infiniteQueryOptions(
        { limit: DEFAULT_LIMIT },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          refetchInterval: (query) => {
            const items =
              query.state.data?.pages.flatMap((page) => page.items) ?? [];
            return items.some((video) => video.status !== "ready")
              ? PROCESSING_REFETCH_INTERVAL
              : false;
          },
        },
      ),
    );

  const videos = data.pages.flatMap((page) => page.items);

  return (
    <>
      <VideoEditDialog
        video={editingVideo}
        onOpenChange={(open) => {
          if (!open) {
            setEditingVideo(null);
          }
        }}
      />
      <StickyBar />
      {videos.length === 0 ? (
        <p className="text-muted-foreground p-4 text-sm">
          You have not uploaded any videos yet.
        </p>
      ) : (
        <>
          <Table>
            <VideoTableHeader />
            <TableBody>
              {videos.map((video) => (
                <TableRow
                  key={video.id}
                  className="cursor-pointer"
                  onClick={() => setEditingVideo(video)}
                >
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-36 shrink-0">
                        <VideoThumbnail
                          playbackId={video.muxPlaybackId}
                          duration={video.duration}
                          title={video.title}
                        />
                      </div>
                      <span className="line-clamp-1 text-sm">
                        {video.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        video.status === "errored" ? "destructive" : "secondary"
                      }
                    >
                      {VIDEO_STATUS_LABELS[video.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(video.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <InfiniteScroll
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        </>
      )}
    </>
  );
}

function VideoTableSkeleton() {
  return (
    <>
      <StickyBar />
      <Table>
        <VideoTableHeader />
        <TableBody>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-36 rounded-lg" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
