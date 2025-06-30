# Sprint: Fix CI/CD Pipeline

**ID:** SPRINT-001  
**Priority:** Blocking  
**State:** To Do

## 1. Executive Summary

This sprint consolidates fragmented CI/CD workflows into a single, reliable pipeline that gates production deployments behind comprehensive quality checks. The fix addresses Playwright browser installation failures and ensures all code changes are tested, linted, and built before deployment.

## 2. Acceptance Criteria

- [ ] Single `.github/workflows/ci.yml` workflow executes all quality checks
- [ ] Playwright browsers install correctly with `npx playwright install --with-deps`
- [ ] Redundant workflow files (`test.yml`, `main.yml`) are removed
- [ ] Deploy workflow triggers only after successful CI completion
- [ ] All environment variables are properly configured

## 3. Step-by-Step Implementation Guide

### File: .github/workflows/ci.yml

**Action:** Create this new file with the following content:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [20.x]
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type checking
        run: npm run typecheck
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run unit tests
        run: npm run test:unit
        if: success()
      
      - name: Run E2E tests
        run: npm run test:e2e
        if: success()
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: |
            test-results/
            playwright-report/
          retention-days: 7
```

### File: .github/workflows/test.yml

**Action:** Delete this file entirely

### File: .github/workflows/main.yml

**Action:** Delete this file entirely

### File: .github/workflows/deploy.yml

**Action:** Replace the entire file content with:

```yaml
name: Deploy to Production

on:
  workflow_run:
    workflows: ["CI"]
    types:
      - completed
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### GitHub Repository Secrets Configuration

Ensure these secrets exist in Settings → Secrets and variables → Actions:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ANTHROPIC_API_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

## 4. Test Instructions

### Pre-Implementation Testing
1. Create a feature branch: `git checkout -b fix/cicd-pipeline`
2. Implement all file changes above
3. Commit with message: `fix: consolidate CI/CD pipeline and fix Playwright browsers`
4. Push branch and create PR

### Workflow Validation
1. **Check GitHub Actions tab:**
   - Only "CI" workflow should appear (no test.yml or main.yml runs)
   - CI workflow should show all steps executing in sequence
   - Look for green checkmarks on each step

2. **Verify Playwright Installation:**
   - Check "Install Playwright browsers" step output
   - Should see successful browser downloads
   - No "browser not found" errors in E2E test step

3. **Confirm Deployment Gating:**
   - After PR merge, check Actions tab
   - "Deploy to Production" should only trigger after "CI" completes successfully
   - If CI fails, deployment should not run

## 5. Post-Merge & Deploy Validation

- [ ] CI workflow badge shows passing on main branch
- [ ] No duplicate workflow runs in Actions history
- [ ] E2E tests complete without browser errors
- [ ] Production deployment reflects latest main branch code
- [ ] Test artifacts available for download on any failures

## 6. References

- **Playwright CI Guide:** https://playwright.dev/docs/ci#github-actions
- **GitHub Actions Workflow Syntax:** https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
- **Vercel GitHub Action:** https://github.com/amondnet/vercel-action

## 7. Troubleshooting Guide

### If Playwright browsers fail to install:
- Ensure Ubuntu runner has sufficient permissions
- Check for proxy/firewall issues in GitHub Actions logs
- Verify `--with-deps` flag is present

### If deployment doesn't trigger:
- Confirm workflow names match exactly ("CI" in deploy.yml)
- Check workflow_run event configuration
- Verify branch protection rules aren't blocking

### If environment variables cause build failures:
- Double-check secret names match exactly (case-sensitive)
- Ensure all secrets are set at repository level, not environment level
- Verify Vercel project has matching environment variables

---

**Sprint Status:** Ready for Implementation  
**Estimated Time:** 30 minutes  
**Risk Level:** Low (reversible changes)