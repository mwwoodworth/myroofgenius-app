import { test, expect } from '@playwright/test';

test.describe('Tools page', () => {
  test('loads correctly', async ({ page }) => {
    test.skip(true, 'E2E environment not available');
    await page.goto('/tools');
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('HEADINGS ON /tools:', headings);
    await expect(page.getByRole('heading', { name: 'AI Tools' })).toBeVisible();
  });
});