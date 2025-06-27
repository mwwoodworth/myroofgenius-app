import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto("/");
    // Log all heading texts for diagnosis:
    const headings = await page.locator("h1, h2, h3").allTextContents();
    console.log("HEADINGS ON HOMEPAGE:", headings);
    // Adjust below after checking output:
    await expect(page.getByRole("heading", { name: "Your Intelligence Layer for High-Stakes Roofing" })).toBeVisible();
  });
});