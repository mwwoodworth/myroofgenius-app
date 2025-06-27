# Sprint Task: Production QA & Smoke Test Guide

## Why This Matters
The first hour after deployment determines whether your launch succeeds or fails. Missing critical issues means losing customers, revenue, and trust before you even know there's a problem.

## What This Protects
- Customer first impressions
- Revenue pipeline integrity
- System stability under real load
- Early issue detection and rapid response

## Pre-Launch Smoke Test (15 Minutes)

Run these tests on the production URL immediately after deployment:

### 1. Core Page Load Tests
Execute in order, checking console for errors after each:

```javascript
// Paste in browser console on each page
console.clear();
// Navigate to page, then check:
console.assert(document.readyState === 'complete', 'Page not fully loaded');
console.assert(!document.querySelector('title').textContent.includes('404'), 'Page is 404');
console.log('Errors:', window.__errors || 'None detected');
```

**Test these pages:**
- [ ] Homepage (/) - Hero loads, CTAs visible
- [ ] Marketplace (/marketplace) - Products display
- [ ] Product Detail (/product/[any-id]) - Details load
- [ ] AI Tools (/tools) - Tools list displays
- [ ] Blog (/blog) - Articles show
- [ ] Blog Post (/blog/[any-slug]) - Content renders

### 2. Critical User Flows

**Marketplace Purchase Flow:**
1. Navigate to /marketplace
2. Click any product
3. Verify product details display
4. Click "Buy Now"
5. Verify Stripe Checkout loads
6. Use test card: 4242 4242 4242 4242
7. Complete purchase
8. Verify redirect to success page
9. Check Stripe Dashboard for order

**AI Estimator Test:**
1. Navigate to AI Estimator (if exposed)
2. Upload test image
3. Verify processing starts
4. Check for AI response
5. Verify no console errors

### 3. Mobile Responsiveness
Test on actual device or Chrome DevTools:
- [ ] Menu hamburger works
- [ ] Text is readable without zooming
- [ ] Buttons are tappable (44x44px minimum)
- [ ] Forms are usable
- [ ] Images scale properly

## Performance Validation (10 Minutes)

### 1. Lighthouse Audit
```bash
# Run in Chrome DevTools
1. Open DevTools (F12)
2. Navigate to Lighthouse tab
3. Run audit for Mobile
4. Check scores:
   - Performance: > 90
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 90
```

### 2. Load Time Verification
Use [WebPageTest.org](https://webpagetest.org):
- Test Location: Virginia, USA
- Connection: 4G
- Target: First Contentful Paint < 2s
- Target: Time to Interactive < 3s

### 3. API Response Times
Check Vercel Function logs:
- [ ] /api/checkout: < 500ms
- [ ] /api/products: < 300ms
- [ ] /api/admin/stats: < 1s
- [ ] No timeout errors (10s limit)

## Security Verification (5 Minutes)

### 1. HTTPS Enforcement
- [ ] HTTP redirects to HTTPS
- [ ] No mixed content warnings
- [ ] SSL certificate valid

### 2. Authentication Tests
- [ ] Cannot access /dashboard without login
- [ ] Cannot access /admin without admin role
- [ ] API routes return 401 for unauthorized requests

### 3. Environment Variable Protection
Open browser console and verify these are undefined:
```javascript
console.log(typeof process.env.STRIPE_SECRET_KEY); // Should be 'undefined'
console.log(typeof process.env.SUPABASE_SERVICE_ROLE_KEY); // Should be 'undefined'
console.log(typeof process.env.OPENAI_API_KEY); // Should be 'undefined'
```

## Integration Health Checks (10 Minutes)

### 1. Database Connectivity
- [ ] Products load from Supabase
- [ ] User registration creates DB record
- [ ] Orders save after Stripe purchase

### 2. Payment Processing
- [ ] Stripe Checkout session creates successfully
- [ ] Webhook endpoint responds with 200
- [ ] Test purchase appears in Stripe Dashboard

### 3. Email Delivery
- [ ] Trigger test email (password reset or order confirmation)
- [ ] Check Resend dashboard for sent status
- [ ] Verify email arrives within 2 minutes

### 4. AI Features
- [ ] OpenAI API key valid (test estimation)
- [ ] No rate limit errors
- [ ] Responses generate within timeout

## Error Monitoring (5 Minutes)

### 1. Vercel Function Logs
```bash
# Check via Vercel Dashboard → Functions
- No 500 errors
- No timeout errors
- Average duration < 3s
```

### 2. Browser Console
Navigate through site and ensure:
- [ ] No red error messages
- [ ] No failed resource loads
- [ ] No CORS errors
- [ ] No uncaught promises

### 3. Sentry Dashboard (If Configured)
- [ ] Events are being received
- [ ] No critical errors in first hour
- [ ] Performance metrics tracking

## Load Testing (Optional but Recommended)

Use [Loader.io](https://loader.io) or similar:
```
Test Configuration:
- Target: Homepage
- Duration: 60 seconds
- Users: Start with 25, scale to 100
- Success Criteria:
  - 0% error rate
  - Average response time < 500ms
  - No 502/503 errors
```

## Issue Response Protocol

If any test fails:

### Severity Levels

**Critical (Fix Immediately):**
- Site won't load
- Checkout broken
- Security vulnerability exposed
- Database unreachable

**High (Fix Within 1 Hour):**
- Key feature broken
- Performance severely degraded
- Authentication issues
- Email delivery failure

**Medium (Fix Within 24 Hours):**
- Non-critical feature issues
- Minor UI bugs
- Slow API responses
- Console warnings

### Response Steps
1. Document the issue with screenshots
2. Check if it's environment-specific
3. Verify it's reproducible
4. If critical: Consider rollback
5. If not critical: Create fix and deploy

## Launch Day Monitoring Schedule

**First Hour:** Check every 15 minutes
**Hours 2-4:** Check every 30 minutes
**Hours 4-24:** Check every 2 hours
**Day 2+:** Check twice daily

## Success Criteria
- [ ] All smoke tests pass
- [ ] Performance meets targets
- [ ] No critical errors in first hour
- [ ] Payment flow works end-to-end
- [ ] Monitoring systems report healthy