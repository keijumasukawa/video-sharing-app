import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UPLOAD_SUCCESS_MESSAGE } from "@/constants/messages";
import { VideoUploadDialog } from "./video-upload-dialog";

const { notifySuccessMock } = vi.hoisted(() => ({
  notifySuccessMock: vi.fn(),
}));

vi.mock("@/lib/notify", () => ({
  notifySuccess: notifySuccessMock,
  notifyError: vi.fn(),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("./video-uploader", () => ({
  VideoUploader: ({ onSuccess }: { onSuccess: () => void }) => (
    <button type="button" onClick={onSuccess}>
      video-uploader-stub
    </button>
  ),
}));

vi.mock("@/trpc/client", () => ({
  useTRPC: () => ({
    videos: {
      create: {
        mutationOptions: () => ({
          mutationFn: async () => ({
            videoId: "11111111-1111-1111-1111-111111111111",
            uploadUrl: "https://example.com/upload",
          }),
        }),
      },
      getMine: {
        infiniteQueryFilter: () => ({ queryKey: [["videos", "getMine"]] }),
      },
    },
  }),
}));

function renderDialog() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <VideoUploadDialog />
    </QueryClientProvider>,
  );
}

describe("VideoUploadDialog", () => {
  afterEach(() => {
    cleanup();
    notifySuccessMock.mockClear();
  });

  it("ボタンからダイアログが開きアップローダーが表示される", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));

    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByText("video-uploader-stub")).toBeDefined();
  });

  it("アップロード完了でダイアログが閉じる", async () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));

    fireEvent.click(
      within(screen.getByRole("dialog")).getByText("video-uploader-stub"),
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("アップロード完了で成功を通知する", async () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));

    fireEvent.click(
      within(screen.getByRole("dialog")).getByText("video-uploader-stub"),
    );

    await waitFor(() => {
      expect(notifySuccessMock).toHaveBeenCalledWith(UPLOAD_SUCCESS_MESSAGE);
    });
  });
});
