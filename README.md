# myroofgenius-app
Public SaaS React + FastAPI system for MyRoofGenius.

## 20 Jun 2025 Updates

- Added `SUPABASE_SERVICE_ROLE_KEY` to environment configuration.
- Completed end‑to‑end integration tests (Stripe, Make.com, ClickUp, Google Drive).
- Updated Dockerfile for optimized production build.

## Architecture (Codex-Ready)

- **Frontend:** Next.js 14 App Router (`/app`) with Tailwind, Framer Motion, and @vercel/ai.
- **Design System:** RoofOS components in `/components` and `/theme`.
- **Backend:** FastAPI service in `/python-backend`.
- **CI:** Node (lint/test/build) & Python workflows in `.github/workflows`.
- **Env:** `.env.example` lists Supabase, Stripe, Sentry, and OpenAI keys.

