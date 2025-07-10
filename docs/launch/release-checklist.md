# MyRoofGenius Release Checklist

This checklist ensures production deployments include all required configuration and verification steps.

## 1. Required Environment Variables
Copy `.env.example` to your platform's environment settings and provide values for **all** of the following keys:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Stripe
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### AI Providers
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY` *(optional)*
- `GEMINI_API_KEY` *(optional)*

### Email & Notifications
- `RESEND_API_KEY`
- `MAKE_WEBHOOK_URL` or `SLACK_WEBHOOK_URL`

### Other
- `MAPBOX_TOKEN`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SENTRY_DSN` *(and `SENTRY_DSN` for server)*
- `PLAYWRIGHT_BASE_URL` *(for E2E tests)*

Run `npm run validate:env` locally to confirm all variables are present before deploying.

## 2. Go Live Checklist
1. **Run Tests**
   ```bash
   npm run lint
   npm test
   npm run build
   ```
2. **Deploy**
   - Push to `main` or trigger your CI pipeline.
   - Verify the build succeeds on Vercel/Render.
3. **Post‑Deploy Smoke Test**
   - Load the homepage and navigate through all major routes.
   - Complete a test purchase using Stripe test card `4242 4242 4242 4242`.
   - Confirm webhook logs show a successful event.
   - Sign up a new account and verify the login + email flow.
   - Chat with the AI Copilot and run at least three workflows.
4. **Monitoring**
   - Check Sentry for any captured exceptions.
   - Ensure alerts are sent via Make or Slack for critical errors.
5. **Final Verification**
   - All links work and no console errors appear.
   - Database tables show expected records for the test account.
   - Remove any test users or orders before announcing launch.

When every item above is complete, MyRoofGenius is ready for production traffic.
