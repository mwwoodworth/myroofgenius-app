# Sprint: Repair and Expand Test Suite

**ID:** SPRINT-004  
**Priority:** High  
**State:** To Do

## 1. Executive Summary

A robust test suite protects against regressions and validates critical business logic. This sprint repairs failing E2E tests, expands component test coverage for AI Estimator interactions, and adds comprehensive auth flow validation to ensure secure, reliable operation.

## 2. Acceptance Criteria

- [ ] All E2E tests in `tests/e2e/*.spec.ts` pass in CI and locally
- [ ] Component tests in `tests/components/AIEstimator.test.tsx` cover all main interactions and error cases  
- [ ] Tests exist for newly centralized auth logic from Sprint 3
- [ ] Happy path and negative tests for onboarding, payment, and admin access
- [ ] Test coverage report shows >80% coverage for critical paths
- [ ] All tests run successfully in GitHub Actions CI pipeline

## 3. Step-by-Step Implementation Guide

### File: tests/e2e/checkout.spec.ts

Update selectors and assertions to match new UI structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkout');
  });

  test('should display all checkout steps', async ({ page }) => {
    // Updated selectors to match new UI
    await expect(page.locator('[data-testid="checkout-step-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-step-2"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-step-3"]')).toBeVisible();
    
    // Verify step content
    await expect(page.locator('h2:has-text("Package Selection")')).toBeVisible();
    await expect(page.locator('h2:has-text("Your Information")')).toBeVisible();
    await expect(page.locator('h2:has-text("Payment")')).toBeVisible();
  });

  test('should select package and proceed to payment', async ({ page }) => {
    // Select Essential package
    await page.locator('[data-testid="package-essential"]').click();
    await expect(page.locator('[data-testid="selected-package"]')).toContainText('Essential');
    
    // Fill user information
    await page.fill('[data-testid="input-name"]', 'Test User');
    await page.fill('[data-testid="input-email"]', 'test@example.com');
    await page.fill('[data-testid="input-company"]', 'Test Company');
    
    // Proceed to payment
    await page.locator('[data-testid="continue-to-payment"]').click();
    
    // Verify Stripe payment element loads
    await page.waitForSelector('iframe[title*="Stripe"]', { timeout: 10000 });
    await expect(page.locator('[data-testid="payment-amount"]')).toContainText('$97');
  });

  test('should handle payment errors gracefully', async ({ page }) => {
    // Select package and fill info
    await page.locator('[data-testid="package-essential"]').click();
    await page.fill('[data-testid="input-name"]', 'Test User');
    await page.fill('[data-testid="input-email"]', 'test@example.com');
    await page.fill('[data-testid="input-company"]', 'Test Company');
    await page.locator('[data-testid="continue-to-payment"]').click();
    
    // Wait for Stripe to load
    await page.waitForSelector('iframe[title*="Stripe"]', { timeout: 10000 });
    
    // Use test card that triggers decline
    const stripe = page.frameLocator('iframe[title*="Stripe"]').first();
    await stripe.locator('[placeholder="1234 1234 1234 1234"]').fill('4000000000000002');
    await stripe.locator('[placeholder="MM / YY"]').fill('12/30');
    await stripe.locator('[placeholder="CVC"]').fill('123');
    
    // Submit payment
    await page.locator('[data-testid="submit-payment"]').click();
    
    // Verify error message
    await expect(page.locator('[data-testid="payment-error"]')).toContainText('Your card was declined');
  });

  test('should redirect to success page after payment', async ({ page }) => {
    // Complete checkout flow with valid test card
    await page.locator('[data-testid="package-essential"]').click();
    await page.fill('[data-testid="input-name"]', 'Test User');
    await page.fill('[data-testid="input-email"]', 'test@example.com');
    await page.fill('[data-testid="input-company"]', 'Test Company');
    await page.locator('[data-testid="continue-to-payment"]').click();
    
    await page.waitForSelector('iframe[title*="Stripe"]', { timeout: 10000 });
    
    // Use successful test card
    const stripe = page.frameLocator('iframe[title*="Stripe"]').first();
    await stripe.locator('[placeholder="1234 1234 1234 1234"]').fill('4242424242424242');
    await stripe.locator('[placeholder="MM / YY"]').fill('12/30');
    await stripe.locator('[placeholder="CVC"]').fill('123');
    
    // Submit and verify redirect
    await page.locator('[data-testid="submit-payment"]').click();
    
    // Wait for redirect to success page
    await page.waitForURL('**/checkout/success', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Payment Successful');
  });
});
```

### File: tests/e2e/tools.spec.ts

Update selectors for tools page navigation and interaction:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tools Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools');
  });

  test('should display all available tools', async ({ page }) => {
    // Verify page title
    await expect(page.locator('h1')).toContainText('Commercial Roofing Tools');
    
    // Check tool cards are visible
    await expect(page.locator('[data-testid="tool-ai-estimator"]')).toBeVisible();
    await expect(page.locator('[data-testid="tool-cashflow-forecast"]')).toBeVisible();
    await expect(page.locator('[data-testid="tool-warranty-tracker"]')).toBeVisible();
    
    // Verify tool descriptions
    await expect(page.locator('[data-testid="tool-ai-estimator"] p')).toContainText('AI-powered estimation');
  });

  test('should navigate to AI Estimator', async ({ page }) => {
    await page.locator('[data-testid="tool-ai-estimator"] a').click();
    await page.waitForURL('**/tools/ai-estimator');
    await expect(page.locator('h1')).toContainText('AI Roof Estimator');
  });

  test('should filter tools by category', async ({ page }) => {
    // Click estimation category filter
    await page.locator('[data-testid="filter-estimation"]').click();
    
    // Verify only estimation tools are visible
    await expect(page.locator('[data-testid="tool-ai-estimator"]')).toBeVisible();
    await expect(page.locator('[data-testid="tool-warranty-tracker"]')).not.toBeVisible();
    
    // Reset filter
    await page.locator('[data-testid="filter-all"]').click();
    await expect(page.locator('[data-testid="tool-warranty-tracker"]')).toBeVisible();
  });

  test('should show login prompt for protected tools', async ({ page }) => {
    // Click on a protected tool
    await page.locator('[data-testid="tool-cashflow-forecast"] a').click();
    
    // Verify redirect to login with return URL
    await page.waitForURL('**/auth/login?returnUrl=%2Ftools%2Fcashflow-forecast');
    await expect(page.locator('h1')).toContainText('Sign In');
  });
});
```

