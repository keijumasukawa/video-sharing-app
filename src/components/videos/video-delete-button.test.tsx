import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VideoDeleteButton } from "./video-delete-button";

const { mutationFnMock, notifySuccessMock } = vi.hoisted(() => ({
  mutationFnMock: vi.fn<(input: { ids: string[] }) => Promise<{ deletedCount: number }>>(
    async () => ({ deletedCount: 2 }),
  ),
  notifySuccessMock: vi.fn(),
}));

vi.mock("@/lib/notify", () => ({
  notifySuccess: notifySuccessMock,
  notifyError: vi.fn(),
}));

vi.mock("@/trpc/client", () => ({
  useTRPC: () => ({
    videos: {
      remove: {
        mutationOptions: (options: object) => ({
          ...options,
          mutationFn: mutationFnMock,
        }),
      },
      pathFilter: () => ({ queryKey: [["videos"]] }),
    },
  }),
}));

const IDS = [
  "11111111-1111-1111-1111-111111111111",
  "22222222-2222-2222-2222-222222222222",
];

function renderButton(onDeleted = vi.fn()) {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <VideoDeleteButton ids={IDS} onDeleted={onDeleted} />
    </QueryClientProvider>,
  );
  return { onDeleted };
}

describe("VideoDeleteButton", () => {
  afterEach(() => {
    cleanup();
    mutationFnMock.mockClear();
    notifySuccessMock.mockClear();
  });

  it("削除ボタンを押すと確認ダイアログが表示される", async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByText("Delete 2 videos?")).toBeInTheDocument();
  });

  it("確認ダイアログで確定すると選択した動画の削除を実行する", async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Delete",
      }),
    );

    await waitFor(() => {
      expect(mutationFnMock.mock.calls[0]?.[0]).toEqual({ ids: IDS });
    });
  });

  it("削除に成功すると件数を通知し選択を解除する", async () => {
    const user = userEvent.setup();
    const { onDeleted } = renderButton();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Delete",
      }),
    );

    await waitFor(() => {
      expect(notifySuccessMock).toHaveBeenCalledWith("2 videos deleted");
      expect(onDeleted).toHaveBeenCalled();
    });
  });

  it("キャンセルすると削除を実行しない", async () => {
    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(mutationFnMock).not.toHaveBeenCalled();
  });
});
