#!/bin/bash

echo "🚀 MyRoofGenius Development Setup"
echo "================================="

NODE_VERSION_REQUIRED=18
NODE_VERSION=$(node -v | cut -d'.' -f1 | tr -d 'v')

if [ "$NODE_VERSION" -ne "$NODE_VERSION_REQUIRED" ]; then
  echo "Node.js $NODE_VERSION_REQUIRED.x required. Found $(node -v)." >&2
  exit 1
fi

echo "Installing dependencies..."
npm ci || exit 1

echo "Installing Playwright browsers..."
npm run playwright:install || exit 1

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "Created .env.local - update it with your values." 
fi

echo "Running type check and lint..."
npm run type-check
npm run lint

echo "Setup complete!"
