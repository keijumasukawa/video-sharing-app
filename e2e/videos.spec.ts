import { test, expect } from "@playwright/test";

test("動画一覧ページに動画一覧または空状態が表示される", async ({ page }) => {
  await page.goto("/videos");

  // DB の登録状況に依存しないよう、動画カードまたは空状態のどちらかの表示を検証する
  const main = page.getByRole("main");
  const firstCard = main.getByRole("link").first();
  const emptyState = main.getByText("No videos yet.");
  await expect(firstCard.or(emptyState).first()).toBeVisible();
});
