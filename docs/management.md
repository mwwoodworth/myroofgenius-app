# Managing & Updating MyRoofGenius

## Adding / Editing Products
1. Log into Supabase → `products` table.
2. Insert or update rows with:
   * `name`, `description`, `price_id`, `price`, `created_at`.
3. Upload digital files to Supabase Storage (bucket `products`) and store the public URL in the `description` or a future `file_url` column.

## Managing Blog Posts
1. Supabase → `blog_posts` table.
2. Each post needs `slug`, `title`, `content` (HTML/Markdown), `published_at`.
3. Edits deploy instantly; purge Vercel cache if needed.

## Copy / Image Changes
* Most images live in `/public` or Supabase Storage.
* Update React components or Storage links, commit to `main`, Vercel auto‑deploys.

## Users & Orders
* **Supabase Auth** → manage users.
* **Stripe Dashboard** → refunds, receipts, payouts.
* **Supabase `orders`** table stores order records from Stripe webhook.

## Deploying Updates
1. Commit code to `main` → Vercel auto‑deploy.
2. For environment variable changes, update Vercel Project Settings → redeploy.

## Troubleshooting
| Issue | Fix |
|-------|-----|
| 502 / 404 on domain | Check Vercel deployment logs & DNS records |
| Stripe payments failing | Verify `STRIPE_SECRET_KEY` & webhook secret |
| Auth issues | Confirm Supabase URL & anon key env vars |

---
Last updated: 2025-06-22
