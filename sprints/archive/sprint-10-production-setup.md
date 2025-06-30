# Sprint 10 - Production Environment Setup

## Objective
Configure all production environment variables, DNS settings, and deployment pipeline for launch.

## Task 1: Production Environment Variables

### Create Production Environment File

```bash
# .env.production
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://myroofgenius.com
NEXT_PUBLIC_APP_NAME="MyRoofGenius"
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]

# Authentication
NEXTAUTH_URL=https://myroofgenius.com
NEXTAUTH_SECRET=[GENERATE_WITH: openssl rand -base64 32]

# AI Services
CLAUDE_API_KEY=[PRODUCTION_CLAUDE_KEY]
OPENAI_API_KEY=[PRODUCTION_OPENAI_KEY]

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[PRODUCTION_KEY]
STRIPE_SECRET_KEY=sk_live_[PRODUCTION_KEY]
STRIPE_WEBHOOK_SECRET=whsec_[PRODUCTION_WEBHOOK_SECRET]

# Email Services
RESEND_API_KEY=[PRODUCTION_RESEND_KEY]
CONVERTKIT_API_KEY=[PRODUCTION_CONVERTKIT_KEY]
CONVERTKIT_FORM_ID=[PRODUCTION_FORM_ID]

# Monitoring
SENTRY_DSN=[PRODUCTION_SENTRY_DSN]
NEXT_PUBLIC_SENTRY_DSN=[PRODUCTION_SENTRY_DSN]
SENTRY_AUTH_TOKEN=[SENTRY_AUTH_TOKEN]
MAKE_WEBHOOK_URL=[PRODUCTION_WEBHOOK_URL]

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-[PRODUCTION_GA_ID]
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=[VERCEL_ANALYTICS_ID]

# Feature Flags
NEXT_PUBLIC_SALES_ENABLED=true
NEXT_PUBLIC_AI_COPILOT_ENABLED=true
NEXT_PUBLIC_ESTIMATOR_ENABLED=false
NEXT_PUBLIC_AR_MODE_ENABLED=false

# Admin Setup
ADMIN_EMAIL=admin@myroofgenius.com
ADMIN_PASSWORD=[SECURE_PASSWORD]
```

### Vercel Environment Setup Script

```typescript
// scripts/setupVercelEnv.ts
import { exec } from 'child_process'
import { promisify } from 'util'
import * as dotenv from 'dotenv'

const execAsync = promisify(exec)

async function setupVercelEnvironment() {
  // Load production env file
  const envConfig = dotenv.config({ path: '.env.production' })
  
  if (envConfig.error) {
    throw new Error('Failed to load .env.production')
  }
  
  const envVars = envConfig.parsed!
  
  // Add each variable to Vercel
  for (const [key, value] of Object.entries(envVars)) {
    try {
      // Skip if value is placeholder
      if (value.includes('[') && value.includes(']')) {
        console.warn(`⚠️  Skipping ${key} - contains placeholder`)
        continue
      }
      
      // Add to production environment
      await execAsync(
        `vercel env add ${key} production < <(echo "${value}")`
      )
      console.log(`✅ Added ${key} to production`)
      
    } catch (error) {
      console.error(`❌ Failed to add ${key}:`, error)
    }
  }
}

setupVercelEnvironment().catch(console.error)
```

## Task 2: DNS Configuration

### 1. Update DNS Records

```yaml
# DNS Configuration for myroofgenius.com
# Add these records at your DNS provider (e.g., Cloudflare, Route53)

# A Records
@    A    76.76.21.21     # Vercel IP
www  A    76.76.21.21     # Vercel IP

# CNAME Records  
www  CNAME  cname.vercel-dns.com.

# TXT Records (for domain verification)
_vercel  TXT  [VERCEL_VERIFICATION_TOKEN]
```

### 2. Vercel Domain Setup Script

```bash
#!/bin/bash
# scripts/setupVercelDomains.sh

# Add domains to Vercel project
vercel domains add myroofgenius.com
vercel domains add www.myroofgenius.com

# Verify domains
vercel domains inspect myroofgenius.com
vercel domains inspect www.myroofgenius.com

# Set production alias
vercel alias set myroofgenius.com --prod
```

### 3. DNS Health Check Script

