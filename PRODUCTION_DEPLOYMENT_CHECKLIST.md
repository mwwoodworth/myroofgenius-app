# MyRoofGenius Production Deployment Checklist

**Version:** 1.0.0  
**Date:** July 15, 2025  
**Status:** PRE-PRODUCTION

## 🚨 Pre-Deployment Requirements

### ❌ BLOCKERS (Must be resolved before deployment)

- [ ] **Fix npm security vulnerabilities** (4 moderate severity)
  ```bash
  npm audit fix --force
  ```

- [ ] **Configure environment variables**
  - [ ] Create `.env.local` from `.env.example`
  - [ ] Add Anthropic API key for Claude
  - [ ] Add Supabase credentials
  - [ ] Add Stripe keys (publishable & secret)
  - [ ] Configure Sentry DSN

- [ ] **Implement Claude-powered AI features**
  - [ ] Dynamic persona-driven onboarding
  - [ ] Enhanced Copilot with RAG
  - [ ] Streaming responses
  - [ ] Context-aware assistance

- [ ] **Apply consistent UI theme**
  - [ ] Glassmorphism components
  - [ ] Framer Motion animations
  - [ ] Fix contrast ratios
  - [ ] Dark/light mode consistency

## 📋 Deployment Steps

### 1. Code Preparation (Local)

```bash
# Clean up legacy files
rm -rf pages.bak/
rm -f tests/test_dummy.py
rm -f REPO_ORGANIZED_BY_BRAINOPS.log

# Update dependencies
npm update
npm audit fix

# Build and test
npm run build
npm run test
npm run type-check
```

### 2. Environment Setup (Vercel)

- [ ] Log in to Vercel Dashboard
- [ ] Create new project or select existing
- [ ] Configure environment variables:
  ```
  NODE_ENV=production
  NEXT_PUBLIC_SUPABASE_URL=xxx
  NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
  SUPABASE_SERVICE_ROLE_KEY=xxx
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=xxx
  STRIPE_SECRET_KEY=xxx
  STRIPE_WEBHOOK_SECRET=xxx
  ANTHROPIC_API_KEY=xxx
  NEXT_PUBLIC_SENTRY_DSN=xxx
  ```

### 3. Database Setup (Supabase)

- [ ] Run migrations:
  ```bash
  npm run migrate
  ```
- [ ] Seed initial data:
  ```bash
  npm run seed
  ```
- [ ] Verify RLS policies are enabled
- [ ] Test database connections

### 4. Stripe Configuration

- [ ] Add webhook endpoint: `https://myroofgenius.com/api/webhook`
- [ ] Configure webhook events:
  - [ ] checkout.session.completed
  - [ ] payment_intent.succeeded
  - [ ] customer.subscription.created
- [ ] Copy webhook signing secret to env vars

### 5. Pre-Deployment Tests

- [ ] **Lighthouse Audit**
  ```bash
  npm run lighthouse:seo
  ```
  Target: Score > 90

- [ ] **Accessibility Test**
  ```bash
  npm run a11y
  ```
  Target: 0 violations

- [ ] **E2E Tests**
  ```bash
  npm run test:e2e
  ```
  Target: All passing

- [ ] **Bundle Size Check**
  ```bash
  npm run check-bundle
  ```
  Target: < 300KB gzipped

### 6. Deployment

```bash
# Deploy to Vercel
vercel --prod

# Or via Git
git push origin main
```

### 7. Post-Deployment Verification

- [ ] **Critical User Flows**
  - [ ] Homepage loads < 3s
  - [ ] Registration flow works
  - [ ] Login/logout functions
  - [ ] Persona selection saves
  - [ ] AI Copilot responds
  - [ ] Dashboard renders correctly
  - [ ] Stripe checkout completes
  - [ ] Email notifications sent

- [ ] **Monitoring**
  - [ ] Sentry receiving errors
  - [ ] Vercel Analytics active
  - [ ] Performance metrics baseline
  - [ ] Error rate < 1%

- [ ] **SEO & Meta**
  - [ ] Robots.txt accessible
  - [ ] Sitemap.xml generated
  - [ ] OG images loading
  - [ ] Schema markup valid

### 8. DNS & Domain

- [ ] Configure domain in Vercel
- [ ] Update DNS records:
  ```
  A     @     76.76.21.21
  CNAME www   cname.vercel-dns.com
  ```
- [ ] Enable SSL certificate
- [ ] Test HTTPS redirect

## 🔄 Rollback Plan

If critical issues arise:

1. **Immediate Rollback**
   ```bash
   vercel rollback
   ```

2. **Database Rollback**
   - Restore from Supabase backup
   - Run rollback migration

3. **Feature Flags**
   - Disable problematic features:
   ```env
   NEXT_PUBLIC_AI_COPILOT_ENABLED=false
   NEXT_PUBLIC_DYNAMIC_ONBOARDING=false
   ```

## 📊 Success Criteria

- [ ] Zero critical errors in first 24 hours
- [ ] Page load time < 3s (p95)
- [ ] Uptime > 99.9%
- [ ] AI response time < 2s
- [ ] User satisfaction > 4.5/5

## 📞 Emergency Contacts

- **Technical Lead**: [Contact Info]
- **DevOps**: [Contact Info]
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io

## 🎯 Go/No-Go Decision

**Prerequisites for Production:**

| Requirement | Status | Notes |
|------------|---------|--------|
| Security vulnerabilities fixed | ❌ | 4 moderate issues |
| Environment configured | ❌ | Missing API keys |
| AI features implemented | ❌ | Mock implementation only |
| UI/UX standards met | ❌ | Inconsistent theming |
| Tests passing | ⚠️ | Limited coverage |
| Performance targets met | ❓ | Not tested |

**Current Status: NOT READY FOR PRODUCTION**

Estimated time to production readiness: **3-4 weeks**

---

*This checklist must be completed and signed off by the technical lead before production deployment.*

**Sign-off:**
- [ ] Technical Lead Approval
- [ ] QA Lead Approval
- [ ] Product Owner Approval

**Deployment Date:** _____________
**Deployed By:** _____________
**Version Deployed:** _____________