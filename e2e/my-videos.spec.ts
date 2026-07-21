import { expect, test } from "@playwright/test";

test("デモアカウントでログインすると動画の編集ダイアログを開ける", async ({
  page,
}) => {
  await page.goto("/my-videos");

  await page.getByRole("main").getByRole("button", { name: "Sign in" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Sign in" })
    .click();

  await expect(page.getByRole("heading", { name: "My Videos" })).toBeVisible();

  const firstRow = page.getByRole("row").nth(1);

  if ((await firstRow.count()) === 0) {
    test.skip();
    return;
  }

  await firstRow.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Edit video" })).toBeVisible();
  await expect(dialog.getByLabel("Title")).toBeVisible();
  await expect(dialog.getByLabel("Description")).toBeVisible();
});