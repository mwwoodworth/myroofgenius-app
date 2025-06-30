# Sprint 11 - Testing & Quality Assurance

## Objective
Execute comprehensive testing across all systems to ensure production readiness.

## Task 1: End-to-End Testing Suite

### 1. Core User Flows E2E Tests

```typescript
// tests/e2e/userFlows.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Core User Flows', () => {
  test('Complete onboarding flow', async ({ page }) => {
    await page.goto('/')
    
    // Click Get Started
    await page.click('text=Get Started')
    
    // Select persona
    await page.click('text=Estimator')
    
    // Upload sample file
    const fileInput = await page.locator('input[type="file"]')
    await fileInput.setInputFiles('tests/fixtures/sample-project.csv')
    
    // Complete onboarding
    await page.click('text=Analyze My Data')
    
    // Wait for dashboard redirect
    await page.waitForURL('/dashboard')
    
    // Verify AI insights are displayed
    await expect(page.locator('text=AI Insights')).toBeVisible()
    await expect(page.locator('[data-testid="cost-drivers"]')).toBeVisible()
  })

  test('Marketplace purchase flow', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'testpassword')
    await page.click('button[type="submit"]')
    
    // Navigate to marketplace
    await page.goto('/marketplace')
    
    // Click first product
    await page.click('.product-card:first-child')
    
    // Click Buy Now
    await page.click('text=Buy Now')
    
    // Verify Stripe checkout loads
    await page.waitForURL(/checkout\.stripe\.com/)
    const stripeFrame = page.frameLocator('iframe[name="stripe_checkout"]')
    await expect(stripeFrame.locator('text=Pay')).toBeVisible()
  })

  test('Blog post accessibility', async ({ page }) => {
    await page.goto('/blog')
    
    // Verify blog posts load
    await expect(page.locator('.blog-post-card')).toHaveCount(3) // Assuming 3 seeded posts
    
    // Click first post
    await page.click('.blog-post-card:first-child')
    
    // Verify post content loads
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.prose')).toBeVisible()
  })
})
```

### 2. Mobile Responsiveness Tests

```typescript
// tests/e2e/mobile.spec.ts
import { test, expect, devices } from '@playwright/test'

const mobileDevices = [
  devices['iPhone 12'],
  devices['Pixel 5'],
  devices['iPad Mini']
]

for (const device of mobileDevices) {
  test.describe(`Mobile: ${device.name}`, () => {
    test.use({ ...device })

    test('Homepage mobile layout', async ({ page }) => {
      await page.goto('/')
      
      // Check mobile menu
      const menuButton = page.locator('[aria-label="Open menu"]')
      await expect(menuButton).toBeVisible()
      
      // Open mobile menu
      await menuButton.click()
      await expect(page.locator('nav[role="navigation"]')).toBeVisible()
      
      // Verify CTA buttons are tappable size (44x44 minimum)
      const ctaButton = page.locator('text=Get Started').first()
      const box = await ctaButton.boundingBox()
      expect(box?.width).toBeGreaterThanOrEqual(44)
      expect(box?.height).toBeGreaterThanOrEqual(44)
    })

    test('Dashboard mobile usability', async ({ page }) => {
      // Login and navigate to dashboard
      await page.goto('/dashboard')
      
      // Verify cards stack vertically on mobile
      const cards = page.locator('.dashboard-card')
      const firstCard = await cards.first().boundingBox()
      const secondCard = await cards.nth(1).boundingBox()
      
      // Cards should be stacked (second card Y > first card Y + height)
      expect(secondCard?.y).toBeGreaterThan(
        (firstCard?.y || 0) + (firstCard?.height || 0)
      )
    })
  })
}
```

## Task 2: Performance Testing

### 1. Lighthouse CI Configuration

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/marketplace',
        'http://localhost:3000/blog',
        'http://localhost:3000/tools'
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1
        }
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'interactive': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
```

### 2. Performance Test Script

```typescript
// scripts/performanceTest.ts
import { chromium } from 'playwright'

