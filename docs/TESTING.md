# Testing Guide

Comprehensive testing instructions for MyRoofGenius application, including payment flows, A/B tests, and integration testing.

## Payment Flow Testing

### Stripe Test Cards

Use these test cards for different scenarios:

#### Successful Payments
```
Card Number: 4242424242424242
CVC: Any 3 digits
Expiry: Any future date
```

#### Declined Payments
```
Card Number: 4000000000000002
CVC: Any 3 digits
Expiry: Any future date
```

#### Insufficient Funds
```
Card Number: 4000000000000009
CVC: Any 3 digits
Expiry: Any future date
```

#### Expired Card
```
Card Number: 4000000000000069
CVC: Any 3 digits
Expiry: Any past date
```

#### Processing Error
```
Card Number: 4000000000000119
CVC: Any 3 digits
Expiry: Any future date
```

#### Requires 3D Secure
```
Card Number: 4000002760003184
CVC: Any 3 digits
Expiry: Any future date
```

### Payment Flow Test Scenarios

#### 1. Successful One-Time Payment
```bash
# Test flow:
1. Navigate to pricing page
2. Select a plan
3. Click "Choose Plan"
4. Fill in payment details with success card
5. Complete payment
6. Verify success page
7. Check webhook processing
8. Confirm database updates
```

#### 2. Failed Payment Handling
```bash
# Test flow:
1. Navigate to pricing page
2. Select a plan
3. Fill in payment details with decline card
4. Attempt payment
5. Verify error message display
6. Check error logging
7. Confirm no charge created
```

#### 3. Subscription Payment
```bash
# Test flow:
1. Navigate to pricing page
2. Select subscription plan
3. Complete payment with success card
4. Verify subscription created
5. Check recurring billing setup
6. Test subscription cancellation
```

#### 4. Webhook Testing
```bash
# Test webhook endpoints:
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test_signature" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_123",
        "amount": 2999,
        "currency": "usd",
        "status": "succeeded"
      }
    }
  }'
```

## A/B Testing

### Test Configuration Verification

#### 1. Check Active Tests
```bash
# API endpoint:
curl http://localhost:3000/api/ab-testing/config

# Expected response:
{
  "success": true,
  "data": {
    "activeTests": [
      {
        "name": "landing_page_hero",
        "enabled": true,
        "variants": [...],
        ...
      }
    ]
  }
}
```

#### 2. Test Variant Assignment
```bash
# Test different user assignments:
curl "http://localhost:3000/api/ab-testing/config?testName=landing_page_hero"

# Verify variant persistence:
1. Load page with test
2. Clear cache
3. Reload page
4. Verify same variant shown
```

#### 3. Track Conversions
```bash
# Track test conversion:
curl -X POST http://localhost:3000/api/ab-testing/track \
  -H "Content-Type: application/json" \
  -d '{
    "testName": "landing_page_hero",
    "variant": "control",
    "event": "conversion",
    "value": 1,
    "userId": "test_user_123"
  }'
```

### A/B Test Scenarios

#### 1. Hero Section Variants
```bash
# Test flow:
1. Clear cookies
2. Navigate to homepage
3. Verify hero variant assignment
4. Track button click
5. Verify analytics event
6. Check variant persistence
```

#### 2. CTA Button Variants
```bash
# Test flow:
1. Navigate to any page with CTA
2. Verify button text matches variant
3. Click CTA button
4. Verify conversion tracking
5. Check analytics data
```

#### 3. Pricing Page Variants
```bash
# Test flow:
1. Navigate to pricing page
2. Verify layout variant
3. Test feature comparison
4. Complete purchase flow
5. Verify conversion attribution
```

## Integration Testing

### Database Integration
```sql
-- Test data setup:
INSERT INTO profiles (id, email, full_name, company_name) 
VALUES ('test-user-id', 'test@example.com', 'Test User', 'Test Company');

-- Test queries:
SELECT * FROM estimates WHERE user_id = 'test-user-id';
SELECT * FROM projects WHERE user_id = 'test-user-id';
```

### API Integration
```bash
# Test authentication:
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword"
  }'

# Test protected endpoints:
curl -X GET http://localhost:3000/api/estimates \
  -H "Authorization: Bearer your_jwt_token"
```

### External Service Integration

#### 1. AI Service Testing
```bash
# Test Anthropic API:
curl -X POST http://localhost:3000/api/ai/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "roofType": "gable",
    "dimensions": {"length": 30, "width": 20},
    "materials": "asphalt"
  }'
```

#### 2. Email Service Testing
```bash
# Test email sending:
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "template": "estimate_ready",
    "data": {"estimateId": "est_123"}
  }'
```

## Performance Testing

### Load Testing with Artillery
```bash
# Install Artillery:
npm install -g artillery

# Run load test:
artillery run load-test.yml
```

### Load Test Configuration
```yaml
# load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "Home page load"
    weight: 40
    flow:
      - get:
          url: "/"
      - think: 5
      - get:
          url: "/pricing"
      - think: 3
      - get:
          url: "/calculator"

  - name: "Payment flow"
    weight: 30
    flow:
      - get:
          url: "/pricing"
      - think: 10
      - post:
          url: "/api/payments/create-session"
          json:
            priceId: "price_test_123"
      - think: 5

  - name: "A/B test participation"
    weight: 30
    flow:
      - get:
          url: "/"
      - think: 2
      - post:
          url: "/api/ab-testing/track"
          json:
            testName: "landing_page_hero"
            variant: "control"
            event: "view"
```

