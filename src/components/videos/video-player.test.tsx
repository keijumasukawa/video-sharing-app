import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VideoPlayer } from "./video-player";

vi.mock("@mux/mux-player-react", () => ({
  default: ({
    playbackId,
    metadata,
  }: {
    playbackId: string;
    metadata: { video_id: string; video_title: string };
  }) => (
    <div
      data-testid="mux-player"
      data-playback-id={playbackId}
      data-video-id={metadata.video_id}
      data-video-title={metadata.video_title}
    />
  ),
}));

describe("VideoPlayer", () => {
  afterEach(() => {
    cleanup();
  });

  it("Playback ID を MuxPlayer に渡す", () => {
    render(
      <VideoPlayer
        playbackId="test-playback-id"
        title="Test Video"
        videoId="test-video-id"
      />,
    );
    const player = screen.getByTestId("mux-player");
    expect(player.getAttribute("data-playback-id")).toBe("test-playback-id");
  });

  it("メタデータに動画IDとタイトルを渡す", () => {
    render(
      <VideoPlayer
        playbackId="test-playback-id"
        title="Test Video"
        videoId="test-video-id"
      />,
    );
    const player = screen.getByTestId("mux-player");
    expect(player.getAttribute("data-video-id")).toBe("test-video-id");
    expect(player.getAttribute("data-video-title")).toBe("Test Video");
  });
});
