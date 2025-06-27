# Sprint Task: Verify All Environment Variables

## Why This Matters
Missing environment variables cause runtime failures in production. A single missing key can break checkout, disable AI features, or prevent email delivery—destroying user trust instantly.

## What This Protects
- Production stability
- Customer checkout flow
- AI estimation features
- Email communications
- Error monitoring

## Critical Environment Variables Checklist

### 1. Database Connection (Supabase)
```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[...]
SUPABASE_SERVICE_ROLE_KEY=eyJ[...]
```
**Verify**: Test database connection in Vercel Functions logs

### 2. Payment Processing (Stripe)
```
STRIPE_SECRET_KEY=sk_live_[...]
STRIPE_WEBHOOK_SECRET=whsec_[...]
```
**Verify**: Create test checkout session, check Stripe dashboard for activity

### 3. Email Service (Resend)
```
RESEND_API_KEY=re_[...]
```
**Verify**: Trigger a test email, check Resend dashboard for sent status

### 4. AI Features (OpenAI)
```
OPENAI_API_KEY=sk-[...]
```
**Verify**: Test AI estimator feature, monitor API usage in OpenAI dashboard

### 5. Site Configuration
```
NEXT_PUBLIC_SITE_URL=https://myroofgenius.com
```
**Verify**: Ensure matches your actual production domain (no trailing slash)

### 6. Optional But Recommended
```
SENTRY_DSN=https://[...]@sentry.io/[...]
ANTHROPIC_API_KEY=sk-ant-[...]
GOOGLE_GENERATIVE_AI_API_KEY=AI[...]
```

## Verification Script

Create and run this validation script locally with production values:

```javascript
// scripts/verify-prod-env.js
require('dotenv').config({ path: '.env.production.local' })

const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'Database connection',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Database public access',
  'SUPABASE_SERVICE_ROLE_KEY': 'Database admin operations',
  'STRIPE_SECRET_KEY': 'Payment processing',
  'STRIPE_WEBHOOK_SECRET': 'Order fulfillment',
  'RESEND_API_KEY': 'Email notifications',
  'OPENAI_API_KEY': 'AI features',
  'NEXT_PUBLIC_SITE_URL': 'Site configuration'
}

console.log('🔍 Verifying Production Environment Variables\n')

let missing = []
let configured = []

for (const [key, purpose] of Object.entries(requiredVars)) {
  if (process.env[key]) {
    configured.push(`✅ ${key} (${purpose})`)
  } else {
    missing.push(`❌ ${key} (${purpose})`)
  }
}

console.log('Configured:')
configured.forEach(item => console.log(item))

if (missing.length > 0) {
  console.log('\n⚠️  Missing:')
  missing.forEach(item => console.log(item))
  console.log('\n🚨 Add missing variables to Vercel before deploying!')
  process.exit(1)
} else {
  console.log('\n✅ All required environment variables are configured!')
}
```

## Vercel Configuration Steps

1. Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables
2. For each missing variable:
   - Click "Add New"
   - Enter the key name exactly as shown
   - Paste the value (get from respective service dashboards)
   - Select environments: ✓ Production, ✓ Preview, ✓ Development
   - Click "Save"

3. After adding all variables, trigger a new deployment:
   ```bash
   vercel --prod
   ```

## Post-Deployment Verification

Run these checks on the live site:

1. **Database**: Load the marketplace page (products should appear)
2. **Stripe**: Click "Buy Now" on any product (Stripe checkout should open)
3. **AI**: Test the AI estimator with an image upload
4. **Email**: Submit a contact form or trigger password reset
5. **Monitoring**: Check Vercel Functions logs for any errors

## Success Criteria
- [ ] All required environment variables present in Vercel
- [ ] Verification script passes with production values
- [ ] No runtime errors in Vercel Functions logs
- [ ] All features work on production site
- [ ] Monitoring dashboards show healthy status