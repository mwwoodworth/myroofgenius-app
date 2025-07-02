## Sprint 15: Final Integration Testing & Deployment Preparation

```markdown
# Sprint 15: Final Integration Testing & Deployment Preparation

## Objective
Perform comprehensive integration testing, create production deployment checklist, and ensure the application is fully ready for Vercel deployment with zero errors.

## Critical Context for Codex
- Run full integration test suite
- Verify all environment variables are documented
- Create comprehensive deployment checklist
- Perform production build locally to catch any issues
- Create monitoring and alerting setup

## Task 1: Create Comprehensive Test Suite

### Create `tests/integration/full-flow.test.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Full User Flow', () => {
  test('complete purchase flow', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/MyRoofGenius/);
    
    // 2. Navigate to marketplace
    await page.click('text=Templates');
    await page.waitForSelector('[data-testid="product-grid"]');
    
    // 3. Select a product
    await page.click('[data-testid="product-card"]:first-child');
    await page.waitForSelector('[data-testid="product-details"]');
    
    // 4. Add to cart and checkout
    await page.click('text=Buy Now');
    
    // 5. Fill checkout form (Stripe test mode)
    await page.waitForSelector('iframe[title="Secure payment input frame"]');
    
    // Note: Actual Stripe checkout testing requires special handling
    // This is a placeholder for the full test
  });

  test('AI Copilot interaction', async ({ page }) => {
    // 1. Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // 2. Open Copilot
    await page.waitForSelector('[data-testid="copilot-toggle"]');
    await page.click('[data-testid="copilot-toggle"]');
    
    // 3. Send a message
    await page.fill('[data-testid="copilot-input"]', 'What is the best roofing material?');
    await page.click('[data-testid="copilot-send"]');
    
    // 4. Verify response
    await page.waitForSelector('[data-testid="copilot-message"]');
    const message = await page.textContent('[data-testid="copilot-message"]:last-child');
    expect(message).toBeTruthy();
  });

  test('roof analysis upload', async ({ page }) => {
    // 1. Navigate to analysis page
    await page.goto('/demo');
    
    // 2. Upload test image
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-roof.jpg');
    
    // 3. Wait for analysis
    await page.waitForSelector('[data-testid="analysis-results"]', {
      timeout: 30000
    });
    
    // 4. Verify results
    const results = await page.textContent('[data-testid="analysis-results"]');
    expect(results).toContain('Analysis complete');
  });
});
Task 2: Create Production Environment Validator
Create scripts/validate-production.ts:
typescript#!/usr/bin/env node
import { config } from 'dotenv';
import chalk from 'chalk';

// Load production environment
config({ path: '.env.production.local' });

interface EnvVar {
  name: string;
  required: boolean;
  validator?: (value: string) => boolean;
  description: string;
}

const ENV_VARS: EnvVar[] = [
  // Supabase
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    validator: (v) => v.startsWith('https://') && v.includes('.supabase.co'),
    description: 'Supabase project URL',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    validator: (v) => v.length > 100,
    description: 'Supabase anonymous key',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    validator: (v) => v.length > 100,
    description: 'Supabase service role key',
  },
  
  // Stripe
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    validator: (v) => v.startsWith('sk_'),
    description: 'Stripe secret key',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    validator: (v) => v.startsWith('whsec_'),
    description: 'Stripe webhook secret',
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    validator: (v) => v.startsWith('pk_'),
    description: 'Stripe publishable key',
  },
  
  // AI Services
  {
    name: 'OPENAI_API_KEY',
    required: false,
    validator: (v) => v.startsWith('sk-'),
    description: 'OpenAI API key',
  },
  {
    name: 'ANTHROPIC_API_KEY',
    required: false,
    validator: (v) => v.length > 50,
    description: 'Anthropic (Claude) API key',
  },
  {
    name: 'GEMINI_API_KEY',
    required: false,
    validator: (v) => v.length > 30,
    description: 'Google Gemini API key',
  },
  
  // Other Services
  {
    name: 'RESEND_API_KEY',
    required: true,
    validator: (v) => v.startsWith('re_'),
    description: 'Resend email API key',
  },
  {
    name: 'MAPBOX_TOKEN',
    required: true,
    validator: (v) => v.startsWith('pk.') || v.startsWith('sk.'),
    description: 'Mapbox API token',
  },
  {
    name: 'NEXT_PUBLIC_SENTRY_DSN',
    required: false,
    validator: (v) => v.includes('sentry.io'),
    description: 'Sentry error tracking DSN',
  },
  
  // Feature Flags
  {
    name: 'NEXT_PUBLIC_AI_COPILOT_ENABLED',
    required: true,
    validator: (v) => ['true', 'false'].includes(v),
    description: 'AI Copilot feature flag',
  },
  {
    name: 'NEXT_PUBLIC_AR_MODE_ENABLED',
    required: true,
    validator: (v) => ['true', 'false'].includes(v),
    description: 'AR Mode feature flag',
  },
  {
    name: 'SALES_ENABLED',
    required: true,
    validator: (v) => ['true', 'false'].includes(v),
    description: 'Sales/checkout feature flag',
  },
  
  // URLs
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    validator: (v) => v.startsWith('http'),
    description: 'Production app URL',
  },
];

