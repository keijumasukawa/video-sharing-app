import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VideoGridCard } from "./video-grid-card";

const baseVideo = {
  id: "11111111-1111-1111-1111-111111111111",
  userId: "22222222-2222-2222-2222-222222222222",
  title: "Test Video",
  description: null,
  status: "ready" as const,
  muxUploadId: null,
  muxAssetId: null,
  muxPlaybackId: "test-playback-id",
  createdAt: new Date("2026-07-19T11:00:00Z"),
  updatedAt: new Date("2026-07-19T11:00:00Z"),
};

describe("VideoGridCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-19T12:00:00Z"));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("タイトルと相対時刻を表示する", () => {
    render(<VideoGridCard video={baseVideo} />);
    expect(screen.getByText("Test Video")).toBeDefined();
    expect(screen.getByText("about 1 hour ago")).toBeDefined();
  });

  it("動画再生ページへのリンクを持つ", () => {
    render(<VideoGridCard video={baseVideo} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe(`/videos/${baseVideo.id}`);
  });

  it("Mux のサムネイル画像を表示する", () => {
    render(<VideoGridCard video={baseVideo} />);
    const image = screen.getByRole("img", { name: "Test Video" });
    expect(image.getAttribute("src")).toContain(
      encodeURIComponent(
        "https://image.mux.com/test-playback-id/thumbnail.webp",
      ),
    );
  });

  it("Playback ID がない場合はプレースホルダー画像を表示する", () => {
    render(<VideoGridCard video={{ ...baseVideo, muxPlaybackId: null }} />);
    const image = screen.getByRole("img", { name: "Test Video" });
    expect(image.getAttribute("src")).toContain("placeholder.svg");
  });

  it("Playback ID がある場合はホバープレビュー画像を含む", () => {
    const { container } = render(<VideoGridCard video={baseVideo} />);
    const preview = container.querySelector('img[src*="animated.webp"]');
    expect(preview).not.toBeNull();
  });

  it("Playback ID がない場合はホバープレビュー画像を含まない", () => {
    const { container } = render(
      <VideoGridCard video={{ ...baseVideo, muxPlaybackId: null }} />,
    );
    const preview = container.querySelector('img[src*="animated.webp"]');
    expect(preview).toBeNull();
  });
});
