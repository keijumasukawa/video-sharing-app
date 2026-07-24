import { test, expect } from "@playwright/test";

test("トップページから動画一覧へリダイレクトされる", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("/videos");
  await expect(page.getByRole("main")).toBeVisible();
});

test("動画一覧ページにサイドバーとヘッダーが表示される", async ({ page }) => {
  await page.goto("/videos");
  await expect(page.getByRole("link", { name: "My Videos" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Toggle theme" }),
  ).toBeVisible();
});

test("サイドバーを折りたたむとアイコンのみの表示になる", async ({ page }) => {
  await page.goto("/videos");
  await page
    .getByRole("banner")
    .getByRole("button", { name: "Toggle Sidebar" })
    .click();

  const homeLink = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Home" });
  await expect(homeLink).toBeVisible();
  await homeLink.hover();
  await expect(
    page.locator('[data-slot="tooltip-content"]', { hasText: "Home" }),
  ).toBeVisible();
});

test("ヘッダーにリポジトリへのリンクが表示される", async ({ page }) => {
  await page.goto("/videos");
  const link = page
    .getByRole("banner")
    .getByRole("link", { name: "GitHub repository" });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("target", "_blank");
});

test("テーマをダークに切り替えられる", async ({ page }) => {
  await page.goto("/videos");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("menuitem", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("動画再生ページではナビゲーションがドロワー表示になる", async ({
  page,
}) => {
  await page.goto("/videos/00000000-0000-4000-8000-000000000000");
  await expect(
    page.getByRole("heading", { level: 1, name: "Video not found" }),
  ).toBeVisible();

  await expect(page.getByRole("link", { name: "My Videos" })).toBeHidden();
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("link", { name: "My Videos" })).toBeVisible();
});
