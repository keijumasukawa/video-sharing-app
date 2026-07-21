import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { VideoTable } from "./video-table";

beforeAll(() => {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
});

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

    expect(screen.getByText("Test Video")).toBeDefined();
    expect(screen.getByText("19 Jul 2026")).toBeDefined();
  });

  it("エンコード完了の動画を Published と表示する", () => {
    mockVideos([baseVideo]);
    render(<VideoTable />);

    expect(screen.getByText("Published")).toBeDefined();
  });

  it("エンコード中の動画を Processing と表示する", () => {
    mockVideos([{ ...baseVideo, status: "waiting" as const }]);
    render(<VideoTable />);

    expect(screen.getByText("Processing")).toBeDefined();
  });

  it("エンコードに失敗した動画を Error と表示する", () => {
    mockVideos([{ ...baseVideo, status: "errored" as const }]);
    render(<VideoTable />);

    expect(screen.getByText("Error")).toBeDefined();
  });

  it("動画がない場合は空状態を表示する", () => {
    mockVideos([]);
    render(<VideoTable />);

    expect(
      screen.getByText("You have not uploaded any videos yet."),
    ).toBeDefined();
  });

  it("行をクリックすると編集ダイアログが開く", () => {
    mockVideos([baseVideo]);
    render(<VideoTable />);

    expect(screen.queryByText("editing:Test Video")).toBeNull();
    fireEvent.click(screen.getByText("Test Video"));
    expect(screen.getByText("editing:Test Video")).toBeDefined();
  });

  it("行のチェックボックスを選択すると削除ボタンが表示される", () => {
    mockVideos([baseVideo]);
    render(<VideoTable />);

    expect(screen.queryByText("Delete (1)")).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select video" }));

    expect(screen.getByText("1 selected")).toBeDefined();
    expect(screen.getByText("Delete (1)")).toBeDefined();
  });

  it("ヘッダーのチェックボックスで全選択できる", () => {
    mockVideos([
      baseVideo,
      { ...baseVideo, id: "33333333-3333-3333-3333-333333333333" },
    ]);
    render(<VideoTable />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Select all" }));

    expect(screen.getByText("2 selected")).toBeDefined();
    expect(screen.getByText("Delete (2)")).toBeDefined();
  });

  it("全選択済みのヘッダーのチェックボックスで全解除できる", () => {
    mockVideos([baseVideo]);
    render(<VideoTable />);

    const selectAll = screen.getByRole("checkbox", { name: "Select all" });
    fireEvent.click(selectAll);
    fireEvent.click(selectAll);

    expect(screen.queryByText("1 selected")).toBeNull();
  });

  it("チェックボックスの選択では編集ダイアログを開かない", () => {
    mockVideos([baseVideo]);
    render(<VideoTable />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Select video" }));

    expect(screen.queryByText("editing:Test Video")).toBeNull();
  });

  it("動画がない場合もアップロードボタンを表示する", () => {
    mockVideos([]);
    render(<VideoTable />);

    expect(screen.getByRole("button", { name: "Upload" })).toBeDefined();
  });
});
