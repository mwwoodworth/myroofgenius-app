import { test, expect } from '@playwright/test';

test.describe('Tools page', () => {
  test('loads correctly', async ({ page }) => {
    await page.goto('/tools');
    // Log all heading texts for diagnosis:
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('HEADINGS ON /tools:', headings);
    await expect(page.getByRole('heading', { name: 'AI Tools' })).toBeVisible();
  });
});