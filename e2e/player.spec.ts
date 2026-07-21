import { expect, test } from "@playwright/test";

test("存在しない動画IDは404ページを表示する", async ({ page }) => {
  const response = await page.goto(
    "/videos/00000000-0000-4000-8000-000000000000",
  );

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Video not found" }),
  ).toBeVisible();
});

test("動画IDの形式が不正な場合は404ページを表示する", async ({ page }) => {
  const response = await page.goto("/videos/not-a-uuid");

  expect(response?.status()).toBe(404);
});

test("一覧から動画を選択して再生ページを表示できる", async ({ page }) => {
  await page.goto("/videos");

  const main = page.getByRole("main");
  const firstCard = main.getByRole("link").first();

  if ((await firstCard.count()) === 0) {
    test.skip();
    return;
  }

  await firstCard.click();
  await expect(page).toHaveURL(/\/videos\/[0-9a-f-]{36}$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
