# Sprint 06: Implement Environment Variables Validation System

## Objective
Create a comprehensive environment validation system that prevents deployment failures by verifying all required configuration is present, with clear error messages and fallback strategies.

## Critical Context for Codex
- **Current Issue**: Missing environment variables cause runtime crashes or silent feature failures
- **Risk**: Production deployments with incomplete configuration lead to poor user experience
- **Solution**: Build-time validation with clear error reporting and runtime fallback handling

## Implementation Tasks

### Task 1: Create Comprehensive Environment Schema
Create file: `app/lib/env-schema.ts`

```typescript
import { z } from 'zod'

// Define environment variable schema with validation rules
export const envSchema = z.object({
  // Database
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL format'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key required'),

  // Authentication & Security
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL').optional(),

  // Payment Processing
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Stripe secret key format'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'Invalid Stripe webhook secret format'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'Invalid Stripe publishable key format'),

  // AI Providers (at least one required)
  OPENAI_API_KEY: z.string().startsWith('sk-', 'Invalid OpenAI API key format').optional(),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-', 'Invalid Anthropic API key format').optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),

  // Email Service
  RESEND_API_KEY: z.string().startsWith('re_', 'Invalid Resend API key format'),
  RESEND_FROM_EMAIL: z.string().email('Invalid from email address').default('orders@myroofgenius.com'),

  // Mapping & Geolocation
  MAPBOX_TOKEN: z.string().startsWith('pk.', 'Invalid Mapbox token format').optional(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().startsWith('pk.', 'Invalid Mapbox public token format').optional(),

  // External Integrations
  MAKE_WEBHOOK_URL: z.string().url('Invalid Make webhook URL').optional(),
  SLACK_WEBHOOK_URL: z.string().url('Invalid Slack webhook URL').optional(),

  // Application URLs
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid app URL format'),
  API_BASE_URL: z.string().url('Invalid API base URL').optional(),

  // Feature Flags
  NEXT_PUBLIC_AI_COPILOT_ENABLED: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_AR_MODE_ENABLED: z.enum(['true', 'false']).transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_MARKETPLACE_ENABLED: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),
  SALES_ENABLED: z.enum(['true', 'false']).transform(val => val === 'true').default('true'),

  // Monitoring & Analytics
  NEXT_PUBLIC_SENTRY_DSN: z.string().url('Invalid Sentry DSN').optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().startsWith('G-', 'Invalid GA4 measurement ID').optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url('Invalid PostHog host URL').optional(),

  // Development & Testing
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  CI: z.enum(['true', 'false']).transform(val => val === 'true').optional(),

  // Cron & Background Jobs
  CRON_SECRET: z.string().min(16, 'Cron secret must be at least 16 characters').optional(),
})

// Separate runtime schema (excludes build-only vars)
export const runtimeEnvSchema = envSchema.omit({
  SUPABASE_SERVICE_ROLE_KEY: true,
  STRIPE_SECRET_KEY: true,
  STRIPE_WEBHOOK_SECRET: true,
  OPENAI_API_KEY: true,
  ANTHROPIC_API_KEY: true,
  GOOGLE_GENERATIVE_AI_API_KEY: true,
  RESEND_API_KEY: true,
  CRON_SECRET: true,
  NEXTAUTH_SECRET: true,
})

// Type definitions
export type Env = z.infer<typeof envSchema>
export type RuntimeEnv = z.infer<typeof runtimeEnvSchema>

// Validation groups for specific features
export const featureRequirements = {
  payments: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
  ai: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY'], // at least one
  email: ['RESEND_API_KEY'],
  maps: ['MAPBOX_TOKEN', 'NEXT_PUBLIC_MAPBOX_TOKEN'],
  monitoring: ['NEXT_PUBLIC_SENTRY_DSN'],
  analytics: ['NEXT_PUBLIC_GA_MEASUREMENT_ID', 'NEXT_PUBLIC_POSTHOG_KEY'],
} as const
```

