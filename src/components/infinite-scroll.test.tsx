import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { InfiniteScroll } from "./infinite-scroll";

beforeAll(() => {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
});

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
    expect(screen.getByRole("button", { name: "Load more" })).toBeDefined();
  });

  it("Load more ボタンのクリックで fetchNextPage が呼ばれる", () => {
    const fetchNextPage = vi.fn();
    render(
      <InfiniteScroll
        hasNextPage
        isFetchingNextPage={false}
        fetchNextPage={fetchNextPage}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
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
    const button = screen.getByRole("button", { name: "Loading..." });
    expect(button.hasAttribute("disabled")).toBe(true);
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
    ).toBeDefined();
    expect(screen.queryByRole("button")).toBeNull();
  });
});