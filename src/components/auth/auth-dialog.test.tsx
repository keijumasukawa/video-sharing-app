import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthDialog } from "./auth-dialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  }),
}));

function openDialog() {
  render(<AuthDialog />);
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  return within(screen.getByRole("dialog"));
}

describe("AuthDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("トリガーからダイアログが開きデモアカウントが初期入力されている", () => {
    const dialog = openDialog();
    expect(
      (dialog.getByLabelText("Email") as HTMLInputElement).value,
    ).toBe("demo@example.com");
    expect(
      (dialog.getByLabelText("Password") as HTMLInputElement).value,
    ).toBe("password");
  });

  it("未入力で送信するとバリデーションエラーが表示される", async () => {
    const dialog = openDialog();
    fireEvent.change(dialog.getByLabelText("Email"), {
      target: { value: "" },
    });
    fireEvent.change(dialog.getByLabelText("Password"), {
      target: { value: "" },
    });
    fireEvent.click(dialog.getByRole("button", { name: "Sign in" }));
    expect(
      await dialog.findByText("Enter a valid email address"),
    ).toBeDefined();
    expect(await dialog.findByText("Enter your password")).toBeDefined();
  });

  it("サインアップ表示に切り替えるとパスワード確認欄が表示される", async () => {
    const dialog = openDialog();
    fireEvent.click(dialog.getByRole("button", { name: "Sign up" }));
    expect(await dialog.findByLabelText("Confirm password")).toBeDefined();
  });

  it("Sign up ボタンからサインアップフォームを直接開ける", async () => {
    render(<AuthDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));
    const dialog = within(screen.getByRole("dialog"));
    expect(await dialog.findByLabelText("Confirm password")).toBeDefined();
  });
});
