"use client";

import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
  playbackId: string;
  title: string;
  videoId: string;
}

export function VideoPlayer({ playbackId, title, videoId }: VideoPlayerProps) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      metadata={{ video_id: videoId, video_title: title }}
      className="h-full w-full"
      accentColor="var(--color-primary)"
      autoPlay
      muted
    />
  );
}
