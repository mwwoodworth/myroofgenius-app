# myroofgenius-app
Public SaaS React + FastAPI system for MyRoofGenius.

## 20 Jun 2025 Updates

- Added `SUPABASE_SERVICE_ROLE_KEY` to environment configuration.
- Completed end‑to‑end integration tests (Stripe, Make.com, ClickUp, Google Drive).
- Updated Dockerfile for optimized production build.

## Architecture (Codex-Ready)

- **Frontend:** Next.js 14 App Router (`/app`) with Tailwind, Framer Motion, and @vercel/ai.
- **Design System:** RoofOS components in `/components` and `/theme`.
 - **Backend:** FastAPI service in `/python_backend`.
- **CI:** Node (lint/test/build) & Python workflows in `.github/workflows`.
- **Env:** `.env.example` lists Supabase, Stripe, Sentry, and OpenAI keys.
- **Command Palette:** Press `Cmd+K` anywhere in the app to open quick actions.

### Command Palette

Press `Cmd+K` (or `Ctrl+K` on Windows) to open a small command window. Use it to
quickly jump to common pages like creating a new estimate or opening the
dashboard. The palette is powered by [cmdk](https://github.com/pacocoursey/cmdk).


### Backend (FastAPI)
 The backend lives in `python_backend/main.py`.
Run it locally with Uvicorn:
```bash
 pip install -r python_backend/requirements.txt
 uvicorn main:app --app-dir python_backend --reload
```
The backend dependencies include `stripe` for payments and `httpx` for outbound HTTP calls.

### Running Tests

Frontend tests use Jest:
```bash
npm test
```

Backend tests are written with `pytest`:
```bash
 pip install -r python_backend/requirements.txt
pytest
```

Continuous integration runs these commands using the Node and Python workflows under `.github/workflows` whenever you push or open a pull request.

### Linting

ESLint is configured for Next.js with TypeScript and Prettier. Run:
```bash
npm run lint
```


## Deployment

1. Create a project on **Vercel** and link this repository.
2. Add the variables from `.env.example` as Vercel environment variables. Each is explained in [docs/vercel-env.md](docs/vercel-env.md).
3. Deploying the `main` branch will build the Next.js frontend and the Python backend. The `vercel.json` file rewrites any request matching `/api/*` to the appropriate backend function.
4. Subsequent pushes to `main` automatically trigger new Vercel deployments.

### Docker

Build and run the production container locally:

```bash
docker build -t myroofgenius-app .
docker run -p 8000:8000 myroofgenius-app
```

The container uses a multi-stage build. The first stage installs Node
dependencies and compiles the Next.js frontend, while the final stage installs
the Python requirements and launches Uvicorn with the built assets included.

### Deprecated Bootstrap Script
The helper script `scripts/bootstrap_codex.sh` previously bootstrapped the
Codex CLI. The CLI has been removed, so this script does nothing and is kept
only for historical reference. Feel free to delete it locally.

## Additional Documentation
- [Changelog](CHANGELOG.md)
- [Wow Features](docs/wow-features.md)
