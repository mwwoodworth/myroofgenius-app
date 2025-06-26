# myroofgenius-app



✅ v1.0.0: AI Estimator, Marketplace, Admin, Checkout, Copilot all production-ready


![CI](https://img.shields.io/github/actions/workflow/status/mwwoodworth/myroofgenius-app/ci.yml?branch=main)&nbsp;![Migrations](https://img.shields.io/github/actions/workflow/status/mwwoodworth/myroofgenius-app/migrate.yml?branch=main)&nbsp;![Deploy](https://img.shields.io/github/actions/workflow/status/mwwoodworth/myroofgenius-app/deploy.yml?branch=main)&nbsp;![Maintenance](https://img.shields.io/github/actions/workflow/status/mwwoodworth/myroofgenius-app/maintenance.yml?branch=main)

Public SaaS React + FastAPI system for MyRoofGenius.

## Development

Install dependencies and run the type checker:

```bash
npm install
npm run type-check
```

Run unit and end-to-end tests:

```bash
npm test
npm run test:e2e
```

## 20 Jun 2025 Updates

- Added `SUPABASE_SERVICE_ROLE_KEY` to environment configuration.
- Completed end‑to‑end integration tests (Stripe, Make.com, ClickUp, Google Drive).
- Updated Dockerfile for optimized production build.

## 26 Jun 2025 Updates

- Added universal `/api/copilot` endpoint and basic Copilot UI integration.
- Introduced feature flags `AI_COPILOT_ENABLED`, `AR_MODE_ENABLED`, and `MAINTENANCE_MODE`.
  See `docs/feature-flags.md` for toggling instructions.
- `/api/copilot` now streams responses, stores chat history in Supabase and
  supports voice input and quick actions.
- Initial AR scaffolding with 3D canvas and database table `ar_models`.
- Added `REDIS_URL`, `RATE_LIMIT_WINDOW`, and `RATE_LIMIT_MAX_REQUESTS` environment variables for caching and throttling.

## 28 Jun 2025 Updates

- Added AI Tools page with links to Claude-powered dashboards and forms.

## 1 Jul 2025 Updates

- Added Field Apps page exposing smart inspection, proposal, and punchlist utilities.
