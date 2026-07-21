import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  UPLOAD_ERROR_MESSAGE,
  UPLOAD_SUCCESS_MESSAGE,
} from "@/constants/messages";
import { VideoUploadDialog } from "./video-upload-dialog";

const { createUploadMock, mutationFnMock, notifyErrorMock, notifySuccessMock } =
  vi.hoisted(() => ({
    createUploadMock: vi.fn(),
    mutationFnMock:
      vi.fn<
        (input: {
          title: string;
          description: string | null;
        }) => Promise<{ videoId: string; uploadUrl: string }>
      >(),
    notifyErrorMock: vi.fn(),
    notifySuccessMock: vi.fn(),
  }));

vi.mock("@mux/upchunk", () => ({
  createUpload: createUploadMock,
}));

vi.mock("@/lib/notify", () => ({
  notifySuccess: notifySuccessMock,
  notifyError: notifyErrorMock,
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/trpc/client", () => ({
  useTRPC: () => ({
    videos: {
      create: {
        mutationOptions: () => ({ mutationFn: mutationFnMock }),
      },
      getMine: {
        infiniteQueryFilter: () => ({ queryKey: [["videos", "getMine"]] }),
      },
    },
  }),
}));

type UploadHandler = (event: { detail: unknown }) => void;

function stubUpload() {
  const handlers: Record<string, UploadHandler> = {};
  createUploadMock.mockReturnValue({
    on: (eventName: string, handler: UploadHandler) => {
      handlers[eventName] = handler;
    },
  });
  return handlers;
}

function renderDialog() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <VideoUploadDialog />
    </QueryClientProvider>,
  );
}

function openDialog() {
  fireEvent.click(screen.getByRole("button", { name: "Upload" }));
  return within(screen.getByRole("dialog"));
}

function selectFile(dialog: ReturnType<typeof within>, fileName: string) {
  const file = new File(["video"], fileName, { type: "video/mp4" });
  fireEvent.change(dialog.getByLabelText("Select file"), {
    target: { files: [file] },
  });
  return file;
}

function save(dialog: ReturnType<typeof within>) {
  fireEvent.click(dialog.getByRole("button", { name: "Save" }));
}

describe("VideoUploadDialog", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("ボタンからダイアログが開きフォームが表示される", () => {
    renderDialog();
    const dialog = openDialog();

    expect(dialog.getByLabelText("Select file")).toBeDefined();
    expect(dialog.getByText("No file selected")).toBeDefined();
    expect(dialog.getByLabelText("Title")).toBeDefined();
    expect(dialog.getByLabelText("Description")).toBeDefined();
    expect(dialog.getByRole("button", { name: "Save" })).toBeDefined();
  });

  it("ファイル未選択で保存するとエラーが表示され登録されない", async () => {
    renderDialog();
    const dialog = openDialog();
    save(dialog);

    expect(
      await dialog.findByText("Please select a video file."),
    ).toBeDefined();
    expect(mutationFnMock).not.toHaveBeenCalled();
  });

  it("保存するとタイトル・説明で登録しアップロードを開始する", async () => {
    stubUpload();
    mutationFnMock.mockResolvedValue({
      videoId: "11111111-1111-1111-1111-111111111111",
      uploadUrl: "https://example.com/upload",
    });
    renderDialog();
    const dialog = openDialog();
    const file = selectFile(dialog, "my-video.mp4");
    expect(dialog.getByText("my-video.mp4")).toBeDefined();
    fireEvent.change(dialog.getByLabelText("Title"), {
      target: { value: "My title" },
    });
    fireEvent.change(dialog.getByLabelText("Description"), {
      target: { value: "My description" },
    });
    save(dialog);

    await waitFor(() => {
      expect(mutationFnMock.mock.calls[0]?.[0]).toEqual({
        title: "My title",
        description: "My description",
      });
    });
    expect(createUploadMock).toHaveBeenCalledWith({
      endpoint: "https://example.com/upload",
      file,
    });
  });

  it("タイトル未入力の場合は拡張子を除いたファイル名で登録する", async () => {
    stubUpload();
    mutationFnMock.mockResolvedValue({
      videoId: "11111111-1111-1111-1111-111111111111",
      uploadUrl: "https://example.com/upload",
    });
    renderDialog();
    const dialog = openDialog();
    selectFile(dialog, "my-video.mp4");
    save(dialog);

    await waitFor(() => {
      expect(mutationFnMock.mock.calls[0]?.[0]).toEqual({
        title: "my-video",
        description: null,
      });
    });
  });

  it("アップロード中は進捗が表示される", async () => {
    const handlers = stubUpload();
    mutationFnMock.mockResolvedValue({
      videoId: "11111111-1111-1111-1111-111111111111",
      uploadUrl: "https://example.com/upload",
    });
    renderDialog();
    const dialog = openDialog();
    selectFile(dialog, "my-video.mp4");
    save(dialog);

    await waitFor(() => {
      expect(createUploadMock).toHaveBeenCalled();
    });
    act(() => {
      handlers.progress?.({ detail: 42 });
    });

    expect(dialog.getByText("42%")).toBeDefined();
  });

  it("アップロード成功で通知しダイアログが閉じる", async () => {
    const handlers = stubUpload();
    mutationFnMock.mockResolvedValue({
      videoId: "11111111-1111-1111-1111-111111111111",
      uploadUrl: "https://example.com/upload",
    });
    renderDialog();
    const dialog = openDialog();
    selectFile(dialog, "my-video.mp4");
    save(dialog);

    await waitFor(() => {
      expect(createUploadMock).toHaveBeenCalled();
    });
    act(() => {
      handlers.success?.({ detail: undefined });
    });

    expect(notifySuccessMock).toHaveBeenCalledWith(UPLOAD_SUCCESS_MESSAGE);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("アップロード失敗でエラーを通知する", async () => {
    const handlers = stubUpload();
    mutationFnMock.mockResolvedValue({
      videoId: "11111111-1111-1111-1111-111111111111",
      uploadUrl: "https://example.com/upload",
    });
    renderDialog();
    const dialog = openDialog();
    selectFile(dialog, "my-video.mp4");
    save(dialog);

    await waitFor(() => {
      expect(createUploadMock).toHaveBeenCalled();
    });
    act(() => {
      handlers.error?.({ detail: new Error("failed") });
    });

    expect(notifyErrorMock).toHaveBeenCalledWith(UPLOAD_ERROR_MESSAGE);
  });
});
