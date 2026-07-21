import { test, expect } from "@playwright/test";

test("未認証で動画管理ページにアクセスするとサインイン案内が表示される", async ({
  page,
}) => {
  await page.goto("/my-videos");
  await expect(
    page.getByText("Sign in to upload and manage your videos."),
  ).toBeVisible();
});

test("ヘッダーの Sign in ボタンから認証ダイアログを開ける", async ({
  page,
}) => {
  await page.goto("/videos");
  await page.getByRole("button", { name: "Sign in" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Email")).toBeVisible();
  await expect(dialog.getByLabel("Password", { exact: true })).toBeVisible();
});

test("認証ダイアログをサインアップ表示に切り替えられる", async ({ page }) => {
  await page.goto("/videos");
  await page.getByRole("button", { name: "Sign in" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Sign up" }).click();
  await expect(dialog.getByLabel("First name")).toBeVisible();
  await expect(dialog.getByLabel("Last name")).toBeVisible();
  await expect(dialog.getByLabel("Confirm password")).toBeVisible();
});

test("ヘッダーの Sign up ボタンからサインアップダイアログを開ける", async ({
  page,
}) => {
  await page.goto("/videos");
  await page.getByRole("button", { name: "Sign up" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Confirm password")).toBeVisible();
});
