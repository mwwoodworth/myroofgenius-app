# Wow Features

This one‑pager highlights the innovations that make **MyRoofGenius** stand out.

## Command Palette
Hit **Cmd/Ctrl&nbsp;+&nbsp;K** anywhere in the app to open a lightning‑fast command palette. It provides fuzzy search for pages and actions so power users can jump around without leaving the keyboard.

## 3D Roof Preview
A mini Three.js scene showcases a **3D roof model** using React Three Fiber. It hints at future damage detection tools and gives customers a wow factor when demoing the product.

## Integrations
- **Supabase** handles authentication and storage.
- **Stripe** powers secure checkout and webhooks for order processing.
- **ConvertKit** manages email sign‑ups and marketing flows.

## Animations
The UI uses **Framer Motion** for smooth transitions. Even the dark mode toggle animates for a polished feel.

## Onboarding Steps
1. Clone the repository and install dependencies with `npm install` and `pip install -r python_backend/requirements.txt`.
2. Copy `.env.example` to `.env` and fill in API keys as described in [docs/vercel-env.md](vercel-env.md).
3. Run `npm run dev` and `uvicorn backend.main:app --reload` to start the frontend and backend locally.