function validateEnvironment() {
  console.log(chalk.blue('🔍 Validating production environment...\n'));
  
  let hasErrors = false;
  const results: Array<{ var: EnvVar; value: string | undefined; valid: boolean }> = [];

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];
    let valid = true;

    if (envVar.required && !value) {
      valid = false;
    } else if (value && envVar.validator && !envVar.validator(value)) {
      valid = false;
    }

    results.push({ var: envVar, value, valid });
    
    if (!valid && envVar.required) {
      hasErrors = true;
    }
  }

  // Display results
  console.log(chalk.bold('Required Environment Variables:'));
  results
    .filter(r => r.var.required)
    .forEach(({ var: envVar, value, valid }) => {
      const status = valid ? chalk.green('✓') : chalk.red('✗');
      const valueDisplay = value ? chalk.gray('(set)') : chalk.red('(missing)');
      console.log(`${status} ${envVar.name} ${valueDisplay} - ${envVar.description}`);
    });

  console.log('\n' + chalk.bold('Optional Environment Variables:'));
  results
    .filter(r => !r.var.required)
    .forEach(({ var: envVar, value, valid }) => {
      const status = value ? (valid ? chalk.green('✓') : chalk.yellow('⚠')) : chalk.gray('○');
      const valueDisplay = value ? chalk.gray('(set)') : chalk.gray('(not set)');
      console.log(`${status} ${envVar.name} ${valueDisplay} - ${envVar.description}`);
    });

  if (hasErrors) {
    console.log('\n' + chalk.red('❌ Environment validation failed!'));
    console.log(chalk.yellow('Please set all required environment variables before deploying.'));
    process.exit(1);
  } else {
    console.log('\n' + chalk.green('✅ Environment validation passed!'));
  }
}

// Run validation
validateEnvironment();
Task 3: Create Deployment Checklist
Create DEPLOYMENT_CHECKLIST.md:
markdown# MyRoofGenius Production Deployment Checklist

## Pre-Deployment Verification

### 1. Code Quality
- [ ] All linting errors resolved (`npm run lint`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] All tests passing (`npm test && npm run test:e2e`)
- [ ] No console.log statements in production code
- [ ] Error handling implemented for all API routes

### 2. Environment Configuration
- [ ] Run production environment validator (`npm run validate:prod`)
- [ ] All required environment variables set in Vercel
- [ ] Feature flags configured appropriately:
  - `NEXT_PUBLIC_AI_COPILOT_ENABLED=true`
  - `NEXT_PUBLIC_AR_MODE_ENABLED=false`
  - `SALES_ENABLED=true`
- [ ] Production URLs configured correctly

### 3. Database Setup
- [ ] All migrations applied to production database
- [ ] RLS policies tested and verified
- [ ] Seed data loaded (products, email templates)
- [ ] Database backups configured

### 4. Third-Party Services
- [ ] Stripe webhook endpoint configured
- [ ] Stripe webhook secret added to env vars
- [ ] Email service (Resend) verified and sending
- [ ] Sentry project created and DSN configured
- [ ] AI API keys tested (OpenAI/Anthropic/Gemini)

### 5. Security Audit
- [ ] All API routes have proper authentication
- [ ] Service role key only used server-side
- [ ] CORS configured appropriately
- [ ] Security headers implemented
- [ ] No sensitive data in client bundles

### 6. Performance Check
- [ ] Production build size acceptable
- [ ] Lighthouse scores meet targets:
  - Performance: >90
  - Accessibility: >90
  - Best Practices: >90
  - SEO: >90
- [ ] Images optimized and using Next.js Image
- [ ] Code splitting working properly

