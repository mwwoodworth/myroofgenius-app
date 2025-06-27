#!/bin/bash
set -e

echo "🧹 Starting repository cleanup..."

find . -name "*.tmp" -delete
find . -name "*.log" -delete
find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete

echo "Cleaning nested node_modules..."
find . -name "node_modules" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true

echo "Removing empty directories..."
find . -type d -empty -delete

cat > .gitignore <<'GIT'
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/
.nyc_output/

# Production
build/
dist/

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db

# Build stats
build-stats.html
GIT

echo "✅ Repository cleanup complete!"
