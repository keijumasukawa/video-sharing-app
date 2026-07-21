import { test, expect } from "@playwright/test";

test("デモアカウントでログインするとアップロードダイアログを開ける", async ({
  page,
}) => {
  await page.goto("/my-videos");

  await page.getByRole("main").getByRole("button", { name: "Sign in" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Sign in" })
    .click();

  await expect(
    page.getByRole("heading", { name: "My Videos" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Upload", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Upload video" }),
  ).toBeVisible();
  await expect(dialog.getByText("Select file")).toBeVisible();
  await expect(dialog.getByText("No file selected")).toBeVisible();
  await expect(dialog.getByLabel("Title")).toBeVisible();
  await expect(dialog.getByLabel("Description")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Save" })).toBeVisible();
});