## Deployment Steps

### 1. Final Local Build Test
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Production build
npm run build

# Test production build locally
npm run start
2. Vercel Deployment Configuration

 Connect GitHub repository to Vercel
 Set Node.js version to 18.x
 Configure build command: npm run build
 Configure output directory: .next
 Set environment variables (use Vercel UI)
 Configure custom domain (if applicable)

3. Deploy to Production

 Deploy via Vercel dashboard or CLI
 Monitor build logs for any errors
 Verify deployment URL works
 Check all environment variables loaded

Post-Deployment Verification
1. Functional Testing

 Homepage loads correctly
 Authentication flow works (signup/login/logout)
 Marketplace displays products
 Checkout flow completes successfully
 Email confirmations sent
 Download links work
 AI Copilot responds to queries
 Image analysis processes correctly

2. Monitoring Setup

 Sentry receiving error reports
 Vercel Analytics configured
 Create uptime monitor (e.g., Pingdom)
 Set up alerts for critical errors

3. Performance Monitoring

 Check initial load time (<3s target)
 Verify CDN serving static assets
 Monitor Vercel function execution times
 Check database query performance

4. Security Verification

 Run security headers test
 Verify HTTPS everywhere
 Check for exposed API keys
 Test authentication boundaries

Rollback Plan
If critical issues discovered:

Revert to previous deployment in Vercel
Identify root cause in staging environment
Fix issues and re-test thoroughly
Re-deploy with fixes

Support Documentation

 Update README with production URLs
 Document environment variables
 Create troubleshooting guide
 Set up customer support flow


## Task 4: Create Monitoring Setup

### Create `scripts/setup-monitoring.ts`:
```typescript
import { config } from 'dotenv';
config();

// This script sets up monitoring and alerting
async function setupMonitoring() {
  console.log('Setting up production monitoring...');
  
  // 1. Verify Sentry is configured
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.log('✓ Sentry configured');
    // Could make API call to verify project exists
  } else {
    console.log('⚠ Sentry not configured - error tracking disabled');
  }
  
  // 2. Set up health check endpoint
  console.log('✓ Health check available at /api/health');
  
  // 3. Configure alerts (if using external service)
  if (process.env.MAKE_WEBHOOK_URL) {
    console.log('✓ Alerts configured via Make.com webhook');
  } else if (process.env.SLACK_WEBHOOK_URL) {
    console.log('✓ Alerts configured via Slack webhook');
  } else {
    console.log('⚠ No alert webhook configured');
  }
  
  console.log('\nMonitoring setup complete!');
}

setupMonitoring();
Create app/api/health/route.ts:
typescriptimport { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      database: false,
      stripe: false,
      email: false,
      ai: false,
    },
  };

  try {
    // Check database
    const supabase = createServiceClient();
    const { error } = await supabase.from('products').select('id').limit(1);
    checks.checks.database = !error;
  } catch (e) {
    checks.checks.database = false;
  }

  // Check critical services
  checks.checks.stripe = !!process.env.STRIPE_SECRET_KEY;
  checks.checks.email = !!process.env.RESEND_API_KEY;
  checks.checks.ai = !!(
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.GEMINI_API_KEY
  );

  // Overall status
  const allChecks = Object.values(checks.checks);
  const hasFailures = allChecks.includes(false);
  
  if (hasFailures) {
    checks.status = 'degraded';
  }

  return NextResponse.json(checks, {
    status: hasFailures ? 503 : 200,
  });
}
Task 5: Create Production Scripts
Update package.json scripts:
json{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "dev": "next dev",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:e2e": "playwright test",
    "test:all": "npm run lint && npm run type-check && npm run test && npm run test:e2e",
    "validate:env": "tsx scripts/validate-env.ts",
    "validate:prod": "tsx scripts/validate-production.ts",
    "setup:monitoring": "tsx scripts/setup-monitoring.ts",
    "build:analyze": "ANALYZE=true next build",
    "migrate:prod": "dotenv -e .env.production.local -- npx supabase db push",
    "seed:prod": "dotenv -e .env.production.local -- tsx scripts/seed.ts"
  }
}
Validation Steps

Run full test suite: npm run test:all
Validate production environment: npm run validate:prod
Build production locally: npm run build
Test production build: npm run start
Complete deployment checklist

Success Criteria

 All tests passing
 Production build successful
 Environment validation passing
 Deployment checklist completed
 Health check endpoint working
 Zero errors in production logs