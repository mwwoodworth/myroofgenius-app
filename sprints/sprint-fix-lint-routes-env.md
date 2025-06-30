# Sprint: Fix Linting, Routes, and Add .env.example

**ID:** SPRINT-002  
**Priority:** High  
**State:** To Do

## 1. Executive Summary

Three operational blockers compromise developer efficiency and site functionality. Conflicting ESLint configurations create inconsistent code standards. Legacy redirects prevent access to `/tools` and `/marketplace` pages. Missing environment variable documentation causes setup failures. This sprint consolidates all linting rules, removes blocking redirects, and creates a comprehensive `.env.example` template—eliminating friction points that waste developer time and block feature access.

## 2. Acceptance Criteria

- [ ] Only one ESLint config file, `.eslintrc.js`, exists with all rules consolidated
- [ ] No `.eslintrc.json` present in the repository
- [ ] The `/tools` and `/marketplace` routes are accessible on the live site
- [ ] The repo root contains a `.env.example` with all required environment variable keys
- [ ] `npm run lint` executes without configuration errors
- [ ] New developers can copy `.env.example` to `.env.local` and understand all required variables

## 3. Step-by-Step Implementation Guide

### File: .eslintrc.js

Replace the entire contents of `.eslintrc.js` with this consolidated configuration:

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true
    }],
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // React rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/no-unescaped-entities': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Next.js specific
    '@next/next/no-html-link-for-pages': 'off',
    
    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'smart'],
    'no-trailing-spaces': 'error',
    'comma-dangle': ['error', 'only-multiline'],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never']
  },
  overrides: [
    {
      files: ['*.js', '*.mjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    },
    {
      files: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx', 'playwright.config.ts'],
      env: {
        jest: true,
        node: true
      },
      rules: {
        'no-console': 'off'
      }
    },
    {
      files: ['app/api/**/*.ts'],
      rules: {
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }]
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'public/',
    '*.config.js',
    'coverage/',
    'playwright-report/',
    'test-results/'
  ]
};
```

### File: .eslintrc.json

Delete this file completely using:
```bash
rm .eslintrc.json
```

### File: next.config.js

Replace the entire contents of `next.config.js` with this configuration (redirects removed):

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      'myroofgenius.com',
      'images.unsplash.com',
      'avatars.githubusercontent.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

### File: .env.example

Create this new file in the repository root with the following contents:

```bash
# ====================================
# CORE CONFIGURATION
# ====================================

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ====================================
# DATABASE - SUPABASE
# ====================================

# Required: Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Required: Supabase anonymous key (safe for browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Required: Supabase service role key (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ====================================
# AUTHENTICATION
# ====================================

# Supabase Auth redirect URL
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback

# JWT secret for additional token operations (optional)
JWT_SECRET=your-jwt-secret-here

# ====================================
# PAYMENTS - STRIPE
# ====================================

# Required: Stripe publishable key (safe for browser)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Required: Stripe secret key (server-side only)
STRIPE_SECRET_KEY=sk_test_...

# Required: Stripe webhook secret for endpoint verification
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs for subscription tiers
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# ====================================
# AI - ANTHROPIC CLAUDE API
# ====================================

# Required: Anthropic API key for Claude integration
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional: Model selection
ANTHROPIC_MODEL=claude-3-opus-20240229

# ====================================
# EMAIL SERVICE - RESEND
# ====================================

# Required: Resend API key for transactional emails
RESEND_API_KEY=re_...

# Required: Default from email address
EMAIL_FROM=MyRoofGenius <noreply@myroofgenius.com>

# Optional: Admin notification email
ADMIN_EMAIL=admin@myroofgenius.com

# ====================================
# ANALYTICS & MONITORING
# ====================================

# Google Analytics (optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-...

# PostHog Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry Error Tracking (optional)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...

# ====================================
# FEATURE FLAGS
# ====================================

# Enable/disable features
NEXT_PUBLIC_ENABLE_STRIPE_TEST_MODE=true
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_MAINTENANCE_MODE=false

# ====================================
# TESTING - PLAYWRIGHT E2E
# ====================================

# Base URL for Playwright tests
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000

# Test user credentials (create these in Supabase Auth)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password-123

# Test Stripe credentials (optional)
TEST_STRIPE_CARD_NUMBER=4242424242424242

# ====================================
# DEVELOPMENT TOOLS
# ====================================

# Bundle analyzer (set to true to analyze bundle size)
ANALYZE=false

# Debug flags
DEBUG_PAYMENTS=false
DEBUG_AUTH=false
DEBUG_DATABASE=false

# ====================================
# EXTERNAL INTEGRATIONS (OPTIONAL)
# ====================================

# Slack notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Discord notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# OpenAI API (if using GPT models)
OPENAI_API_KEY=sk-...

# ====================================
# NOTES FOR DEVELOPERS
# ====================================

# 1. Copy this file to .env.local for local development
# 2. Never commit .env.local to version control
# 3. All NEXT_PUBLIC_* variables are exposed to the browser
# 4. Keep sensitive keys (without NEXT_PUBLIC_) server-side only
# 5. Update this file when adding new environment variables
# 6. Use strong, unique values for all secrets in production
```

## 4. Test Instructions

### Step 1: Clean Installation
```bash
# Remove existing node modules and lock file
rm -rf node_modules package-lock.json

# Remove the old ESLint JSON config
rm .eslintrc.json

# Fresh install
npm install
```

### Step 2: Validate ESLint Configuration
```bash
# Run linting - should complete without configuration errors
npm run lint

# If there are fixable issues, auto-fix them
npm run lint -- --fix

# Verify no config conflicts in output
```

### Step 3: Test Route Accessibility
```bash
# Start the development server
npm run dev

# In your browser, navigate to:
# http://localhost:3000/tools
# http://localhost:3000/marketplace

# Both routes should load without any redirects
# Check browser DevTools Network tab to confirm no 301/302 responses
```

### Step 4: Environment Setup Validation
```bash
# Copy the example file
cp .env.example .env.local

# Open .env.local and fill in your actual values
# Verify the app starts without missing environment variable errors
npm run dev
```

### Step 5: Run Full Test Suite
```bash
# TypeScript compilation check
npm run type-check

# Run any existing tests
npm test

# If Playwright is configured
npm run test:e2e
```

## 5. Post-Merge & Deploy Validation

- [ ] GitHub Actions CI runs `npm run lint` without errors
- [ ] TypeScript compilation passes in CI
- [ ] Vercel preview deployment shows no build warnings about ESLint
- [ ] Preview URLs for `/tools` and `/marketplace` load correctly
- [ ] Production deployment maintains route accessibility
- [ ] `.env.example` is visible in GitHub repository root
- [ ] No console errors about missing environment variables in production logs

### Monitoring Commands
```bash
# Check production routes
curl -I https://myroofgenius.com/tools
curl -I https://myroofgenius.com/marketplace
# Both should return 200 OK, not 301/302

# Verify linting in CI logs
# Look for "ESLint found 0 problems"
```

## 6. References

- [ESLint Configuration Documentation](https://eslint.org/docs/latest/use/configure/)
- [Next.js App Router Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Stripe Environment Setup](https://stripe.com/docs/keys)
- [Anthropic API Authentication](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)

---

**Sprint Status:** Ready for Implementation  
**Estimated Time:** 30 minutes  
**Risk Level:** Low (configuration changes only)