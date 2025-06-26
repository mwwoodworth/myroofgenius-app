import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("text=Stop Guessing. Start Winning."),
    ).toBeVisible();
  });
});
