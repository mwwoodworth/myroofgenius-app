import { test, expect } from '@playwright/test';

test.describe('Field Apps page', () => {
  test('loads correctly', async ({ page }) => {
    test.skip(true, 'E2E environment not available');
    await page.goto('/fieldapps');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Field Apps' })).toBeVisible();
  });
});
