# Sprint: Operator Launch and QA Logistics

## Objective
Establish the operational foundation that ensures every system works flawlessly under pressure. This sprint defines how Operator maintains quality, manages deployments, and protects the platform's reliability—because professionals counting on our protection can't afford downtime.

## Why This Matters
When an estimator loads our system at 2am during bid week, it must work perfectly. When a contractor needs field tools on-site, they must load instantly. This sprint creates the operational discipline that delivers that reliability.

## Required Actions & Procedures

### Environment Configuration

#### Production Environment Setup
```bash
# Required environment variables for production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
SENTRY_DSN=https://...
ANALYTICS_ID=G-...

# Feature flags
ENABLE_AI_COPILOT=true
ENABLE_MARKETPLACE=true
ENABLE_FIELD_APPS=false  # Phase 2
ENABLE_ADMIN_DASHBOARD=false  # Phase 2
```

#### Vercel Deployment Configuration
1. **Production Branch**: `main`
2. **Preview Branches**: `develop`, `feature/*`
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`
5. **Node Version**: 18.x
6. **Environment Variables**: Set all production values in Vercel dashboard

### Quality Assurance Checklist

#### Pre-Launch Verification (V1 Critical Path)
- [ ] **Homepage Load Test**
  - Desktop: <2 seconds on 3G
  - Mobile: <3 seconds on 3G
  - All animations smooth (60fps)
  - No layout shift on load

- [ ] **Authentication Flow**
  - Sign up works with email
  - Sign in works across devices
  - Password reset delivers within 60 seconds
  - Session persists appropriately
  - Logout clears all sensitive data

- [ ] **AI Copilot Functionality**
  - Responds within 3 seconds
  - Rate limiting prevents abuse
  - Error states are helpful
  - Mobile interface fully functional
  - Context switching works correctly

- [ ] **Marketplace Operations**
  - Product pages load instantly
  - Checkout completes successfully
  - Download links deliver immediately
  - Stripe webhooks process correctly
  - Refund process documented

- [ ] **Cross-Platform Testing**
  - Chrome (latest 2 versions)
  - Safari (latest 2 versions)
  - Firefox (latest version)
  - Edge (latest version)
  - iOS Safari (iPhone 12+)
  - Chrome Android (latest)

- [ ] **Accessibility Compliance**
  - Keyboard navigation complete
  - Screen reader compatible
  - WCAG 2.1 AA contrast ratios
  - Focus indicators visible
  - Alt text on all images

### Performance Monitoring Setup

#### Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: <2.5s
- **FID (First Input Delay)**: <100ms
- **CLS (Cumulative Layout Shift)**: <0.1
- **Time to Interactive**: <3.5s

#### Monitoring Tools Configuration
1. **Vercel Analytics**: Auto-enabled on deployment
2. **Google Analytics 4**: Track user flows and conversions
3. **Sentry Error Tracking**: Capture and alert on errors
4. **Uptime Monitoring**: 1-minute checks on critical endpoints

### Deployment Procedures

#### Standard Deployment Flow
```bash
# 1. Run local tests
npm run test
npm run test:e2e

# 2. Build verification
npm run build
npm run start  # Test production build locally

# 3. Deploy to preview
git push origin feature/sprint-name

# 4. Verify preview deployment
# - Run through QA checklist on preview URL
# - Check all environment variables
# - Test critical user paths

# 5. Merge to main
git checkout main
git merge feature/sprint-name
git push origin main

