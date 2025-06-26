# MyRoofGenius Deployment Guide

This guide outlines how to deploy the MyRoofGenius application, including the database, backend services, and frontend.

## Prerequisites

- **Node.js 18+** and npm installed.
- **Supabase** account (for database, auth, and storage).
- **Stripe** account (for payment processing).
- **OpenAI API key** (for AI features).
- **Resend API key** (for sending emails).
- **Vercel** account (for deploying the Next.js app, recommended).

## 1. Clone Repository & Install

```bash
git clone https://github.com/yourusername/myroofgenius.git
cd myroofgenius
npm install
cp .env.example .env.local
```
Fill in `.env.local` with your production credentials before building.

## 2. Set Up Supabase

Create a new Supabase project and obtain the project URL and keys.
Run the migrations and seed data:

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
npm run seed
```

Ensure storage buckets `product-files`, `roof-images`, and `reports` exist. Configure auth providers as needed.

## 3. Configure Stripe

Create products and prices in Stripe that match the seed data or update the database with the correct price IDs. Set up a webhook pointing to `https://<your-domain>/api/webhook` and copy the signing secret to `.env.local`.

## 4. Email Sending

Sign up for Resend (or another email provider) and get an API key. Set `RESEND_API_KEY` in `.env.local`. Verify your sending domain if necessary.

## 5. OpenAI API Setup

Ensure you have an OpenAI API key with access to GPT‑4. Add `OPENAI_API_KEY` in `.env.local`.

## 6. Vercel Deployment

Create a project on Vercel and link it to the repository. Add all environment variables from `.env.local` in the Vercel dashboard. Vercel will detect the Next.js app and build it using `vercel.json`.

## 7. Redis & Rate Limiting

Set `REDIS_URL` to your Redis instance for caching and API throttling. Adjust
`RATE_LIMIT_WINDOW` (seconds) and `RATE_LIMIT_MAX_REQUESTS` to tune limits.

## 8. Post-Deployment Verification

- Sign up and log in.
- Purchase a product in Stripe test mode and verify download links and confirmation email.
- Test the AI estimator and Copilot features.
- Log in with an admin account to access `/admin` and verify dashboards.

## 9. Monitoring & Maintenance

If a Sentry DSN is provided, errors will be sent to Sentry. Scheduled cron jobs handle cleanup and reminder emails automatically.