### File: tests/components/AIEstimator.test.tsx

Comprehensive component tests with all interactions and error states:

```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIEstimator } from '@/components/tools/AIEstimator';
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock file reader
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsDataURL: vi.fn(),
  onload: vi.fn(),
  onerror: vi.fn(),
  result: 'data:image/jpeg;base64,fake-image-data'
}));

describe('AIEstimator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders initial state correctly', () => {
    render(<AIEstimator />);
    
    expect(screen.getByText('AI Roof Estimator')).toBeInTheDocument();
    expect(screen.getByText('Upload Photos')).toBeInTheDocument();
    expect(screen.getByText('Get instant AI-powered estimates')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate estimate/i })).toBeDisabled();
  });

  test('handles single file upload', async () => {
    const user = userEvent.setup();
    render(<AIEstimator />);
    
    const file = new File(['test'], 'roof-photo.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/drop.*photos here/i);
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('roof-photo.jpg')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate estimate/i })).toBeEnabled();
    });
  });

  test('handles multiple file uploads', async () => {
    const user = userEvent.setup();
    render(<AIEstimator />);
    
    const files = [
      new File(['test1'], 'photo1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'photo2.jpg', { type: 'image/jpeg' }),
      new File(['test3'], 'photo3.jpg', { type: 'image/jpeg' })
    ];
    
    const input = screen.getByLabelText(/drop.*photos here/i);
    await user.upload(input, files);
    
    await waitFor(() => {
      expect(screen.getByText('photo1.jpg')).toBeInTheDocument();
      expect(screen.getByText('photo2.jpg')).toBeInTheDocument();
      expect(screen.getByText('photo3.jpg')).toBeInTheDocument();
      expect(screen.getByText('3 photos uploaded')).toBeInTheDocument();
    });
  });

  test('validates file type', async () => {
    const user = userEvent.setup();
    render(<AIEstimator />);
    
    const invalidFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/drop.*photos here/i);
    
    await user.upload(input, invalidFile);
    
    await waitFor(() => {
      expect(screen.getByText(/only image files/i)).toBeInTheDocument();
      expect(screen.queryByText('document.pdf')).not.toBeInTheDocument();
    });
  });

  test('enforces maximum file count', async () => {
    const user = userEvent.setup();
    render(<AIEstimator />);
    
    const files = Array.from({ length: 11 }, (_, i) => 
      new File(['test'], `photo${i}.jpg`, { type: 'image/jpeg' })
    );
    
    const input = screen.getByLabelText(/drop.*photos here/i);
    await user.upload(input, files);
    
    await waitFor(() => {
      expect(screen.getByText(/maximum 10 photos/i)).toBeInTheDocument();
      expect(screen.getByText('10 photos uploaded')).toBeInTheDocument();
    });
  });

  test('removes uploaded file', async () => {
    const user = userEvent.setup();
    render(<AIEstimator />);
    
    const file = new File(['test'], 'roof-photo.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/drop.*photos here/i);
    
    await user.upload(input, file);
    
    await waitFor(() => {
      expect(screen.getByText('roof-photo.jpg')).toBeInTheDocument();
    });
    
    // Click remove button
    const removeButton = screen.getByRole('button', { name: /remove/i });
    await user.click(removeButton);
    
    expect(screen.queryByText('roof-photo.jpg')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate estimate/i })).toBeDisabled();
  });

  test('generates estimate successfully', async () => {
    const mockResponse = {
      estimate: {
        roofArea: 5000,
        roofType: 'Modified Bitumen',
        condition: 'Fair',
        estimatedCost: {
          low: 25000,
          high: 35000,
          average: 30000
        },
        recommendations: [
          'Replace damaged flashing',
          'Repair ponding areas',
          'Install new drainage'
        ]
      }
    };
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });
    
    const user = userEvent.setup();
    render(<AIEstimator />);
    
    // Upload file
    const file = new File(['test'], 'roof-photo.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/drop.*photos here/i);
    await user.upload(input, file);
    
    // Fill additional info
    await user.type(screen.getByLabelText(/building type/i), 'Office Building');
    await user.type(screen.getByLabelText(/location/i), 'Denver, CO');
    
    // Generate estimate
    const generateButton = screen.getByRole('button', { name: /generate estimate/i });
    await user.click(generateButton);
    
    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Estimate Results')).toBeInTheDocument();
      expect(screen.getByText('5,000 sq ft')).toBeInTheDocument();
      expect(screen.getByText('Modified Bitumen')).toBeInTheDocument();
      expect(screen.getByText('$25,000 - $35,000')).toBeInTheDocument();
      expect(screen.getByText('Replace damaged flashing')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
    
    const user = userEvent.setup();
    render(<AIEstimator />);
    
    // Upload file and generate
    const file = new File(['test'], 'roof-photo.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/drop.*photos here/i);
    await user.upload(input, file);
    
    const generateButton = screen.getByRole('button', { name: /generate estimate/i });
    await user.click(generateButton);
    
    await waitFor(() => {
      expect(screen.getByText(/error generating estimate/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  test('retries after error', async () => {
    // First call fails
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
    
    // Second call succeeds
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        estimate: {
          roofArea: 5000,
          roofType: 'TPO',
          condition: 'Good',
          estimatedCost: {
            low: 20000,
            high: 30000,
            average: 25000
          }
        }
      })
    });
    
    const user = userEvent.setup();
    render(<AIEstimator />);
    
    // Upload and first attempt
    const file = new File(['test'], 'roof-photo.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/drop.*photos here/i);
    await user.upload(input, file);
    
    await user.click(screen.getByRole('button', { name: /generate estimate/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/error generating estimate/i)).toBeInTheDocument();
    });
    
    // Retry
    await user.click(screen.getByRole('button', { name: /try again/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Estimate Results')).toBeInTheDocument();
      expect(screen.getByText('TPO')).toBeInTheDocument();
    });
  });

  test('downloads estimate PDF', async () => {
    const mockResponse = {
      estimate: {
        roofArea: 5000,
        roofType: 'Modified Bitumen',
        estimatedCost: {
          low: 25000,
          high: 35000,
          average: 30000
        }
      }
    };
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });
    
    // Mock PDF download
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob
    });
    
    // Mock createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    
    const user = userEvent.setup();
    render(<AIEstimator />);
    
    // Generate estimate first
    const file = new File(['test'], 'roof-photo.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/drop.*photos here/i), file);
    await user.click(screen.getByRole('button', { name: /generate estimate/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Estimate Results')).toBeInTheDocument();
    });
    
    // Download PDF
    const downloadButton = screen.getByRole('button', { name: /download pdf/i });
    await user.click(downloadButton);
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tools/estimate/pdf'),
      expect.any(Object)
    );
  });

  test('resets form after completion', async () => {
    const mockResponse = {
      estimate: {
        roofArea: 5000,
        estimatedCost: { low: 25000, high: 35000, average: 30000 }
      }
    };
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });
    
    const user = userEvent.setup();
    render(<AIEstimator />);
    
    // Generate estimate
    const file = new File(['test'], 'roof-photo.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/drop.*photos here/i), file);
    await user.click(screen.getByRole('button', { name: /generate estimate/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Estimate Results')).toBeInTheDocument();
    });
    
    // Start new estimate
    await user.click(screen.getByRole('button', { name: /new estimate/i }));
    
    expect(screen.queryByText('Estimate Results')).not.toBeInTheDocument();
    expect(screen.getByText('Upload Photos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate estimate/i })).toBeDisabled();
  });
});
```