```typescript
// scripts/checkDNS.ts
import dns from 'dns/promises'
import https from 'https'

async function checkDNSHealth() {
  const domain = 'myroofgenius.com'
  const checks = {
    aRecord: false,
    wwwRecord: false,
    httpsRedirect: false,
    sslCertificate: false
  }
  
  try {
    // Check A record
    const aRecords = await dns.resolve4(domain)
    checks.aRecord = aRecords.includes('76.76.21.21')
    console.log(`✅ A Record: ${checks.aRecord}`)
    
    // Check www subdomain
    const wwwRecords = await dns.resolve4(`www.${domain}`)
    checks.wwwRecord = wwwRecords.length > 0
    console.log(`✅ WWW Record: ${checks.wwwRecord}`)
    
    // Check HTTPS redirect
    await new Promise((resolve) => {
      https.get(`https://${domain}`, (res) => {
        checks.httpsRedirect = res.statusCode === 200
        checks.sslCertificate = res.socket.authorized
        resolve(null)
      })
    })
    
    console.log(`✅ HTTPS Redirect: ${checks.httpsRedirect}`)
    console.log(`✅ SSL Certificate: ${checks.sslCertificate}`)
    
    // Summary
    const allPassed = Object.values(checks).every(v => v)
    if (allPassed) {
      console.log('\n🎉 All DNS checks passed!')
    } else {
      console.log('\n⚠️  Some DNS checks failed')
    }
    
  } catch (error) {
    console.error('DNS check failed:', error)
  }
}

checkDNSHealth()
```

## Task 3: Deployment Pipeline Configuration

### 1. Update package.json Scripts

```json
{
  "scripts": {
    "build": "next build",
    "build:prod": "NODE_ENV=production next build",
    "start": "next start",
    "dev": "next dev",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:e2e": "playwright test",
    "validate": "npm run lint && npm run type-check && npm run test",
    "predeploy": "npm run validate && npm run build:prod",
    "deploy": "vercel --prod",
    "postdeploy": "npm run smoke-test:prod"
  }
}
```

### 2. Create Deployment Checklist Script

```typescript
// scripts/preDeploymentCheck.ts
import fs from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'

interface CheckResult {
  name: string
  passed: boolean
  details?: string
}

async function runPreDeploymentChecks(): Promise<void> {
  const checks: CheckResult[] = []
  
  // 1. Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'CLAUDE_API_KEY',
    'STRIPE_SECRET_KEY',
    'RESEND_API_KEY'
  ]
  
  for (const envVar of requiredEnvVars) {
    checks.push({
      name: `Environment: ${envVar}`,
      passed: !!process.env[envVar],
      details: process.env[envVar] ? 'Set' : 'Missing'
    })
  }
  
  // 2. Run build
  try {
    execSync('npm run build:prod', { stdio: 'ignore' })
    checks.push({
      name: 'Production Build',
      passed: true,
      details: 'Build successful'
    })
  } catch (error) {
    checks.push({
      name: 'Production Build',
      passed: false,
      details: 'Build failed'
    })
  }
  
  // 3. Run tests
  try {
    execSync('npm run test', { stdio: 'ignore' })
    checks.push({
      name: 'Unit Tests',
      passed: true,
      details: 'All tests passed'
    })
  } catch (error) {
    checks.push({
      name: 'Unit Tests',
      passed: false,
      details: 'Some tests failed'
    })
  }
  
  // 4. Check for console logs
  const srcFiles = await getFilesRecursively('./src')
  let consoleCount = 0
  
  for (const file of srcFiles) {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = await fs.readFile(file, 'utf-8')
      const matches = content.match(/console\.(log|error|warn)/g)
      if (matches) consoleCount += matches.length
    }
  }
  
  checks.push({
    name: 'Console Statements',
    passed: consoleCount === 0,
    details: `Found ${consoleCount} console statements`
  })
  
  // Print results
  console.log('\n🚀 Pre-Deployment Checklist\n')
  
  for (const check of checks) {
    const icon = check.passed ? '✅' : '❌'
    console.log(`${icon} ${check.name}: ${check.details || ''}`)
  }
  
  const allPassed = checks.every(c => c.passed)
  
  if (allPassed) {
    console.log('\n✨ All checks passed! Ready to deploy.')
  } else {
    console.log('\n⚠️  Some checks failed. Please fix before deploying.')
    process.exit(1)
  }
}

async function getFilesRecursively(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name)
      return dirent.isDirectory() ? getFilesRecursively(res) : res
    })
  )
  return files.flat()
}

runPreDeploymentChecks().catch(console.error)
```

## Task 4: Database Migration Verification

### Verify Production Database Schema

```sql
-- scripts/verifyProductionSchema.sql
-- Run this against production Supabase to verify all tables exist

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected tables:
-- blog_posts
-- contact_submissions
-- faq_items
-- feature_flags
-- marketplace_orders
-- products
-- support_tickets
-- user_profiles
-- waitlist_entries

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Verification Checklist

- [ ] All production environment variables set in Vercel
- [ ] DNS A records pointing to Vercel IPs
- [ ] Domain verified in Vercel dashboard
- [ ] SSL certificate provisioned
- [ ] Production build succeeds locally
- [ ] All tests pass
- [ ] Database schema matches development
- [ ] No placeholder values in environment variables