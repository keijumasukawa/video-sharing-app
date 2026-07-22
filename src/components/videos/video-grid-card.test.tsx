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
  duration: 125,
  createdAt: new Date("2026-07-19T11:00:00Z"),
  updatedAt: new Date("2026-07-19T11:00:00Z"),
  user: {
    firstName: "Taro",
    lastName: "Yamada",
    avatarUrl: null,
  },
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
    expect(screen.getByText("Test Video")).toBeInTheDocument();
    expect(screen.getByText("about 1 hour ago")).toBeInTheDocument();
  });

  it("動画再生ページへのリンクを持つ", () => {
    render(<VideoGridCard video={baseVideo} />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      `/videos/${baseVideo.id}`,
    );
  });

  it("Mux のサムネイル画像を表示する", () => {
    render(<VideoGridCard video={baseVideo} />);
    expect(screen.getByRole("img", { name: "Test Video" })).toHaveAttribute(
      "src",
      expect.stringContaining(
        encodeURIComponent(
          "https://image.mux.com/test-playback-id/thumbnail.webp",
        ),
      ),
    );
  });

  it("Playback ID がない場合はプレースホルダー画像を表示する", () => {
    render(<VideoGridCard video={{ ...baseVideo, muxPlaybackId: null }} />);
    expect(screen.getByRole("img", { name: "Test Video" })).toHaveAttribute(
      "src",
      expect.stringContaining("placeholder.svg"),
    );
  });

  it("Playback ID がある場合はホバープレビュー画像を含む", () => {
    render(<VideoGridCard video={baseVideo} />);
    expect(screen.getByRole("presentation")).toHaveAttribute(
      "src",
      expect.stringContaining("animated.webp"),
    );
  });

  it("Playback ID がない場合はホバープレビュー画像を含まない", () => {
    render(<VideoGridCard video={{ ...baseVideo, muxPlaybackId: null }} />);
    expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
  });

  it("投稿者の氏名を表示する", () => {
    render(<VideoGridCard video={baseVideo} />);
    expect(screen.getByText("Taro Yamada")).toBeInTheDocument();
  });

  it("アバター画像がない場合はイニシャルを表示する", () => {
    render(<VideoGridCard video={baseVideo} />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("動画の長さバッジを表示する", () => {
    render(<VideoGridCard video={baseVideo} />);
    expect(screen.getByText("2:05")).toBeInTheDocument();
  });

  it("長さが未取得の場合はバッジを表示しない", () => {
    render(<VideoGridCard video={{ ...baseVideo, duration: null }} />);
    expect(screen.queryByText("2:05")).not.toBeInTheDocument();
  });
});
