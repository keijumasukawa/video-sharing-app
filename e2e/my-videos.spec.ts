import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function gotoMyVideos(page: Page) {
  await page.goto("/my-videos");

  await expect(page.getByRole("heading", { name: "My Videos" })).toBeVisible();

  const firstCheckbox = page
    .getByRole("checkbox", { name: "Select video" })
    .first();
  const emptyState = page.getByText("You have not uploaded any videos yet.");
  await expect(firstCheckbox.or(emptyState).first()).toBeVisible();

  return { hasVideos: !(await emptyState.isVisible()) };
}

test("動画の一覧から編集ダイアログを開ける", async ({ page }) => {
  const { hasVideos } = await gotoMyVideos(page);
  test.skip(!hasVideos, "動画が1件も無い環境のため");

  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await page.getByRole("row").nth(1).click();
    await expect(dialog).toBeVisible({ timeout: 1000 });
  }).toPass();

  await expect(
    dialog.getByRole("heading", { name: "Edit video" }),
  ).toBeVisible();
  await expect(dialog.getByLabel("Title")).toBeVisible();
  await expect(dialog.getByLabel("Description")).toBeVisible();
});

test("動画を選択すると削除の確認ダイアログを開ける", async ({ page }) => {
  const { hasVideos } = await gotoMyVideos(page);
  test.skip(!hasVideos, "動画が1件も無い環境のため");

  const firstCheckbox = page
    .getByRole("checkbox", { name: "Select video" })
    .first();
  await expect(async () => {
    await firstCheckbox.click();
    await expect(page.getByText("1 selected")).toBeVisible({ timeout: 1000 });
  }).toPass();

  await page.getByRole("button", { name: "Delete" }).click();

  const alertDialog = page.getByRole("alertdialog");
  await expect(alertDialog.getByText("Delete 1 video?")).toBeVisible();

  await alertDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(alertDialog).toBeHidden();
});
