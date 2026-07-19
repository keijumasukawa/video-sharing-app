import { test, expect } from "@playwright/test";

test("未認証で動画管理ページにアクセスすると動画一覧へリダイレクトされる", async ({
  page,
}) => {
  await page.goto("/my-videos");
  await expect(page).toHaveURL("/videos");
});
