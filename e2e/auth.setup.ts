import { expect, test as setup } from "@playwright/test";
import path from "node:path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("デモアカウントで認証し状態を保存する", async ({ page }) => {
  await page.goto("/videos");

  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await page
      .getByRole("banner")
      .getByRole("button", { name: "Sign in" })
      .click();
    await expect(dialog).toBeVisible({ timeout: 1000 });
  }).toPass();
  await dialog.getByRole("button", { name: "Sign in" }).click();

  await expect(
    page.getByRole("button", { name: "Open user menu" }),
  ).toBeVisible();

  await page.context().storageState({ path: authFile });
});
