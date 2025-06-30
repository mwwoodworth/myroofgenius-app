# Sprint 12 - Launch Execution & Monitoring

## Objective
Execute production deployment and establish monitoring systems for post-launch operations.

## Task 1: Final Production Deployment

### 1. Pre-Deployment Checklist

```bash
#!/bin/bash
# scripts/preLaunchChecklist.sh

echo "🚀 MyRoofGenius V1 Launch Checklist"
echo "==================================="

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

READY=true

# Function to check item
check() {
  local test_command=$1
  local description=$2
  
  if eval "$test_command"; then
    echo -e "${GREEN}✓${NC} $description"
  else
    echo -e "${RED}✗${NC} $description"
    READY=false
  fi
}

# Environment checks
check "[ ! -z '$CLAUDE_API_KEY' ]" "Claude API key configured"
check "[ ! -z '$STRIPE_SECRET_KEY' ]" "Stripe keys configured"
check "[ ! -z '$SUPABASE_SERVICE_ROLE_KEY' ]" "Supabase configured"

# Build checks
check "npm run build:prod" "Production build succeeds"
check "npm run test" "All tests pass"
check "npm run lint" "No lint errors"

# DNS checks
check "dig +short myroofgenius.com | grep -q '76.76.21.21'" "DNS A record configured"
check "curl -sI https://myroofgenius.com | grep -q '200 OK'" "HTTPS working"

# Database checks
check "npm run db:verify" "Database schema verified"
check "npm run db:seed:check" "Initial data seeded"

# Feature flags
check "grep -q 'NEXT_PUBLIC_SALES_ENABLED=true' .env.production" "Sales enabled"
check "grep -q 'NEXT_PUBLIC_ESTIMATOR_ENABLED=false' .env.production" "Estimator disabled"

if [ "$READY" = true ]; then
  echo -e "\n${GREEN}✅ All checks passed! Ready to deploy.${NC}"
  echo "Run: npm run deploy"
else
  echo -e "\n${RED}❌ Some checks failed. Fix issues before deploying.${NC}"
  exit 1
fi
```

### 2. Deployment Script

```typescript
// scripts/deployProduction.ts
import { execSync } from 'child_process'
import * as fs from 'fs/promises'

async function deployToProduction() {
  console.log('🚀 Starting MyRoofGenius V1 deployment...\n')
  
  try {
    // 1. Create deployment tag
    const version = '1.0.0'
    const tag = `v${version}`
    console.log(`📌 Creating release tag: ${tag}`)
    execSync(`git tag -a ${tag} -m "Release ${version}"`)
    execSync(`git push origin ${tag}`)
    
    // 2. Update changelog
    const changelog = `
# MyRoofGenius V1.0.0 - Launch Release

## Release Date: ${new Date().toISOString().split('T')[0]}

### Features
- ✅ AI-powered onboarding with Claude integration
- ✅ Marketplace with digital products
- ✅ Blog and content management
- ✅ Admin dashboard with feature flags
- ✅ Responsive design for all devices

### Known Limitations
- AI Estimator (coming in v1.1)
- AR Mode (coming in v1.2)

### Technical Stack
- Next.js 14 with App Router
- Supabase for auth and database
- Stripe for payments
- Claude AI for analysis
`
    await fs.writeFile('CHANGELOG.md', changelog)
    
    // 3. Deploy to Vercel
    console.log('\n📦 Deploying to Vercel...')
    const deployOutput = execSync('vercel --prod', { encoding: 'utf-8' })
    console.log(deployOutput)
    
    // 4. Get deployment URL
    const deploymentUrl = deployOutput.match(/https:\/\/[^\s]+/)?.[0]
    console.log(`\n✅ Deployed to: ${deploymentUrl}`)
    
    // 5. Run post-deployment checks
    console.log('\n🔍 Running post-deployment verification...')
    execSync(`npm run smoke-test:prod`)
    
    // 6. Notify team
    if (process.env.MAKE_WEBHOOK_URL) {
      await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'deployment_success',
          version,
          url: deploymentUrl,
          timestamp: new Date().toISOString()
        })
      })
    }
    
    console.log('\n🎉 Deployment successful!')
    console.log(`🌐 Live at: https://myroofgenius.com`)
    
  } catch (error) {
    console.error('❌ Deployment failed:', error)
    
    // Rollback option
    console.log('\n🔄 To rollback, run:')
    console.log('vercel rollback')
    
    process.exit(1)
  }
}

deployToProduction().catch(console.error)
```

## Task 2: Monitoring Setup

### 1. Vercel Analytics Configuration

```typescript
// app/layout.tsx - Add Analytics
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### 2. Custom Event Tracking