### Task 2: Create Environment Validation Script
Create file: `scripts/validate-env.ts`

```typescript
#!/usr/bin/env node
import { config } from 'dotenv'
import { resolve } from 'path'
import { envSchema, featureRequirements } from '../app/lib/env-schema'
import chalk from 'chalk'

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local'
config({ path: resolve(process.cwd(), envFile) })

interface ValidationResult {
  success: boolean
  errors: string[]
  warnings: string[]
  features: {
    [key: string]: {
      enabled: boolean
      missing?: string[]
    }
  }
}

function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
    features: {}
  }

  try {
    // Parse and validate all environment variables
    const env = envSchema.parse(process.env)

    // Check AI providers (at least one required)
    const hasAIProvider = !!(env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY)
    if (!hasAIProvider) {
      result.errors.push('At least one AI provider API key is required (OpenAI, Anthropic, or Google)')
      result.success = false
    }

    // Validate feature-specific requirements
    for (const [feature, requirements] of Object.entries(featureRequirements)) {
      const missing = requirements.filter(key => {
        if (feature === 'ai') {
          // Special handling for AI - at least one is required
          return !hasAIProvider
        }
        return !process.env[key]
      })

      result.features[feature] = {
        enabled: missing.length === 0,
        missing: missing.length > 0 ? missing : undefined
      }

      if (missing.length > 0 && feature !== 'ai') {
        result.warnings.push(`${feature} feature: Missing ${missing.join(', ')}`)
      }
    }

    // Production-specific checks
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
      // Ensure production URL is set correctly
      if (!env.NEXT_PUBLIC_APP_URL.startsWith('https://')) {
        result.errors.push('NEXT_PUBLIC_APP_URL must use HTTPS in production')
        result.success = false
      }

      // Warn about missing monitoring
      if (!env.NEXT_PUBLIC_SENTRY_DSN) {
        result.warnings.push('Sentry DSN not configured - error monitoring disabled')
      }

      // Ensure webhook secrets are production values
      if (env.STRIPE_WEBHOOK_SECRET.includes('test')) {
        result.warnings.push('Stripe webhook secret appears to be a test value')
      }
    }

  } catch (error) {
    if (error instanceof Error) {
      const zodError = error as any
      if (zodError.errors) {
        zodError.errors.forEach((err: any) => {
          const path = err.path.join('.')
          result.errors.push(`${path}: ${err.message}`)
        })
      } else {
        result.errors.push(error.message)
      }
    }
    result.success = false
  }

  return result
}

// Run validation and output results
function main() {
  console.log(chalk.blue('\n🔍 Validating Environment Variables...\n'))

  const result = validateEnvironment()

  // Display errors
  if (result.errors.length > 0) {
    console.log(chalk.red('❌ Errors (must fix):'))
    result.errors.forEach(error => {
      console.log(chalk.red(`   • ${error}`))
    })
    console.log()
  }

  // Display warnings  
  if (result.warnings.length > 0) {
    console.log(chalk.yellow('⚠️  Warnings (recommended to fix):'))
    result.warnings.forEach(warning => {
      console.log(chalk.yellow(`   • ${warning}`))
    })
    console.log()
  }

  // Display feature status
  console.log(chalk.blue('📦 Feature Status:'))
  Object.entries(result.features).forEach(([feature, status]) => {
    const icon = status.enabled ? '✅' : '❌'
    const color = status.enabled ? chalk.green : chalk.red
    console.log(color(`   ${icon} ${feature}`))
    if (status.missing) {
      status.missing.forEach(key => {
        console.log(chalk.gray(`      - Missing: ${key}`))
      })
    }
  })

  console.log()

  // Final result
  if (result.success) {
    console.log(chalk.green('✅ Environment validation passed!\n'))
    process.exit(0)
  } else {
    console.log(chalk.red('❌ Environment validation failed!\n'))
    console.log(chalk.gray('Fix the errors above and run validation again.\n'))
    process.exit(1)
  }
}

// Execute if run directly
if (require.main === module) {
  main()
}

export { validateEnvironment }
```

