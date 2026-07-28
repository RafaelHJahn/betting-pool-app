import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test("should render title, heading and enter button", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("Bolão");
    await expect(page.getByRole("heading", { name: "Bolão", level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });
});
