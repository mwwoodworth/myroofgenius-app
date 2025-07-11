#!/usr/bin/env bash
set -euo pipefail
if ! ls tests/visual/*.ts* 1> /dev/null 2>&1; then
  echo "No visual tests found"
  exit 0
fi
CI=true WAIT_ON_TIMEOUT=60000 start-server-and-test dev http://localhost:3000 "playwright test tests/visual"
