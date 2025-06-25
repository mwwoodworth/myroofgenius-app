import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('complete purchase and receive download links', async ({ page }) => {
    // Go to marketplace
    await page.goto('/marketplace')
    
    // Search for a product
    await page.fill('[placeholder*="Search"]', 'estimation toolkit')
    
    // Click on first product
    await page.click('text=Roofing Estimation Toolkit Pro')
    
    // Add to cart
    await page.click('text=Add to Cart')
    
    // Go to checkout
    await page.click('text=Checkout')
    
    // Fill checkout form
    await page.fill('[name="email"]', 'test@example.com')
    
    // Complete Stripe checkout (mock in test environment)
    await page.click('text=Pay Now')
    
    // Wait for success page
    await expect(page.locator('text=Order Confirmed')).toBeVisible()
    
    // Check for download links
    await expect(page.locator('text=Download Your Files')).toBeVisible()
    await expect(page.locator('a[href*="/api/download/"]')).toHaveCount(2)
  })
})
