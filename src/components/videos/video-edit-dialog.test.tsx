import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VideoEditDialog } from "./video-edit-dialog";

const { mutationFnMock } = vi.hoisted(() => ({
  mutationFnMock: vi.fn(async (input: unknown) => input),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/trpc/client", () => ({
  useTRPC: () => ({
    videos: {
      update: {
        mutationOptions: (options: object) => ({
          ...options,
          mutationFn: mutationFnMock,
        }),
      },
      getMine: {
        infiniteQueryFilter: () => ({ queryKey: [["videos", "getMine"]] }),
      },
      getOne: {
        queryFilter: () => ({ queryKey: [["videos", "getOne"]] }),
      },
    },
  }),
}));

const video = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Current Title",
  description: "Current description",
};

function renderDialog(
  props: Partial<React.ComponentProps<typeof VideoEditDialog>> = {},
) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <VideoEditDialog video={video} onOpenChange={vi.fn()} {...props} />
    </QueryClientProvider>,
  );
}

describe("VideoEditDialog", () => {
  afterEach(() => {
    cleanup();
    mutationFnMock.mockClear();
  });

  it("動画が未選択の場合は表示しない", () => {
    renderDialog({ video: null });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("現在のタイトルと説明を初期値として表示する", () => {
    renderDialog();
    expect(screen.getByLabelText("Title")).toHaveValue("Current Title");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "Current description",
    );
  });

  it("説明が未設定の場合は空欄で表示する", () => {
    renderDialog({ video: { ...video, description: null } });
    expect(screen.getByLabelText("Description")).toHaveValue("");
  });

  it("タイトルが空の場合は保存せずエラーを表示する", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.clear(screen.getByLabelText("Title"));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Title is required.")).toBeInTheDocument();
    expect(mutationFnMock).not.toHaveBeenCalled();
  });

  it("入力内容を保存する", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "New Title");
    await user.clear(screen.getByLabelText("Description"));
    await user.type(screen.getByLabelText("Description"), "New description");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mutationFnMock.mock.calls[0]?.[0]).toEqual({
        id: video.id,
        title: "New Title",
        description: "New description",
      });
    });
  });

  it("保存に成功するとダイアログを閉じる", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderDialog({ onOpenChange });

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
