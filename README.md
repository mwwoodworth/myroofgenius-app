# myroofgenius-app
Public SaaS React + FastAPI system for MyRoofGenius.

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