async function measurePerformance() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  const metrics = {
    homepage: {},
    dashboard: {},
    marketplace: {}
  }
  
  // Homepage metrics
  await page.goto('/', { waitUntil: 'networkidle' })
  const homeTiming = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return {
      domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
      loadComplete: nav.loadEventEnd - nav.loadEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
    }
  })
  metrics.homepage = homeTiming
  
  // Dashboard load (after login)
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'testpassword')
  await page.click('button[type="submit"]')
  
  const dashboardStart = Date.now()
  await page.waitForURL('/dashboard')
  await page.waitForSelector('[data-testid="dashboard-loaded"]')
  metrics.dashboard.loadTime = Date.now() - dashboardStart
  
  // Print results
  console.log('\n📊 Performance Metrics\n')
  console.log('Homepage:')
  console.log(`  First Paint: ${metrics.homepage.firstPaint}ms`)
  console.log(`  First Contentful Paint: ${metrics.homepage.firstContentfulPaint}ms`)
  console.log(`  DOM Loaded: ${metrics.homepage.domContentLoaded}ms`)
  
  console.log('\nDashboard:')
  console.log(`  Total Load Time: ${metrics.dashboard.loadTime}ms`)
  
  // Check against targets
  const targets = {
    firstContentfulPaint: 2000,
    dashboardLoad: 3000
  }
  
  const passed = 
    metrics.homepage.firstContentfulPaint < targets.firstContentfulPaint &&
    metrics.dashboard.loadTime < targets.dashboardLoad
  
  if (passed) {
    console.log('\n✅ All performance targets met!')
  } else {
    console.log('\n❌ Some performance targets missed')
    process.exit(1)
  }
  
  await browser.close()
}

measurePerformance().catch(console.error)
```

## Task 3: Security Audit

### 1. Security Checklist Script

```typescript
// scripts/securityAudit.ts
import https from 'https'
import { execSync } from 'child_process'

async function runSecurityAudit() {
  const checks = []
  
  // 1. Check for exposed secrets in client code
  console.log('🔍 Checking for exposed secrets...')
  const clientBuild = execSync('npm run build', { encoding: 'utf-8' })
  const secretPatterns = [
    /sk_live_/,
    /SUPABASE_SERVICE_ROLE_KEY/,
    /CLAUDE_API_KEY/,
    /process\.env\.[\w]+_SECRET/
  ]
  
  let secretsFound = false
  for (const pattern of secretPatterns) {
    if (pattern.test(clientBuild)) {
      console.log(`❌ Potential secret exposed: ${pattern}`)
      secretsFound = true
    }
  }
  
  checks.push({
    name: 'No secrets in client bundle',
    passed: !secretsFound
  })
  
  // 2. Check HTTPS redirect
  const checkHTTPS = new Promise((resolve) => {
    https.get('https://myroofgenius.com', (res) => {
      checks.push({
        name: 'HTTPS enabled',
        passed: res.statusCode === 200
      })
      resolve(null)
    }).on('error', () => {
      checks.push({
        name: 'HTTPS enabled',
        passed: false
      })
      resolve(null)
    })
  })
  
  await checkHTTPS
  
  // 3. Check security headers
  const securityHeaders = [
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection'
  ]
  
  const checkHeaders = new Promise((resolve) => {
    https.get('https://myroofgenius.com', (res) => {
      for (const header of securityHeaders) {
        checks.push({
          name: `Security header: ${header}`,
          passed: !!res.headers[header]
        })
      }
      resolve(null)
    })
  })
  
  await checkHeaders
  
  // 4. Check npm vulnerabilities
  try {
    execSync('npm audit --audit-level=high', { stdio: 'ignore' })
    checks.push({
      name: 'No high/critical npm vulnerabilities',
      passed: true
    })
  } catch {
    checks.push({
      name: 'No high/critical npm vulnerabilities',
      passed: false
    })
  }
  
  // Print results
  console.log('\n🔒 Security Audit Results\n')
  
  for (const check of checks) {
    const icon = check.passed ? '✅' : '❌'
    console.log(`${icon} ${check.name}`)
  }
  
  const allPassed = checks.every(c => c.passed)
  if (!allPassed) {
    console.log('\n⚠️  Security issues found. Fix before launch!')
    process.exit(1)
  } else {
    console.log('\n✨ All security checks passed!')
  }
}

runSecurityAudit().catch(console.error)
```

### 2. API Endpoint Security Tests

```typescript
// tests/api/security.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/onboarding/run'

