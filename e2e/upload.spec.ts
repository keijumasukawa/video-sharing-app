import { test, expect } from "@playwright/test";

test("アップロードダイアログを開くとフォームが表示される", async ({
  page,
}) => {
  await page.goto("/my-videos");

  await expect(page.getByRole("heading", { name: "My Videos" })).toBeVisible();

  const dialog = page.getByRole("dialog");
  await expect(async () => {
    await page.getByRole("button", { name: "Upload", exact: true }).click();
    await expect(dialog).toBeVisible({ timeout: 1000 });
  }).toPass();

  await expect(
    dialog.getByRole("heading", { name: "Upload video" }),
  ).toBeVisible();
  await expect(dialog.getByText("Select file")).toBeVisible();
  await expect(dialog.getByText("No file selected")).toBeVisible();
  await expect(dialog.getByLabel("Title")).toBeVisible();
  await expect(dialog.getByLabel("Description")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Save" })).toBeVisible();
});
