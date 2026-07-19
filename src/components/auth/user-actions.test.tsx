import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UserActions } from "./user-actions";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signOut: vi.fn(),
    },
  }),
}));

describe("UserActions", () => {
  afterEach(() => {
    cleanup();
  });

  it("未認証時は Sign in / Sign up ボタンを表示する", () => {
    render(<UserActions user={null} />);
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeDefined();
  });

  it("認証時はメールアドレスの頭文字のアバターメニューを表示する", () => {
    render(
      <UserActions
        user={{
          id: "11111111-1111-1111-1111-111111111111",
          email: "you@example.com",
        }}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Open user menu" });
    expect(within(trigger).getByText("Y")).toBeDefined();
  });

  it("アバターメニューを開くとメールアドレスとログアウトが表示される", async () => {
    render(
      <UserActions
        user={{
          id: "11111111-1111-1111-1111-111111111111",
          email: "you@example.com",
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open user menu" }));

    const menu = await screen.findByRole("menu");
    expect(within(menu).getByText("you@example.com")).toBeDefined();
    expect(
      within(menu).getByRole("menuitem", { name: "Log out" }),
    ).toBeDefined();
  });
});
