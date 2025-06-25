#!/usr/bin/env bash
set -euo pipefail

npm run build

git push origin main

if [ -n "${VERCEL_TOKEN:-}" ]; then
  npx vercel deploy --prebuilt --prod --token "$VERCEL_TOKEN"
else
  echo "VERCEL_TOKEN not set; skipping vercel deploy" >&2
fi