## End-to-End Testing

### Playwright Tests
```bash
# Install Playwright:
npm install -D @playwright/test

# Run E2E tests:
npx playwright test
```

### Test Scenarios
```javascript
// tests/e2e/payment-flow.spec.js
import { test, expect } from '@playwright/test';

test('successful payment flow', async ({ page }) => {
  // Navigate to pricing
  await page.goto('/pricing');
  
  // Select plan
  await page.click('[data-testid="professional-plan"]');
  
  // Fill payment form
  await page.fill('[data-testid="card-number"]', '4242424242424242');
  await page.fill('[data-testid="card-expiry"]', '12/25');
  await page.fill('[data-testid="card-cvc"]', '123');
  
  // Submit payment
  await page.click('[data-testid="submit-payment"]');
  
  // Verify success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});

test('A/B test variant assignment', async ({ page }) => {
  // Navigate to home page
  await page.goto('/');
  
  // Check hero variant
  const heroVariant = await page.getAttribute('[data-testid="hero-section"]', 'data-variant');
  expect(['control', 'video_hero', 'testimonial_hero']).toContain(heroVariant);
  
  // Verify persistence
  await page.reload();
  const persistedVariant = await page.getAttribute('[data-testid="hero-section"]', 'data-variant');
  expect(persistedVariant).toBe(heroVariant);
});
```

## Security Testing

### Authentication Testing
```bash
# Test SQL injection:
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com'\'''; DROP TABLE users; --",
    "password": "test"
  }'

# Test XSS prevention:
curl -X POST http://localhost:3000/api/estimates \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "<script>alert(\"XSS\")</script>",
    "address": "Test Address"
  }'
```

### Rate Limiting Testing
```bash
# Test API rate limits:
for i in {1..100}; do
  curl -X GET http://localhost:3000/api/estimates &
done
```

## Monitoring & Analytics Testing

### Error Tracking
```javascript
// Test error reporting:
try {
  throw new Error('Test error for Sentry');
} catch (error) {
  // Should be captured by Sentry
  console.error(error);
}
```

### Analytics Events
```javascript
// Test analytics tracking:
import { Analytics } from '@/lib/analytics';

const analytics = Analytics.getInstance();

// Track test events
analytics.track({
  name: 'test_event',
  properties: {
    test_property: 'test_value'
  }
});

// Track test conversion
analytics.trackConversion({
  event: 'test_purchase',
  value: 99.99,
  currency: 'USD',
  transactionId: 'test_txn_123'
});
```

## Automated Testing Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm test
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
        STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}
    
    - name: Run E2E tests
      run: npx playwright test
      env:
        PLAYWRIGHT_HEADLESS: true
    
    - name: Test build
      run: npm run build
```

## Test Data Management

### Test Database Setup
```sql
-- Create test data:
INSERT INTO profiles (id, email, full_name, company_name) VALUES
  ('test-user-1', 'test1@example.com', 'Test User 1', 'Test Company 1'),
  ('test-user-2', 'test2@example.com', 'Test User 2', 'Test Company 2');

INSERT INTO estimates (id, user_id, project_name, total_cost) VALUES
  ('est-1', 'test-user-1', 'Test Project 1', 12500.00),
  ('est-2', 'test-user-2', 'Test Project 2', 18750.00);
```

### Test Data Cleanup
```bash
# Clean test data:
npm run test:cleanup

# Reset database:
npm run test:reset-db
```

## Troubleshooting Tests

### Common Issues

#### Payment Tests Failing
1. Check Stripe API keys
2. Verify webhook endpoints
3. Review test card numbers
4. Check network connectivity

#### A/B Tests Not Working
1. Verify test configuration
2. Check cookie persistence
3. Review variant assignment logic
4. Validate analytics tracking

#### Database Connection Issues
1. Check connection strings
2. Verify RLS policies
3. Review authentication setup
4. Check test data setup

### Debug Commands
```bash
# Enable debug logging:
DEBUG=* npm test

# Run specific test:
npm test -- --grep "payment flow"

# Run tests with coverage:
npm run test:coverage
```

## Test Reporting

### Coverage Reports
```bash
# Generate coverage report:
npm run test:coverage

# View coverage in browser:
open coverage/index.html
```

### Test Results
```bash
# Generate test report:
npm run test:report

# Send results to dashboard:
curl -X POST https://api.testdashboard.com/results \
  -H "Authorization: Bearer $TEST_API_KEY" \
  -d @test-results.json
```

## Best Practices

### Test Writing
- Write tests before implementing features
- Use descriptive test names
- Keep tests isolated and independent
- Mock external dependencies
- Test edge cases and error conditions

### Data Management
- Use factories for test data
- Clean up after tests
- Use transactions for database tests
- Avoid hardcoded values

### Performance
- Run tests in parallel
- Use fast test databases
- Mock slow operations
- Optimize test setup/teardown

### Maintenance
- Keep tests updated with code changes
- Remove obsolete tests
- Refactor duplicate test code
- Document test requirements