# 6. Monitor production deployment
# - Watch Vercel dashboard for build success
# - Check error rates in Sentry
# - Verify analytics tracking
```

#### Rollback Procedures
1. **Immediate Rollback** (within 5 minutes):
   - Use Vercel dashboard "Instant Rollback" feature
   - Reverts to previous deployment instantly

2. **Code Rollback** (after 5 minutes):
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Database Rollback**:
   - Maintain daily backups
   - Document migration rollback scripts
   - Test rollback procedures monthly

### Post-Deployment Verification

#### Critical Path Testing (After Every Deploy)
1. **Anonymous User Flow**
   - Homepage loads correctly
   - Navigation works
   - AI Copilot accessible
   - Marketplace browsable

2. **Authenticated User Flow**
   - Sign in works
   - Dashboard loads
   - AI Copilot maintains context
   - Purchase flow completes

3. **Mobile Verification**
   - Test on actual device (not just browser)
   - Check touch targets (44x44 minimum)
   - Verify scroll performance
   - Test offline behavior

### Documentation Requirements

#### Operator Must Maintain:
1. **SESSION_STATE.md**
   - Update after every deployment
   - Log any configuration changes
   - Document resolved issues
   - Track performance metrics

2. **CHANGELOG.md**
   ```markdown
   ## [Version] - YYYY-MM-DD
   ### Added
   - New features with user impact
   
   ### Changed
   - Modifications to existing features
   
   ### Fixed
   - Bug fixes with issue numbers
   
   ### Performance
   - Load time improvements
   - Optimization details
   ```

3. **RUNBOOK.md**
   - Common issues and solutions
   - Emergency contacts
   - Escalation procedures
   - Business continuity plans

### Weekly Operational Tasks

#### Monday: Performance Review
- Check Core Web Vitals trends
- Review error rates in Sentry
- Analyze user flow drop-offs
- Plan optimization priorities

#### Wednesday: Security Audit
- Review authentication logs
- Check for unusual API usage
- Verify SSL certificates
- Update dependencies if needed

#### Friday: User Experience Check
- Read support tickets for patterns
- Test critical paths as real user
- Update documentation as needed
- Prepare weekly status update

### Launch Day Protocol

#### T-24 Hours
- [ ] Final QA pass on staging
- [ ] Verify all API keys are production
- [ ] Confirm DNS propagation
- [ ] Test email deliverability
- [ ] Clear CDN caches

#### T-1 Hour
- [ ] Team standby confirmation
- [ ] Monitor channels active
- [ ] Rollback plan reviewed
- [ ] Support templates ready

#### T+0 Launch
- [ ] Deploy to production
- [ ] Verify homepage loads
- [ ] Test critical user paths
- [ ] Monitor error rates
- [ ] Check performance metrics

#### T+1 Hour
- [ ] Review initial metrics
- [ ] Address any critical issues
- [ ] Update status page
- [ ] Send launch confirmation

#### T+24 Hours
- [ ] Full metrics review
- [ ] Document lessons learned
- [ ] Plan optimization sprint
- [ ] Celebrate protection delivered

## Acceptance Criteria

### Operator Verification Complete When:
- [ ] All environments properly configured
- [ ] Monitoring dashboards functional
- [ ] Error rates below 0.1%
- [ ] Page load times meet targets
- [ ] Documentation current and accessible
- [ ] Rollback procedures tested
- [ ] Team trained on procedures
- [ ] First successful deployment completed

## Critical Success Factors

1. **Zero Downtime Deployments**: Use Vercel's instant rollback
2. **Sub-3-Second Load Times**: Monitor and optimize continuously
3. **99.9% Uptime**: Multi-region deployment with failover
4. **<1% Error Rate**: Comprehensive error handling
5. **24-Hour Support Response**: Clear escalation paths

## Hand-off Protocol

### From Codex to Operator:
1. Code pushed to feature branch
2. PR created with implementation notes
3. Preview deployment auto-created
4. Operator runs QA checklist
5. Feedback loop if issues found
6. Operator approves and merges
7. Operator monitors production

### Operator Updates for Team:
- Daily: Update SESSION_STATE.md
- Weekly: Performance report
- Monthly: Full platform audit
- Quarterly: Infrastructure review

## Emergency Procedures

### Site Down
1. Check Vercel status page
2. Verify DNS resolution
3. Test API endpoints directly
4. Implement immediate rollback
5. Notify team via Slack
6. Update status page

### Performance Degradation
1. Check current traffic levels
2. Review recent deployments
3. Analyze database queries
4. Scale resources if needed
5. Implement caching if appropriate

### Security Incident
1. Isolate affected systems
2. Revoke compromised credentials
3. Implement security patches
4. Document incident timeline
5. Notify affected users if required
6. Post-mortem within 48 hours

---

Remember: Every operational decision protects professionals who depend on our system. Downtime during bid week isn't just an inconvenience—it's a business risk for our users. Operate accordingly.