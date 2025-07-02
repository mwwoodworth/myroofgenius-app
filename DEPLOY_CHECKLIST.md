# 🛡️ MyRoofGenius Deployment Protection Checklist

## Pre-Deploy Verification

### Code Protection
- [ ] `npm run build` succeeds locally
- [ ] `npm test` passes all critical paths
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No ESLint errors: `npm run lint`

### Environment Protection  
- [ ] Run `npm run validate:env` - all critical vars set
- [ ] Stripe webhook secret configured
- [ ] Supabase service key is NOT in client bundle
- [ ] Production URLs configured correctly

### Data Protection
- [ ] Database migrations applied: `npx supabase db push`
- [ ] RLS policies tested with different user roles
- [ ] Backup strategy configured
- [ ] Download tokens expire after 7 days

### User Protection
- [ ] Error messages guide users (no stack traces)
- [ ] Loading states are honest and helpful
- [ ] Auth refresh prevents surprise logouts
- [ ] Copilot autosaves prevent data loss

## Deploy Steps

1. **Final Local Test**
   ```bash
   npm run build && npm run start
   # Test: login, checkout, dashboard, copilot
   ```

Push to GitHub
```bash
git add -A
git commit -m "Production-ready: protective systems implemented"
git push origin main
```

Vercel Deploy

Connect repo to Vercel
Add all environment variables
Deploy to preview first
Test all critical paths
Promote to production



Post-Deploy Verification

 Health check returns 200: curl https://myroofgenius.com/api/health
 Can complete full checkout flow
 Dashboard loads quickly for real user
 Webhook processes test payment
 Error tracking captures issues

First 24 Hours
Monitor for:

Payment failures in Stripe dashboard
Auth errors in Supabase logs
500 errors in Vercel functions
User feedback on performance

This system is built to protect professionals under pressure.
Every check here prevents a failure in the field.
