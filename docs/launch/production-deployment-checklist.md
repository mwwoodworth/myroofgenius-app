# Sprint Task: Production Deployment Checklist

## Why This Matters
A single missed step during deployment can take your site offline, break critical features, or expose security vulnerabilities. This checklist prevents disaster.

## What This Protects
- Zero-downtime deployment
- Revenue-generating features
- Customer data security
- Brand reputation

## Pre-Deployment Verification

### 1. Code Readiness
- [ ] All tests passing locally
  ```bash
  npm test
  npm run test:e2e
  ```
- [ ] No ESLint errors
  ```bash
  npm run lint
  ```
- [ ] Production build successful
  ```bash
  npm run build
  ```
- [ ] All PR comments addressed
- [ ] Main branch is up to date

### 2. Environment Configuration
- [ ] All environment variables verified in Vercel dashboard
- [ ] NEXT_PUBLIC_SITE_URL matches production domain
- [ ] Stripe webhook secret configured
- [ ] API keys are production (not test) versions

### 3. Database Preparation
- [ ] Supabase production instance configured
- [ ] Required tables exist (products, orders, downloads, users)
- [ ] Sample products loaded for marketplace
- [ ] Admin user account created
- [ ] Row Level Security (RLS) policies enabled

## Deployment Steps

### 1. Final Local Verification
```bash
# Clean install to match CI environment
rm -rf node_modules package-lock.json
npm install

# Run all checks
npm run lint
npm test
npm run build

# Test production build locally
npm start
# Navigate to http://localhost:3000 and verify all pages
```

### 2. Git Preparation
```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Tag the release
git tag -a v1.0.0 -m "Initial production release"
git push origin v1.0.0
```

### 3. Vercel Deployment

**Option A: Automatic (Recommended)**
1. Push to main branch
2. Vercel auto-deploys within 2-3 minutes
3. Monitor build logs in Vercel dashboard

**Option B: Manual**
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy to production
vercel --prod
```

### 4. DNS Configuration (If Custom Domain)
- [ ] A record points to Vercel's IP
- [ ] CNAME record for www subdomain
- [ ] SSL certificate provisioned (automatic on Vercel)
- [ ] Force HTTPS enabled in Vercel settings

## Post-Deployment Verification

### 1. Immediate Checks (Within 5 Minutes)
- [ ] Homepage loads without errors
- [ ] Console shows no JavaScript errors
- [ ] Navigation works (all menu items)
- [ ] Images and assets load properly
- [ ] Mobile responsive design works

### 2. Feature Testing (Within 15 Minutes)
- [ ] Marketplace displays products
- [ ] Product detail pages load
- [ ] Stripe checkout initiates (test mode ok)
- [ ] AI Tools page accessible
- [ ] Blog posts display correctly
- [ ] Contact forms submit without error

### 3. Monitoring Setup
- [ ] Vercel Analytics enabled
- [ ] Function logs show no errors
- [ ] Sentry (if configured) receiving data
- [ ] Google Analytics/Tag Manager installed

## Rollback Plan

If critical issues discovered:

### Quick Rollback (< 2 minutes)
1. Go to Vercel Dashboard → Deployments
2. Find previous stable deployment
3. Click "..." menu → "Promote to Production"
4. Verify rollback successful

### Git Rollback (if needed)
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific version
git reset --hard <previous-commit-hash>
git push --force origin main
```

## Communication Plan

### Internal Team
- [ ] Notify team of deployment start
- [ ] Share deployment URL for testing
- [ ] Confirm all features verified
- [ ] Announce deployment complete

### External (If Applicable)
- [ ] Update status page (if exists)
- [ ] Prepare customer announcement
- [ ] Social media ready (if launching publicly)
- [ ] Support team briefed on new features

## Success Metrics

Monitor these KPIs post-launch:
- [ ] Page load time < 3 seconds
- [ ] Zero 500 errors in first hour
- [ ] Successful checkout completion
- [ ] No critical Sentry alerts
- [ ] Positive user feedback

## Emergency Contacts

Document these before deployment:
- Vercel Support: [support URL]
- Supabase Status: [status URL]
- Stripe Support: [support URL]
- On-call developer: [contact]

## Final Sign-off

Before marking deployment complete:
- [ ] All checklist items verified
- [ ] No critical issues identified
- [ ] Monitoring shows healthy status
- [ ] Team notified of success
- [ ] Deployment documented in changelog