```typescript
// lib/analytics.ts
import { track } from '@vercel/analytics'

export const analytics = {
  // Onboarding events
  onboardingStarted: (persona: string) => {
    track('onboarding_started', { persona })
  },
  
  onboardingCompleted: (persona: string, duration: number) => {
    track('onboarding_completed', { persona, duration })
  },
  
  // Purchase events
  productViewed: (productId: string, productName: string) => {
    track('product_viewed', { productId, productName })
  },
  
  purchaseStarted: (productId: string, price: number) => {
    track('purchase_started', { productId, price })
  },
  
  purchaseCompleted: (productId: string, price: number) => {
    track('purchase_completed', { productId, price })
    
    // Also send to Google Analytics if configured
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        value: price,
        currency: 'USD',
        items: [{ id: productId, price }]
      })
    }
  },
  
  // Feature usage
  featureUsed: (feature: string) => {
    track('feature_used', { feature })
  }
}
```

### 3. Sentry Error Monitoring

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  beforeSend(event, hint) {
    // Filter out non-critical errors
    if (event.level === 'warning') {
      return null
    }
    
    // Add user context if available
    const user = getUser() // Your auth function
    if (user) {
      event.user = {
        id: user.id,
        email: user.email
      }
    }
    
    return event
  },
  
  integrations: [
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
})
```

### 4. Real-Time Alerts Configuration

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs'

interface Alert {
  type: 'error' | 'warning' | 'info'
  title: string
  description: string
  metadata?: Record<string, any>
}

export async function sendAlert(alert: Alert) {
  // Send to Make.com webhook for Slack/Email notifications
  if (process.env.MAKE_WEBHOOK_URL) {
    await fetch(process.env.MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...alert,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      })
    })
  }
  
  // Also capture in Sentry for severe issues
  if (alert.type === 'error') {
    Sentry.captureMessage(alert.title, {
      level: 'error',
      extra: alert.metadata
    })
  }
}

// Usage examples
export const alerts = {
  paymentFailed: (error: any, customerId: string) => {
    sendAlert({
      type: 'error',
      title: 'Payment Failed',
      description: `Customer ${customerId} payment failed`,
      metadata: { error: error.message, customerId }
    })
  },
  
  highTraffic: (requestsPerMinute: number) => {
    if (requestsPerMinute > 1000) {
      sendAlert({
        type: 'warning',
        title: 'High Traffic Alert',
        description: `Traffic spike: ${requestsPerMinute} req/min`,
        metadata: { requestsPerMinute }
      })
    }
  },
  
  aiApiError: (service: string, error: any) => {
    sendAlert({
      type: 'error',
      title: `${service} API Error`,
      description: error.message,
      metadata: { service, error: error.stack }
    })
  }
}
```

## Task 3: Post-Launch Monitoring

### 1. Health Check Endpoints

```typescript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const checks = {
    api: 'healthy',
    database: 'unknown',
    claude: 'unknown',
    stripe: 'unknown',
    timestamp: new Date().toISOString()
  }
  
  // Check database
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error } = await supabase.from('products').select('id').limit(1)
    checks.database = error ? 'unhealthy' : 'healthy'
  } catch {
    checks.database = 'unhealthy'
  }
  
  // Check Claude
  if (process.env.CLAUDE_API_KEY) {
    checks.claude = 'configured'
  }
  
  // Check Stripe
  if (process.env.STRIPE_SECRET_KEY) {
    checks.stripe = 'configured'
  }
  
  const allHealthy = Object.values(checks)
    .filter(v => typeof v === 'string')
    .every(v => v === 'healthy' || v === 'configured')
  
  res.status(allHealthy ? 200 : 503).json(checks)
}
```

### 2. Monitoring Dashboard Script

```typescript
// scripts/monitoringDashboard.ts
import Table from 'cli-table3'
import chalk from 'chalk'

async function displayMonitoringDashboard() {
  console.clear()
  console.log(chalk.bold.blue('🎯 MyRoofGenius Live Monitoring Dashboard\n'))
  
  // Fetch metrics
  const [health, analytics, errors] = await Promise.all([
    fetch('https://myroofgenius.com/api/health').then(r => r.json()),
    getVercelAnalytics(),
    getSentryErrors()
  ])
  
  // Health Status
  const healthTable = new Table({
    head: ['Service', 'Status'],
    style: { head: ['cyan'] }
  })
  
  Object.entries(health).forEach(([service, status]) => {
    if (service !== 'timestamp') {
      const statusColor = status === 'healthy' || status === 'configured' 
        ? chalk.green(status) 
        : chalk.red(status)
      healthTable.push([service, statusColor])
    }
  })
  
  console.log(chalk.bold('System Health:'))
  console.log(healthTable.toString())
  
  // Traffic Analytics
  console.log(chalk.bold('\nTraffic (Last 24h):'))
  console.log(`  Visitors: ${analytics.visitors}`)
  console.log(`  Page Views: ${analytics.pageViews}`)
  console.log(`  Avg Duration: ${analytics.avgDuration}s`)
  
  // Error Summary
  console.log(chalk.bold('\nError Summary:'))
  console.log(`  Last Hour: ${errors.lastHour}`)
  console.log(`  Last 24h: ${errors.last24h}`)
  
  // Refresh every 30 seconds
  setTimeout(() => displayMonitoringDashboard(), 30000)
}

async function getVercelAnalytics() {
  // Mock data - replace with actual Vercel Analytics API
  return {
    visitors: Math.floor(Math.random() * 1000),
    pageViews: Math.floor(Math.random() * 5000),
    avgDuration: Math.floor(Math.random() * 180)
  }
}

async function getSentryErrors() {
  // Mock data - replace with actual Sentry API
  return {
    lastHour: Math.floor(Math.random() * 5),
    last24h: Math.floor(Math.random() * 50)
  }
}

displayMonitoringDashboard().catch(console.error)
```

