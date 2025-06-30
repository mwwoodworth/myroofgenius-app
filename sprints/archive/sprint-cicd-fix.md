# Sprint 1: Fix and Consolidate CI/CD Workflows

## Why This Matters

Your CI/CD pipeline is your safety net. Right now, it's torn. Without working automated tests and deployment checks, you're shipping blind—risking production bugs that could have been caught. A consolidated, bulletproof CI/CD workflow protects your code quality and gives you confidence to deploy without holding your breath.

This sprint fixes broken YAML syntax, removes redundancy, and ensures Playwright tests actually run with browsers installed.

## What This Protects

- **Prevents broken deployments** from reaching production
- **Catches bugs early** through automated testing on every push
- **Saves developer time** by eliminating manual test runs
- **Protects team velocity** by catching issues before merge

## Implementation Steps

### Step 1: Remove Redundant Workflow

Delete the redundant CI workflow file:
```bash
rm .github/workflows/ci-node.yml
```

### Step 2: Create Consolidated CI Workflow

Replace `.github/workflows/ci.yml` with this production-ready configuration:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18.x'
  NEXT_PUBLIC_SITE_URL: ${{ secrets.NEXT_PUBLIC_SITE_URL || 'https://myroofgenius.com' }}

jobs:
  lint-and-type-check:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run ESLint
        run: npm run lint
        
      - name: Run TypeScript check
        run: npm run type-check

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit
        env:
          CI: true

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SITE_URL: ${{ env.NEXT_PUBLIC_SITE_URL }}
          
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true
          PLAYWRIGHT_TEST_BASE_URL: http://localhost:3000
          
      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: test-results/
          retention-days: 7

  build:
    name: Build Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SITE_URL: ${{ env.NEXT_PUBLIC_SITE_URL }}
          
      - name: Check build output
        run: |
          if [ ! -d ".next" ]; then
            echo "Build failed: .next directory not found"
            exit 1
          fi
```

### Step 3: Update Deploy Workflow

Replace `.github/workflows/deploy.yml` with this secure deployment configuration:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  NODE_VERSION: '18.x'
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    name: Test Before Deploy
    uses: ./.github/workflows/ci.yml
    
  deploy-production:
    name: Deploy to Production
    needs: test
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install Vercel CLI
        run: npm install -g vercel@latest
        
      - name: Pull Vercel environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Build project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Deploy to Vercel
        id: deploy
        run: |
          DEPLOYMENT_URL=$(vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }})
          echo "deployment-url=$DEPLOYMENT_URL" >> $GITHUB_OUTPUT
          
      - name: Comment deployment URL
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Deployed to production: ${{ steps.deploy.outputs.deployment-url }}'
            })
```

### Step 4: Remove Deprecated Bootstrap Script

If `bootstrap_codex.sh` exists and is no longer needed:
```bash
rm bootstrap_codex.sh
```

### Step 5: Add Required Package.json Scripts

Ensure your `package.json` has these test scripts:

```json
{
  "scripts": {
    "test:unit": "jest",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx"
  }
}
```

## Test & Validation Steps

1. **Validate YAML syntax locally:**
   ```bash
   # Install yamllint if needed
   npm install -g yaml-lint
   yamllint .github/workflows/ci.yml
   yamllint .github/workflows/deploy.yml
   ```

2. **Test Playwright installation:**
   ```bash
   npx playwright install --with-deps
   npm run test:e2e
   ```

3. **Verify all scripts exist:**
   ```bash
   npm run lint
   npm run type-check
   npm run test:unit
   npm run test:e2e
   npm run build
   ```

4. **Push to a feature branch to test workflows:**
   ```bash
   git checkout -b fix/cicd-workflows
   git add .
   git commit -m "fix: consolidate and repair CI/CD workflows"
   git push origin fix/cicd-workflows
   ```

## What to Watch For

- **Missing secrets:** Ensure these are set in GitHub repo settings:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `NEXT_PUBLIC_SITE_URL` (optional)

- **Playwright failures:** If tests fail, check the uploaded artifacts for screenshots

- **Build memory issues:** If builds fail with heap errors, add to build step:
  ```yaml
  env:
    NODE_OPTIONS: "--max-old-space-size=4096"
  ```

## Success Criteria Checklist

- [ ] YAML files pass syntax validation
- [ ] CI workflow runs on push/PR without errors
- [ ] Playwright browsers install successfully
- [ ] All test suites pass (lint, type-check, unit, e2e)
- [ ] Deploy workflow triggers only on main branch
- [ ] Redundant ci-node.yml is removed
- [ ] bootstrap_codex.sh removed if deprecated

## Commit Message

```
fix: consolidate and repair CI/CD workflows

- Remove redundant ci-node.yml workflow
- Fix YAML syntax errors in CI and deploy workflows  
- Add Playwright browser installation step
- Configure proper environment variables
- Add test artifact uploads for debugging
- Remove deprecated bootstrap script
- Ensure all required npm scripts are defined

This creates a bulletproof CI/CD pipeline that catches issues
before they reach production.
```