### Task 3: Create Runtime Environment Wrapper
Create file: `app/lib/env.ts`

```typescript
import { envSchema, type Env } from './env-schema'

// Cached environment variables
let cachedEnv: Env | null = null

/**
 * Get validated environment variables with runtime safety
 */
export function getEnv(): Env {
  if (cachedEnv) return cachedEnv

  try {
    cachedEnv = envSchema.parse(process.env)
    return cachedEnv
  } catch (error) {
    console.error('Invalid environment configuration:', error)
    
    // In development, throw to catch issues early
    if (process.env.NODE_ENV === 'development') {
      throw new Error('Environment validation failed. Check your .env.local file.')
    }
    
    // In production, return safe defaults to prevent crashes
    console.error('Using fallback configuration - some features may be disabled')
    return createFallbackEnv()
  }
}

/**
 * Safe getter for individual environment variables
 */
export function getEnvVar<K extends keyof Env>(key: K): Env[K] | undefined {
  try {
    const env = getEnv()
    return env[key]
  } catch {
    return undefined
  }
}

/**
 * Check if a specific feature has all required environment variables
 */
export function isFeatureEnabled(feature: 'payments' | 'ai' | 'email' | 'maps'): boolean {
  const env = getEnv()
  
  switch (feature) {
    case 'payments':
      return !!(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET)
    case 'ai':
      return !!(env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY)
    case 'email':
      return !!env.RESEND_API_KEY
    case 'maps':
      return !!env.MAPBOX_TOKEN
    default:
      return false
  }
}

/**
 * Create fallback environment for production resilience
 */
function createFallbackEnv(): Env {
  return {
    // Required database config - app won't work without these
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    
    // Auth
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    
    // Payments - features will be disabled if missing
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    
    // AI - features will be disabled if missing
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    
    // Email
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'orders@myroofgenius.com',
    
    // Maps
    MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    
    // Integrations
    MAKE_WEBHOOK_URL: process.env.MAKE_WEBHOOK_URL,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    
    // URLs
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    API_BASE_URL: process.env.API_BASE_URL,
    
    // Feature flags
    NEXT_PUBLIC_AI_COPILOT_ENABLED: process.env.NEXT_PUBLIC_AI_COPILOT_ENABLED === 'true',
    NEXT_PUBLIC_AR_MODE_ENABLED: process.env.NEXT_PUBLIC_AR_MODE_ENABLED === 'true',
    NEXT_PUBLIC_MARKETPLACE_ENABLED: process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED === 'true',
    SALES_ENABLED: process.env.SALES_ENABLED === 'true',
    
    // Monitoring
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    
    // Environment
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    VERCEL_ENV: process.env.VERCEL_ENV as any,
    CI: process.env.CI === 'true',
    
    // Background jobs
    CRON_SECRET: process.env.CRON_SECRET,
  }
}

// Export utility for checking missing vars
export function getMissingEnvVars(): string[] {
  const missing: string[] = []
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RESEND_API_KEY',
    'NEXT_PUBLIC_APP_URL'
  ]
  
  requiredVars.forEach(key => {
    if (!process.env[key]) {
      missing.push(key)
    }
  })
  
  // Check for at least one AI provider
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    missing.push('AI_PROVIDER (need at least one: OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY)')
  }
  
  return missing
}
```

### Task 4: Update Package Scripts
Update: `package.json`

```json
{
  "scripts": {
    "dev": "npm run env:validate && next dev",
    "build": "npm run env:validate && next build",
    "start": "next start",
    "env:validate": "tsx scripts/validate-env.ts",
    "env:check": "tsx scripts/validate-env.ts",
    "postinstall": "npm run env:validate || echo 'Environment validation failed - configure your .env.local file'"
  }
}
```

