import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('page loads', async ({ page }) => {
    test.skip(true, 'E2E environment not available');
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });
});
