import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('redirects unauthenticated user to login', async ({ page }) => {
    test.skip(true, 'E2E environment not available');
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});
