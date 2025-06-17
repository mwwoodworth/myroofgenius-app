#!/usr/bin/env bash
set -euo pipefail

echo "Installing Codex CLI globally..."
npm install -g @openai/codex-cli

echo "Running initial Codex generation..."
codex generate --all

echo "Done! Commit the generated code and open a PR."
