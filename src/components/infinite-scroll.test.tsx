import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InfiniteScroll } from "./infinite-scroll";

describe("InfiniteScroll", () => {
  afterEach(() => {
    cleanup();
  });

  it("次ページがある場合は Load more ボタンを表示する", () => {
    render(
      <InfiniteScroll
        hasNextPage
        isFetchingNextPage={false}
        fetchNextPage={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Load more" }),
    ).toBeInTheDocument();
  });

  it("Load more ボタンのクリックで fetchNextPage が呼ばれる", async () => {
    const user = userEvent.setup();
    const fetchNextPage = vi.fn();
    render(
      <InfiniteScroll
        hasNextPage
        isFetchingNextPage={false}
        fetchNextPage={fetchNextPage}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Load more" }));
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("追加読み込み中はボタンが無効化されローディング表示になる", () => {
    render(
      <InfiniteScroll
        hasNextPage
        isFetchingNextPage
        fetchNextPage={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Loading..." })).toBeDisabled();
  });

  it("全件到達時は終端メッセージを表示する", () => {
    render(
      <InfiniteScroll
        hasNextPage={false}
        isFetchingNextPage={false}
        fetchNextPage={vi.fn()}
      />,
    );
    expect(
      screen.getByText("You have reached the end of the list"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
