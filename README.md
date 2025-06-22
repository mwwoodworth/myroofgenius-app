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


### Backend (FastAPI)
The backend lives in `python-backend/main.py`.
Run it locally with Uvicorn:
```bash
pip install -r python-backend/requirements.txt
uvicorn main:app --app-dir python-backend --reload
```
The backend dependencies include `stripe` for payments and `httpx` for outbound HTTP calls.

### Running Tests

Frontend tests use Jest:
```bash
npm test
```

Backend tests are written with `pytest`:
```bash
pip install -r python-backend/requirements.txt
pytest
```

Continuous integration runs these commands using the Node and Python workflows under `.github/workflows` whenever you push or open a pull request.

## Deployment

1. Create a project on **Vercel** and link this repository.
2. Add the variables from `.env.example` as Vercel environment variables. Each is explained in [docs/vercel-env.md](docs/vercel-env.md).
3. Deploying the `main` branch will build the Next.js frontend and the Python backend. The `vercel.json` file rewrites any request matching `/api/*` to the appropriate backend function.
4. Subsequent pushes to `main` automatically trigger new Vercel deployments.

## Docker

Build the container:
```bash
docker build -t myroofgenius-app .
```
Run it locally:
```bash
docker run -p 3000:3000 -p 8000:8000 myroofgenius-app
```
The Next.js frontend will be available at `http://localhost:3000` while the FastAPI backend listens on `http://localhost:8000`.
