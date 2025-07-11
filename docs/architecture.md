# Architecture Overview

This document captures key components and infrastructure for MyRoofGenius.

## SEO Endpoints
The FastAPI backend exposes dynamic SEO routes. The frontend rewrites these paths to the backend:

- **GET `/sitemap.xml`** – Generates a sitemap including active product pages from Supabase.
- **GET `/robots.txt`** – Points crawlers to the sitemap and disallows nothing.

Both routes rely on `NEXT_PUBLIC_SITE_URL` for the base domain. They fall back to `https://myroofgenius.com` when not set.

## API Overview

The Next.js app proxies most functionality through API routes backed by Supabase and Stripe.

- **POST `/api/checkout`** – Creates a Stripe Checkout session. Requires `price_id`, `product_id`, and `user_id` in the body. Returns a URL to redirect the user.
- **POST `/api/webhook`** – Stripe webhook listener used to mark orders complete and issue download tokens.
- **GET `/api/download/[token]`** – Serves a purchased file if the token is valid and not expired.
- **POST `/api/analytics/track`** – Records analytics events in Supabase. Also forwards to Google Analytics when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.

## Deployment

The repository deploys to Vercel. FastAPI now lives in a separate repository. Configure `NEXT_PUBLIC_API_BASE_URL` in Vercel to point to the backend service. After pushing to `main`, Vercel automatically builds and deploys the Next.js frontend.

For local development:

```bash
npm install
npm run dev
```

Run `npm run build` then `npm start` to test production mode locally.
