import { test, expect } from "@playwright/test";

test("トップページから動画一覧へリダイレクトされる", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/videos");
  await expect(
    page.getByRole("heading", { level: 1, name: "動画一覧" }),
  ).toBeVisible();
});

test("動画一覧ページにサイドバーとヘッダーが表示される", async ({ page }) => {
  await page.goto("/videos");
  await expect(page.getByRole("link", { name: "マイ動画" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "テーマを切り替える" }),
  ).toBeVisible();
});

test("テーマをダークに切り替えられる", async ({ page }) => {
  await page.goto("/videos");
  await page.getByRole("button", { name: "テーマを切り替える" }).click();
  await page.getByRole("menuitem", { name: "ダーク" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("動画再生ページではナビゲーションがドロワー表示になる", async ({
  page,
}) => {
  await page.goto("/videos/test-video-id");
  await expect(
    page.getByRole("heading", { level: 1, name: "動画再生" }),
  ).toBeVisible();

  await expect(page.getByRole("link", { name: "マイ動画" })).toBeHidden();
  await page.getByRole("button", { name: "メニューを開く" }).click();
  await expect(page.getByRole("link", { name: "マイ動画" })).toBeVisible();
});