describe('API Security', () => {
  test('Onboarding API requires valid persona', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        persona: 'InvalidPersona',
        data: {}
      }
    })
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toHaveProperty('error', 'Invalid persona')
  })
  
  test('Onboarding API enforces size limits', async () => {
    const largeData = 'x'.repeat(11 * 1024 * 1024) // 11MB
    
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        persona: 'Estimator',
        data: largeData
      }
    })
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(413)
    expect(JSON.parse(res._getData())).toHaveProperty('error', 'Data too large')
  })
  
  test('Protected routes require authentication', async () => {
    // Test dashboard API endpoint
    const dashboardResponse = await fetch('/api/dashboard/data', {
      headers: {
        'Cookie': '' // No auth cookie
      }
    })
    
    expect(dashboardResponse.status).toBe(401)
  })
})
```

## Task 4: Content & Copy Review

### Content Validation Checklist

```typescript
// scripts/validateContent.ts
import fs from 'fs/promises'
import path from 'path'

async function validateContent() {
  const issues = []
  
  // Pages to check
  const pagesToCheck = [
    'app/page.tsx',
    'app/marketplace/page.tsx',
    'app/tools/page.tsx',
    'app/about/page.tsx'
  ]
  
  for (const pagePath of pagesToCheck) {
    const content = await fs.readFile(pagePath, 'utf-8')
    
    // Check for Lorem ipsum
    if (/lorem ipsum/i.test(content)) {
      issues.push(`Lorem ipsum found in ${pagePath}`)
    }
    
    // Check for TODO comments
    if (/TODO|FIXME|XXX/.test(content)) {
      issues.push(`TODO comment found in ${pagePath}`)
    }
    
    // Check for placeholder text
    if (/\[.*\]/.test(content)) {
      issues.push(`Placeholder text found in ${pagePath}`)
    }
  }
  
  // Check images
  const publicDir = await fs.readdir('public')
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.webp']
  const images = publicDir.filter(file => 
    imageExtensions.some(ext => file.endsWith(ext))
  )
  
  if (images.length === 0) {
    issues.push('No images found in public directory')
  }
  
  // Report findings
  if (issues.length > 0) {
    console.log('❌ Content issues found:')
    issues.forEach(issue => console.log(`  - ${issue}`))
    process.exit(1)
  } else {
    console.log('✅ All content validated successfully')
  }
}

validateContent().catch(console.error)
```

## Task 5: Smoke Test Production

### Production Smoke Test Suite

```bash
#!/bin/bash
# scripts/smokeTestProduction.sh

echo "🔥 Running Production Smoke Tests"
echo "================================"

PROD_URL="https://myroofgenius.com"
FAILED=0

# Function to test endpoint
test_endpoint() {
  local url=$1
  local expected_status=$2
  local test_name=$3
  
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  
  if [ "$status" = "$expected_status" ]; then
    echo "✅ $test_name: $status"
  else
    echo "❌ $test_name: Expected $expected_status, got $status"
    FAILED=$((FAILED + 1))
  fi
}

# Test public pages
test_endpoint "$PROD_URL" "200" "Homepage"
test_endpoint "$PROD_URL/marketplace" "200" "Marketplace"
test_endpoint "$PROD_URL/blog" "200" "Blog"
test_endpoint "$PROD_URL/tools" "200" "Tools"
test_endpoint "$PROD_URL/about" "200" "About"

# Test API endpoints
test_endpoint "$PROD_URL/api/health" "200" "Health Check"

# Test redirects
test_endpoint "http://myroofgenius.com" "301" "HTTP to HTTPS redirect"
test_endpoint "$PROD_URL/admin" "200" "Admin (should redirect to login)"

# Test 404
test_endpoint "$PROD_URL/non-existent-page" "404" "404 Page"

# Summary
echo "================================"
if [ $FAILED -eq 0 ]; then
  echo "✨ All smoke tests passed!"
  exit 0
else
  echo "⚠️  $FAILED tests failed"
  exit 1
fi
```

## QA Sign-off Checklist

- [ ] All E2E tests passing
- [ ] Mobile responsive on iPhone, Android, iPad
- [ ] Performance metrics meet targets (FCP < 2s, TTI < 3s)
- [ ] Security audit passed (no exposed secrets, HTTPS working)
- [ ] Content reviewed (no Lorem ipsum, all images present)
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Accessibility audit passed (Lighthouse > 95)
- [ ] API error handling verified
- [ ] Production smoke tests passing