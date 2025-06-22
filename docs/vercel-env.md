# Vercel Environment Variables

Set these variables in **Vercel → Project Settings → Environment Variables** so the
Next.js frontend and FastAPI backend can run in production.

| Variable | Purpose |
|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for the frontend |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for client-side requests |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for checkout |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for browser error reporting |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key for backend access |
| `STRIPE_SECRET_KEY` | Secret key used by the backend for Stripe API |
| `OPENAI_API_KEY` | API key for OpenAI requests |
| `SENTRY_DSN` | Backend Sentry DSN |
| `SUPABASE_URL` | Supabase service URL used by server code |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for Stripe webhooks |
| `CONVERTKIT_API_KEY` | ConvertKit API key for marketing emails |
| `CONVERTKIT_FORM_ID` | ConvertKit form ID for newsletter sign ups |
| `CHECKOUT_DOMAIN` | Optional domain override for Stripe Checkout |
