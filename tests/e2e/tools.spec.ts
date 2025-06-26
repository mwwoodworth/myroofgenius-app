import { test, expect } from "@playwright/test";

test.describe("Tools page", () => {
  test("loads correctly", async ({ page }) => {
    await page.goto("/tools");
    await expect(page.locator("text=AI Tools")).toBeVisible();
  });
});
