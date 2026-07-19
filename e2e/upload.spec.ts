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
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "Upload video" }),
  ).toBeVisible();
});
