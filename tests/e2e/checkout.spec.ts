import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    test.skip(true, 'E2E environment not available');
    await page.goto('/');
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('HEADINGS ON HOMEPAGE:', headings);
    await expect(page.getByRole('heading', { name: 'Your Intelligence Layer for High-Stakes Roofing' })).toBeVisible();
  });
});