import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VideoTable } from "./video-table";

type VideoRow = Omit<typeof baseVideo, "status"> & {
  status: "waiting" | "preparing" | "ready" | "errored";
};

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
};

const { useSuspenseInfiniteQueryMock } = vi.hoisted(() => ({
  useSuspenseInfiniteQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useSuspenseInfiniteQuery: useSuspenseInfiniteQueryMock,
}));

vi.mock("./video-upload-dialog", () => ({
  VideoUploadDialog: () => <button type="button">Upload</button>,
}));

vi.mock("./video-edit-dialog", () => ({
  VideoEditDialog: ({ video }: { video: { title: string } | null }) =>
    video ? <div>editing:{video.title}</div> : null,
}));

vi.mock("./video-delete-button", () => ({
  VideoDeleteButton: ({ ids }: { ids: string[] }) => (
    <button type="button">Delete ({ids.length})</button>
  ),
}));

vi.mock("@/trpc/client", () => ({
  useTRPC: () => ({
    videos: {
      getMine: { infiniteQueryOptions: () => ({}) },
    },
  }),
}));

function mockVideos(items: VideoRow[]) {
  useSuspenseInfiniteQueryMock.mockReturnValue({
    data: { pages: [{ items, nextCursor: null }] },
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  });
}

describe("VideoTable", () => {
  beforeEach(() => {
    useSuspenseInfiniteQueryMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("動画のタイトルと投稿日を表示する", () => {
    mockVideos([baseVideo]);
    render(<VideoTable />);

    expect(screen.getByText("Test Video")).toBeInTheDocument();
    expect(screen.getByText("19 Jul 2026")).toBeInTheDocument();
  });

  it("エンコード完了の動画を Published と表示する", () => {
    mockVideos([baseVideo]);
    render(<VideoTable />);

    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("エンコード中の動画を Processing と表示する", () => {
    mockVideos([{ ...baseVideo, status: "waiting" as const }]);
    render(<VideoTable />);

    expect(screen.getByText("Processing")).toBeInTheDocument();
  });

  it("エンコードに失敗した動画を Error と表示する", () => {
    mockVideos([{ ...baseVideo, status: "errored" as const }]);
    render(<VideoTable />);

    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("動画がない場合は空状態を表示する", () => {
    mockVideos([]);
    render(<VideoTable />);

    expect(
      screen.getByText("You have not uploaded any videos yet."),
    ).toBeInTheDocument();
  });

  it("行をクリックすると編集ダイアログが開く", async () => {
    const user = userEvent.setup();
    mockVideos([baseVideo]);
    render(<VideoTable />);

    expect(screen.queryByText("editing:Test Video")).not.toBeInTheDocument();
    await user.click(screen.getByText("Test Video"));
    expect(screen.getByText("editing:Test Video")).toBeInTheDocument();
  });

  it("行のチェックボックスを選択すると削除ボタンが表示される", async () => {
    const user = userEvent.setup();
    mockVideos([baseVideo]);
    render(<VideoTable />);

    expect(screen.queryByText("Delete (1)")).not.toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Select video" }));

    expect(screen.getByText("1 selected")).toBeInTheDocument();
    expect(screen.getByText("Delete (1)")).toBeInTheDocument();
  });

  it("ヘッダーのチェックボックスで全選択できる", async () => {
    const user = userEvent.setup();
    mockVideos([
      baseVideo,
      { ...baseVideo, id: "33333333-3333-3333-3333-333333333333" },
    ]);
    render(<VideoTable />);

    await user.click(screen.getByRole("checkbox", { name: "Select all" }));

    expect(screen.getByText("2 selected")).toBeInTheDocument();
    expect(screen.getByText("Delete (2)")).toBeInTheDocument();
  });

  it("全選択済みのヘッダーのチェックボックスで全解除できる", async () => {
    const user = userEvent.setup();
    mockVideos([baseVideo]);
    render(<VideoTable />);

    const selectAll = screen.getByRole("checkbox", { name: "Select all" });
    await user.click(selectAll);
    await user.click(selectAll);

    expect(screen.queryByText("1 selected")).not.toBeInTheDocument();
  });

  it("チェックボックスの選択では編集ダイアログを開かない", async () => {
    const user = userEvent.setup();
    mockVideos([baseVideo]);
    render(<VideoTable />);

    await user.click(screen.getByRole("checkbox", { name: "Select video" }));

    expect(screen.queryByText("editing:Test Video")).not.toBeInTheDocument();
  });

  it("動画がない場合もアップロードボタンを表示する", () => {
    mockVideos([]);
    render(<VideoTable />);

    expect(screen.getByRole("button", { name: "Upload" })).toBeInTheDocument();
  });
});