### File: tests/e2e/auth-flow.spec.ts

New test file for auth flow validation:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/admin');
    
    // Should redirect to login with return URL
    await page.waitForURL('**/auth/login?returnUrl=%2Fadmin');
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('allows login with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@myroofgenius.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    
    // Submit
    await page.locator('[data-testid="login-submit"]').click();
    
    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('test@myroofgenius.com');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.locator('[data-testid="login-submit"]').click();
    
    await expect(page.locator('[data-testid="auth-error"]')).toContainText('Invalid email or password');
  });

  test('completes password reset flow', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Click forgot password
    await page.locator('a:has-text("Forgot password?")').click();
    await page.waitForURL('**/auth/forgot-password');
    
    // Enter email
    await page.fill('[data-testid="reset-email-input"]', 'test@myroofgenius.com');
    await page.locator('[data-testid="reset-submit"]').click();
    
    // Verify success message
    await expect(page.locator('[data-testid="reset-success"]')).toContainText('Check your email');
  });

  test('maintains session across page refreshes', async ({ page, context }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'test@myroofgenius.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.locator('[data-testid="login-submit"]').click();
    await page.waitForURL('**/dashboard');
    
    // Refresh page
    await page.reload();
    
    // Should still be logged in
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('test@myroofgenius.com');
    
    // Navigate to another protected page
    await page.goto('/admin');
    await expect(page.url()).toContain('/admin');
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
  });

  test('logs out successfully', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'test@myroofgenius.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.locator('[data-testid="login-submit"]').click();
    await page.waitForURL('**/dashboard');
    
    // Open user menu and logout
    await page.locator('[data-testid="user-menu"]').click();
    await page.locator('[data-testid="logout-button"]').click();
    
    // Should redirect to home
    await page.waitForURL('/');
    
    // Try to access protected route
    await page.goto('/admin');
    await page.waitForURL('**/auth/login?returnUrl=%2Fadmin');
  });
});
```

### File: tests/e2e/onboarding-payment.spec.ts

New test file for onboarding and payment flows:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Onboarding and Payment Flow', () => {
  test.use({
    storageState: 'tests/e2e/auth.json' // Authenticated state
  });

  test('completes onboarding after first login', async ({ page }) => {
    // Mock first-time user
    await page.route('**/api/user/profile', async route => {
      await route.fulfill({
        json: {
          email: 'newuser@example.com',
          onboardingCompleted: false
        }
      });
    });

    await page.goto('/dashboard');
    
    // Should redirect to onboarding
    await page.waitForURL('**/onboarding');
    await expect(page.locator('h1')).toContainText('Welcome to MyRoofGenius');
    
    // Step 1: Company info
    await page.fill('[data-testid="company-name"]', 'Test Roofing Co');
    await page.fill('[data-testid="company-size"]', '10-50');
    await page.locator('[data-testid="next-step"]').click();
    
    // Step 2: Use case selection
    await page.locator('[data-testid="use-case-estimation"]').click();
    await page.locator('[data-testid="use-case-project-management"]').click();
    await page.locator('[data-testid="next-step"]').click();
    
    // Step 3: Preferences
    await page.selectOption('[data-testid="measurement-units"]', 'imperial');
    await page.locator('[data-testid="complete-onboarding"]').click();
    
    // Should redirect to dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, Test Roofing Co');
  });

  test('processes subscription payment', async ({ page }) => {
    await page.goto('/billing/upgrade');
    
    // Select Professional plan
    await page.locator('[data-testid="plan-professional"]').click();
    await expect(page.locator('[data-testid="selected-plan-price"]')).toContainText('$197/month');
    
    // Continue to payment
    await page.locator('[data-testid="continue-to-payment"]').click();
    
    // Fill Stripe payment form
    await page.waitForSelector('iframe[title*="Stripe"]');
    const stripe = page.frameLocator('iframe[title*="Stripe"]').first();
    
    await stripe.locator('[placeholder="1234 1234 1234 1234"]').fill('4242424242424242');
    await stripe.locator('[placeholder="MM / YY"]').fill('12/30');
    await stripe.locator('[placeholder="CVC"]').fill('123');
    await stripe.locator('[placeholder="ZIP"]').fill('80202');
    
    // Submit payment
    await page.locator('[data-testid="subscribe-button"]').click();
    
    // Wait for success
    await page.waitForURL('**/billing/success', { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Subscription Active');
    await expect(page.locator('[data-testid="plan-details"]')).toContainText('Professional Plan');
  });

  test('handles subscription cancellation', async ({ page }) => {
    // Mock active subscription
    await page.route('**/api/billing/subscription', async route => {
      await route.fulfill({
        json: {
          status: 'active',
          plan: 'professional',
          nextBillingDate: '2025-02-01'
        }
      });
    });

    await page.goto('/billing');
    
    // Click cancel subscription
    await page.locator('[data-testid="cancel-subscription"]').click();
    
    // Confirm cancellation
    await expect(page.locator('[role="dialog"]')).toContainText('Cancel Subscription?');
    await page.locator('[data-testid="confirm-cancel"]').click();
    
    // Verify cancellation
    await expect(page.locator('[data-testid="subscription-status"]')).toContainText('Canceling at end of period');
  });

  test('blocks access to premium features without subscription', async ({ page }) => {
    // Mock no subscription
    await page.route('**/api/billing/subscription', async route => {
      await route.fulfill({
        json: { status: 'none' }
      });
    });

    // Try to access premium tool
    await page.goto('/tools/advanced-analytics');
    
    // Should show upgrade prompt
    await expect(page.locator('[data-testid="upgrade-prompt"]')).toBeVisible();
    await expect(page.locator('[data-testid="upgrade-prompt"]')).toContainText('Upgrade to Professional');
    
    // Click upgrade button
    await page.locator('[data-testid="upgrade-now"]').click();
    await page.waitForURL('**/billing/upgrade');
  });
});
```