### Task 5: Add Build-time Environment Check
Create file: `next.config.js` (update existing)

```javascript
const { validateEnvironment } = require('./scripts/validate-env')

// Run environment validation at build time
if (process.env.NODE_ENV === 'production') {
  console.log('🔍 Validating production environment...')
  const result = validateEnvironment()
  
  if (!result.success) {
    console.error('❌ Environment validation failed!')
    console.error('Errors:', result.errors)
    process.exit(1)
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'api.mapbox.com',
      },
    ],
  },
  // Expose only public env vars to client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_AI_COPILOT_ENABLED: process.env.NEXT_PUBLIC_AI_COPILOT_ENABLED,
    NEXT_PUBLIC_AR_MODE_ENABLED: process.env.NEXT_PUBLIC_AR_MODE_ENABLED,
    NEXT_PUBLIC_MARKETPLACE_ENABLED: process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED,
  },
}

module.exports = nextConfig
```

### Task 6: Create Complete .env.example
Update: `.env.example`

```env
# ==============================================
# REQUIRED ENVIRONMENT VARIABLES
# ==============================================

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# AI Providers (at least one required)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
GOOGLE_GENERATIVE_AI_API_KEY=xxxxxxxxxxxxx

# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=orders@myroofgenius.com

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ==============================================
# OPTIONAL ENVIRONMENT VARIABLES
# ==============================================

# Mapping & Geolocation
MAPBOX_TOKEN=pk.xxxxxxxxxxxxx
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxxxxxxxxxx

# External Integrations
MAKE_WEBHOOK_URL=https://hook.us1.make.com/xxxxxxxxxxxxx
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxxxxxxxxxx

# Feature Flags
NEXT_PUBLIC_AI_COPILOT_ENABLED=true
NEXT_PUBLIC_AR_MODE_ENABLED=false
NEXT_PUBLIC_MARKETPLACE_ENABLED=true
SALES_ENABLED=true

# Monitoring & Analytics
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxx@sentry.io/xxxxxxxxxxxxx
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Background Jobs Security
CRON_SECRET=your-cron-secret-min-16-chars

# External API Base (for FastAPI backend if used)
API_BASE_URL=http://localhost:8000

# ==============================================
# NOTES
# ==============================================
# 1. Copy this file to .env.local for development
# 2. Never commit .env.local to version control
# 3. Set all values in Vercel dashboard for production
# 4. Run 'npm run env:validate' to check configuration
# 5. At least one AI provider key is required
```

### Task 7: Add Dependency for Validation
Update: `package.json`

```json
{
  "dependencies": {
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "chalk": "^4.1.2",
    "dotenv": "^16.4.5",
    "tsx": "^4.7.0"
  }
}
```

Run:
```bash
npm install zod@^3.22.4 --save
npm install chalk@^4.1.2 dotenv@^16.4.5 tsx@^4.7.0 --save-dev
```

## Verification Steps for Codex

1. **Install dependencies**:
   ```bash
   npm install zod@^3.22.4 chalk@^4.1.2 dotenv@^16.4.5 tsx@^4.7.0
   ```

2. **Create test .env.local**:
   - Copy `.env.example` to `.env.local`
   - Fill in at least the required values

3. **Run validation**:
   ```bash
   npm run env:validate
   ```

4. **Test validation scenarios**:
   - Remove a required variable and verify error
   - Use invalid format (e.g., wrong API key prefix)
   - Verify warnings for optional features

5. **Test build process**:
   ```bash
   npm run build
   ```
   Should fail if required env vars are missing

6. **Verify runtime safety**:
   - Import and use `getEnv()` in a component
   - Check `isFeatureEnabled()` before using features
   - Confirm graceful degradation when vars missing

## Notes for Next Sprint
Next, we'll address the remaining payment flow gaps and implement proper order tracking (Sprint 07).