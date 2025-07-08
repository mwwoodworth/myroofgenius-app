# Architecture Overview

This document captures key components and infrastructure for MyRoofGenius.

## SEO Endpoints
The backend exposes dynamic SEO routes via FastAPI:

- **GET `/sitemap.xml`** – Generates a sitemap including active product pages from Supabase.
- **GET `/robots.txt`** – Points crawlers to the sitemap and disallows nothing.

Both routes rely on `NEXT_PUBLIC_SITE_URL` for the base domain. They fall back to `https://myroofgenius.com` when not set.