### File: tests/api/auth.test.ts

New API test file for auth endpoints:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/auth/login/route';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }
  }
}));

describe('Auth API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('returns 401 for invalid credentials', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      });

      prisma.user.findUnique.mockResolvedValue(null);

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid email or password'
      });
    });

    it('returns token for valid credentials', async () => {
      const hashedPassword = await hashPassword('correctpassword');
      
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'correctpassword'
        }
      });

      prisma.user.findUnique.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'USER'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe('test@example.com');
    });

    it('validates email format', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'invalid-email',
          password: 'password123'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid email format'
      });
    });

    it('requires password', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Email and password are required'
      });
    });
  });

  describe('POST /api/auth/register', () => {
    it('creates new user account', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          name: 'New User',
          company: 'Test Company'
        }
      });

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '456',
        email: 'newuser@example.com',
        name: 'New User',
        company: 'Test Company',
        role: 'USER'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.user.email).toBe('newuser@example.com');
      expect(data).toHaveProperty('token');
    });

    it('prevents duplicate email registration', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'existing@example.com',
          password: 'SecurePass123!',
          name: 'User'
        }
      });

      prisma.user.findUnique.mockResolvedValue({
        id: '789',
        email: 'existing@example.com'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(409);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Email already registered'
      });
    });

    it('validates password strength', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'weak',
          name: 'User'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      });
    });
  });
});
```

### File: package.json (scripts update)

Add/update test scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

### File: playwright.config.ts

Update Playwright config for better test organization:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### File: vitest.config.ts

Update Vitest config for component tests:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        'build/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### File: tests/setup.ts

Test setup file:

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }) => {
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

## 4. Test Instructions

### Local Testing
```bash
# Install dependencies if not already installed
npm install

# Run all unit/component tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode
npm run test:e2e:ui

# Debug specific E2E test
npm run test:e2e:debug tests/e2e/checkout.spec.ts

# Run all tests
npm run test:all
```

### CI Testing
Tests will automatically run in GitHub Actions on:
- Pull requests
- Pushes to main branch
- Manual workflow dispatch

Ensure all tests pass before merging. Any test failures are blocking.

## 5. Post-Merge & Deploy Validation

- [ ] Verify all tests pass in CI pipeline
- [ ] Check test coverage report meets minimum threshold (80% for critical paths)
- [ ] Confirm E2E tests pass against deployed environment
- [ ] Monitor error tracking for any test-related issues
- [ ] Update test documentation if new patterns introduced

## 6. References

- **Next.js Testing Docs**: https://nextjs.org/docs/app/building-your-application/testing
- **Playwright Docs**: https://playwright.dev/docs/intro
- **Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
- **Vitest**: https://vitest.dev/guide/

---

**Sprint Status**: Ready for Implementation
**Estimated Time**: 8-10 hours
**Dependencies**: None (can run in parallel with other sprints)