import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VideoUploadDialog } from "./video-upload-dialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
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
  });

  it("ボタンからダイアログが開きアップローダーが表示される", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));

    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByText("video-uploader-stub")).toBeDefined();
  });

  it("アップロード完了で完了メッセージに切り替わる", async () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));

    const dialog = within(screen.getByRole("dialog"));
    fireEvent.click(dialog.getByText("video-uploader-stub"));

    expect(
      await dialog.findByText(
        "Upload complete. Your video will be available after processing finishes.",
      ),
    ).toBeDefined();
    expect(dialog.queryByText("video-uploader-stub")).toBeNull();
  });
});
