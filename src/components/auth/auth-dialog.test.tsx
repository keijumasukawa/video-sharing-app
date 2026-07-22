import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

type User = ReturnType<typeof userEvent.setup>;

async function openDialog(user: User) {
  render(<AuthDialog />);
  await user.click(screen.getByRole("button", { name: "Sign in" }));
  return within(screen.getByRole("dialog"));
}

describe("AuthDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("トリガーからダイアログが開きデモアカウントが初期入力されている", async () => {
    const user = userEvent.setup();
    const dialog = await openDialog(user);
    expect(dialog.getByLabelText("Email")).toHaveValue("demo@example.com");
    expect(dialog.getByLabelText("Password")).toHaveValue("password");
  });

  it("未入力で送信するとバリデーションエラーが表示される", async () => {
    const user = userEvent.setup();
    const dialog = await openDialog(user);
    await user.clear(dialog.getByLabelText("Email"));
    await user.clear(dialog.getByLabelText("Password"));
    await user.click(dialog.getByRole("button", { name: "Sign in" }));
    expect(
      await dialog.findByText("Enter a valid email address"),
    ).toBeInTheDocument();
    expect(await dialog.findByText("Enter your password")).toBeInTheDocument();
  });

  it("サインアップ表示に切り替えるとパスワード確認欄が表示される", async () => {
    const user = userEvent.setup();
    const dialog = await openDialog(user);
    await user.click(dialog.getByRole("button", { name: "Sign up" }));
    expect(
      await dialog.findByLabelText("Confirm password"),
    ).toBeInTheDocument();
  });

  it("サインアップ表示に氏名の入力欄が表示される", async () => {
    const user = userEvent.setup();
    const dialog = await openDialog(user);
    await user.click(dialog.getByRole("button", { name: "Sign up" }));
    expect(await dialog.findByLabelText("First name")).toBeInTheDocument();
    expect(await dialog.findByLabelText("Last name")).toBeInTheDocument();
  });

  it("氏名が未入力の場合はサインアップできない", async () => {
    const user = userEvent.setup();
    const dialog = await openDialog(user);
    await user.click(dialog.getByRole("button", { name: "Sign up" }));
    await dialog.findByLabelText("First name");

    await user.click(dialog.getByRole("button", { name: "Sign up" }));

    expect(
      await dialog.findByText("Enter your first name"),
    ).toBeInTheDocument();
    expect(await dialog.findByText("Enter your last name")).toBeInTheDocument();
  });

  it("Sign up ボタンからサインアップフォームを直接開ける", async () => {
    const user = userEvent.setup();
    render(<AuthDialog />);
    await user.click(screen.getByRole("button", { name: "Sign up" }));
    const dialog = within(screen.getByRole("dialog"));
    expect(
      await dialog.findByLabelText("Confirm password"),
    ).toBeInTheDocument();
  });
});