## Task 4: Launch Communications

### 1. Create Launch Announcement

```markdown
# launch-announcement.md

# 🚀 MyRoofGenius V1.0 is Live!

We're excited to announce the official launch of MyRoofGenius - your AI-powered roofing intelligence platform.

## What's Available Now

### ✅ AI-Powered Onboarding
- Personalized experiences for Estimators, Architects, Building Owners, and Contractors
- Import your data and get instant AI-driven insights
- Powered by Claude AI for accurate, actionable analysis

### ✅ Digital Marketplace
- Professional roofing templates and tools
- Instant downloads after purchase
- Secure payments via Stripe

### ✅ Resource Center
- Expert blog content
- Curated tool directory
- Industry best practices

## Coming Soon

- 🔜 AI Estimator with image analysis (v1.1)
- 🔜 AR measurement tools (v1.2)
- 🔜 Mobile field apps (v2.0)

## Get Started

Visit [myroofgenius.com](https://myroofgenius.com) and click "Get Started" to begin your free onboarding.

## Support

- Email: support@myroofgenius.com
- Documentation: [docs.myroofgenius.com](https://docs.myroofgenius.com)
- Status: [status.myroofgenius.com](https://status.myroofgenius.com)
```

### 2. Operations Handoff Document

```markdown
# operations-handoff.md

# MyRoofGenius Operations Guide

## Access Credentials

### Admin Access
- URL: https://myroofgenius.com/admin
- Credentials: Stored in 1Password vault "MyRoofGenius Ops"

### Monitoring Dashboards
- Vercel: https://vercel.com/team/myroofgenius
- Sentry: https://sentry.io/organizations/myroofgenius
- Supabase: https://app.supabase.com/project/[PROJECT_ID]
- Stripe: https://dashboard.stripe.com

## Daily Operations

### Morning Checklist (9 AM)
1. Check health endpoint: https://myroofgenius.com/api/health
2. Review Sentry for overnight errors
3. Check Stripe for failed payments
4. Review support tickets in admin panel

### Feature Flag Management
- Access via /admin/features
- Current settings:
  - Sales: ENABLED
  - AI Copilot: ENABLED
  - Estimator: DISABLED (enable after QA in v1.1)
  - AR Mode: DISABLED (planned for v1.2)

### Content Management

#### Blog Posts
1. Login to admin panel
2. Navigate to /admin/blog
3. Use markdown editor for content
4. Preview before publishing

#### Marketplace Products
1. Create product in Stripe Dashboard first
2. Add to database via /admin/products
3. Link Stripe price ID
4. Test purchase flow

## Incident Response

### Severity Levels
- **P0 (Critical)**: Site down, payments failing
  - Response: Immediate
  - Escalate to: Engineering lead
  
- **P1 (High)**: Major feature broken
  - Response: Within 1 hour
  - Escalate to: On-call engineer
  
- **P2 (Medium)**: Minor feature issues
  - Response: Within 4 hours
  - Handle in normal queue

### Rollback Procedure
```bash
# In Vercel dashboard
vercel rollback

# Or via CLI
vercel rollback [deployment-id]
```

## Support Procedures

### Common Issues

1. **Login Problems**
   - Check Supabase Auth logs
   - Verify email confirmation
   - Reset password if needed

2. **Payment Issues**
   - Check Stripe dashboard
   - Verify webhook is receiving events
   - Check order status in database

3. **AI Analysis Errors**
   - Verify Claude API key is valid
   - Check API usage limits
   - Review error logs in Sentry

## Maintenance Windows

- Scheduled: Sundays 2-4 AM EST
- Notification: 48 hours advance via status page
- Procedure: Enable maintenance mode in admin panel
```

## Launch Success Metrics

Monitor these KPIs in the first week:

- [ ] Zero P0 incidents
- [ ] < 5 P1 incidents
- [ ] > 100 user signups
- [ ] > 10 marketplace purchases
- [ ] < 2% error rate in Sentry
- [ ] Average page load < 3 seconds
- [ ] Uptime > 99.9%