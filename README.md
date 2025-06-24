# myroofgenius-app
Public SaaS React + FastAPI system for MyRoofGenius.

## Local Development

### Environment Variables
Copy `.env.example` to `.env` and fill in the required secrets
(Stripe, Make.com, ClickUp, Supabase). These same variables should be added in
Vercel or Render when deploying.

### Deployment

#### Vercel
1. Import the repo into Vercel.
2. Add environment variables from `.env.example` in **Project Settings → Environment Variables**.
3. Push to `main` to trigger a deployment or run `vercel --prod`.

#### Render
1. Create a **Web Service** for the FastAPI backend:
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`
2. Create a **Static Site** for the Next.js frontend:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `out` or `build`
3. Provide the same environment variables for both services.

### Content Updates
- Edit marketing pages under `content/` and commit changes.
- Blog posts and product data live in Supabase tables; see [docs/management.md](docs/management.md).
