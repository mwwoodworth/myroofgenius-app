import { test, expect } from '@playwright/test';

test.describe('Field Apps page', () => {
  test('loads correctly', async ({ page }) => {
    await page.goto('/fieldapps');
    await expect(page.getByRole('heading', { name: 'Field Apps' })).toBeVisible();
  });
});