import { test, expect } from '@playwright/test';

test.describe('Registration', () => {
  test('page loads', async ({ page }) => {
    test.skip(true, 'E2E environment not available');
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
  });
});
