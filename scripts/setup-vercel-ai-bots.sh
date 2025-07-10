#!/usr/bin/env bash
set -euo pipefail

TEMPLATE_DIR=${TEMPLATE_DIR:-vercel-ai-bots}
mkdir -p "$TEMPLATE_DIR"
cd "$TEMPLATE_DIR"

repos=(
  "vercel/ai-chatbot"
  "vercel/ai-sdk-rag-starter"
  "vercel/build-error-summarizer"
  "vercel/ai-changelog-generator"
  "vercel/ai-pr-reviewer"
)

for repo in "${repos[@]}"; do
  name=$(basename "$repo")
  if [ -d "$name" ]; then
    echo "$name already cloned"
  else
    git clone "https://github.com/$repo.git" "$name"
  fi
  if [ -f "$name/package.json" ]; then
    (cd "$name" && npm install)
  fi
  if [ -f "$name/.env.example" ] && [ ! -f "$name/.env.local" ]; then
    cp "$name/.env.example" "$name/.env.local"
  fi
done

cd - >/dev/null

echo "Templates ready in $TEMPLATE_DIR"
