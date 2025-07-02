# Sprint 11: Feature Flags & Configuration Alignment

## Objective
Align feature flag naming between code and environment variables, implement proper feature toggling throughout the application, and ensure consistent configuration management.

## Critical Context for Codex
- **Current Issues**:
  - Mismatch between feature flag names in code vs .env.example
  - Code expects `NEXT_PUBLIC_AI_COPILOT_ENABLED` but example shows `NEXT_PUBLIC_ENABLE_AI_FEATURES`
  - No comprehensive feature flag system for gradual rollouts
  - Missing shadcn/ui components per BrainOps guidelines
- **Solution**: Standardize naming, implement robust feature system, add shadcn/ui

## Implementation Tasks

### Task 1: Create Comprehensive Feature Flag System
Update: `app/lib/features.ts`

```typescript
import { getEnv } from './env'

// Feature flag definitions
export const FEATURES = {
  AI_COPILOT: 'ai_copilot',
  AR_MODE: 'ar_mode',
  MARKETPLACE: 'marketplace',
  SALES: 'sales',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  TEAM_COLLABORATION: 'team_collaboration',
  API_ACCESS: 'api_access',
  CUSTOM_BRANDING: 'custom_branding',
} as const

export type FeatureKey = typeof FEATURES[keyof typeof FEATURES]

// Feature configuration with defaults and descriptions
const featureConfig: Record<FeatureKey, {
  envVar: string
  defaultValue: boolean
  description: string
  requiredPlan?: 'free' | 'pro' | 'enterprise'
}> = {
  [FEATURES.AI_COPILOT]: {
    envVar: 'NEXT_PUBLIC_AI_COPILOT_ENABLED',
    defaultValue: true,
    description: 'AI-powered chat assistant for roofing guidance',
    requiredPlan: 'free'
  },
  [FEATURES.AR_MODE]: {
    envVar: 'NEXT_PUBLIC_AR_MODE_ENABLED',
    defaultValue: false,
    description: 'Augmented reality visualization for roof measurements',
    requiredPlan: 'pro'
  },
  [FEATURES.MARKETPLACE]: {
    envVar: 'NEXT_PUBLIC_MARKETPLACE_ENABLED',
    defaultValue: true,
    description: 'Digital marketplace for templates and tools',
    requiredPlan: 'free'
  },
  [FEATURES.SALES]: {
    envVar: 'SALES_ENABLED',
    defaultValue: true,
    description: 'E-commerce and payment processing',
    requiredPlan: 'free'
  },
  [FEATURES.ADVANCED_ANALYTICS]: {
    envVar: 'NEXT_PUBLIC_ADVANCED_ANALYTICS_ENABLED',
    defaultValue: false,
    description: 'Advanced business analytics and reporting',
    requiredPlan: 'pro'
  },
  [FEATURES.TEAM_COLLABORATION]: {
    envVar: 'NEXT_PUBLIC_TEAM_COLLABORATION_ENABLED',
    defaultValue: false,
    description: 'Multi-user team features and permissions',
    requiredPlan: 'pro'
  },
  [FEATURES.API_ACCESS]: {
    envVar: 'NEXT_PUBLIC_API_ACCESS_ENABLED',
    defaultValue: false,
    description: 'API access for integrations',
    requiredPlan: 'enterprise'
  },
  [FEATURES.CUSTOM_BRANDING]: {
    envVar: 'NEXT_PUBLIC_CUSTOM_BRANDING_ENABLED',
    defaultValue: false,
    description: 'White-label and custom branding options',
    requiredPlan: 'enterprise'
  }
}

// Runtime feature flag cache
let featureCache: Map<FeatureKey, boolean> | null = null

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: FeatureKey): boolean {
  // Initialize cache if needed
  if (!featureCache) {
    featureCache = new Map()
    const env = getEnv()
    
    // Load all feature flags from environment
    Object.entries(featureConfig).forEach(([key, config]) => {
      const envValue = (env as any)[config.envVar]
      const isEnabled = envValue !== undefined ? envValue : config.defaultValue
      featureCache!.set(key as FeatureKey, isEnabled)
    })
  }
  
  return featureCache.get(feature) ?? featureConfig[feature]?.defaultValue ?? false
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): FeatureKey[] {
  return Object.values(FEATURES).filter(feature => isFeatureEnabled(feature))
}

/**
 * Get feature configuration
 */
export function getFeatureConfig(feature: FeatureKey) {
  return featureConfig[feature]
}

/**
 * Check if user plan has access to feature
 */
export function hasFeatureAccess(
  feature: FeatureKey, 
  userPlan: 'free' | 'pro' | 'enterprise' = 'free'
): boolean {
  if (!isFeatureEnabled(feature)) return false
  
  const config = featureConfig[feature]
  if (!config.requiredPlan) return true
  
  const planHierarchy = { free: 0, pro: 1, enterprise: 2 }
  return planHierarchy[userPlan] >= planHierarchy[config.requiredPlan]
}

/**
 * React hook for feature flags
 */
export function useFeature(feature: FeatureKey): {
  enabled: boolean
  config: typeof featureConfig[FeatureKey]
} {
  const enabled = isFeatureEnabled(feature)
  const config = getFeatureConfig(feature)
  
  return { enabled, config }
}

/**
 * Feature flag component wrapper
 */
export function Feature({ 
  flag, 
  children,
  fallback = null 
}: { 
  flag: FeatureKey
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { enabled } = useFeature(flag)
  return <>{enabled ? children : fallback}</>
}
```

### Task 2: Install and Configure shadcn/ui
Run these commands:

```bash
npx shadcn-ui@latest init
```

When prompted:
- Would you like to use TypeScript? → Yes
- Which style would you like to use? → Default
- Which color would you like to use as base color? → Slate
- Where is your global CSS file? → app/globals.css
- Would you like to use CSS variables for colors? → Yes
- Where is your tailwind.config.js? → tailwind.config.js
- Configure the import alias? → app/*

Then install common components:

```bash
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add tooltip
```

### Task 3: Update Layout with Feature Providers
Update: `app/layout.tsx`

```typescript
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Feature, FEATURES } from '@/lib/features'
import { ARModeProvider } from '@/components/providers/ARModeProvider'
import { CopilotPanel } from '@/components/copilot/CopilotPanel'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <Feature flag={FEATURES.AR_MODE}>
                <ARModeProvider>
                  {children}
                </ARModeProvider>
              </Feature>
              
              <Feature flag={FEATURES.AR_MODE} fallback={children}>
                {/* AR mode wrapped children rendered above */}
              </Feature>

              <Feature flag={FEATURES.AI_COPILOT}>
                <CopilotPanel />
              </Feature>

              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
        
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
```

### Task 4: Update Components to Use Feature Flags
Update: `components/layout/Navbar.tsx`

```typescript
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Feature, FEATURES, isFeatureEnabled } from '@/lib/features'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

export function Navbar() {
  const pathname = usePathname()
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', enabled: true },
    { 
      name: 'Products', 
      href: '/products', 
      enabled: isFeatureEnabled(FEATURES.MARKETPLACE),
    },
    { 
      name: 'Field Apps', 
      href: '/field-apps',
      enabled: true,
      badge: 'Coming Soon',
    },
    { 
      name: 'Tools', 
      href: '/tools',
      enabled: true,
      badge: 'Coming Soon',
    },
    { name: 'Support', href: '/support', enabled: true },
  ].filter(item => item.enabled)

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navigation.map((item) => (
          <NavigationMenuItem key={item.name}>
            <Link href={item.href} legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50',
                  pathname === item.href && 'bg-accent/50'
                )}
              >
                {item.name}
                {item.badge && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                    {item.badge}
                  </span>
                )}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
        
        <Feature flag={FEATURES.ADVANCED_ANALYTICS}>
          <NavigationMenuItem>
            <Link href="/analytics" legacyBehavior passHref>
              <NavigationMenuLink className="...">
                Analytics
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </Feature>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
```

### Task 5: Create Feature Admin Panel
Create file: `app/admin/features/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { FEATURES, getFeatureConfig, isFeatureEnabled, type FeatureKey } from '@/lib/features'
import { Save, RefreshCw } from 'lucide-react'

export default function FeaturesAdminPage() {
  const { toast } = useToast()
  const [features, setFeatures] = useState<Record<FeatureKey, boolean>>({} as any)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Load current feature states
    const currentFeatures = Object.values(FEATURES).reduce((acc, feature) => {
      acc[feature] = isFeatureEnabled(feature)
      return acc
    }, {} as Record<FeatureKey, boolean>)
    
    setFeatures(currentFeatures)
  }, [])

  const handleToggle = (feature: FeatureKey) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // In a real app, this would update environment variables or database
    toast({
      title: 'Feature flags updated',
      description: 'Changes will take effect after deployment with updated environment variables.',
    })
    setHasChanges(false)
  }

  const handleReset = () => {
    const currentFeatures = Object.values(FEATURES).reduce((acc, feature) => {
      acc[feature] = isFeatureEnabled(feature)
      return acc
    }, {} as Record<FeatureKey, boolean>)
    
    setFeatures(currentFeatures)
    setHasChanges(false)
  }

  const getPlanBadgeColor = (plan?: string) => {
    switch (plan) {
      case 'pro': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
      case 'enterprise': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Feature Flags</h1>
        <p className="text-muted-foreground mt-2">
          Manage feature availability across the application
        </p>
      </div>

      <div className="space-y-4">
        {Object.values(FEATURES).map(feature => {
          const config = getFeatureConfig(feature)
          return (
            <Card key={feature}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {feature.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      ).join(' ')}
                    </CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    {config.requiredPlan && (
                      <Badge className={getPlanBadgeColor(config.requiredPlan)}>
                        {config.requiredPlan.toUpperCase()}
                      </Badge>
                    )}
                    <Switch
                      checked={features[feature] ?? false}
                      onCheckedChange={() => handleToggle(feature)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <code className="bg-muted px-1 py-0.5 rounded">
                    {config.envVar}
                  </code>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {hasChanges && (
        <div className="fixed bottom-8 right-8 bg-background border rounded-lg shadow-lg p-4">
          <p className="text-sm text-muted-foreground mb-3">
            You have unsaved changes
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Task 6: Update .env.example with Correct Names
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
# FEATURE FLAGS
# ==============================================

# Core Features
NEXT_PUBLIC_AI_COPILOT_ENABLED=true
NEXT_PUBLIC_AR_MODE_ENABLED=false
NEXT_PUBLIC_MARKETPLACE_ENABLED=true
SALES_ENABLED=true

# Advanced Features (Pro/Enterprise)
NEXT_PUBLIC_ADVANCED_ANALYTICS_ENABLED=false
NEXT_PUBLIC_TEAM_COLLABORATION_ENABLED=false
NEXT_PUBLIC_API_ACCESS_ENABLED=false
NEXT_PUBLIC_CUSTOM_BRANDING_ENABLED=false

# ==============================================
# OPTIONAL ENVIRONMENT VARIABLES
# ==============================================

# Mapping & Geolocation
MAPBOX_TOKEN=pk.xxxxxxxxxxxxx
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxxxxxxxxxx

# External Integrations
MAKE_WEBHOOK_URL=https://hook.us1.make.com/xxxxxxxxxxxxx
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxxxxxxxxxx

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
# DEVELOPMENT SETTINGS
# ==============================================

# Edge AI Mode (for development/testing)
EDGE_AI_MODE=false

# Enable detailed logging
DEBUG_MODE=false

# ==============================================
# NOTES
# ==============================================
# 1. Copy this file to .env.local for development
# 2. Never commit .env.local to version control
# 3. Set all values in Vercel dashboard for production
# 4. Run 'npm run env:validate' to check configuration
# 5. At least one AI provider key is required
# 6. Feature flags control UI visibility and functionality
```

### Task 7: Create Migration Guide
Create file: `docs/FEATURE_FLAGS_MIGRATION.md`

```markdown
# Feature Flags Migration Guide

## Overview
This guide helps migrate from the old feature flag naming to the new standardized system.

## Environment Variable Changes

### Renamed Variables
| Old Name | New Name | Default |
|----------|----------|---------|
| NEXT_PUBLIC_ENABLE_AI_FEATURES | NEXT_PUBLIC_AI_COPILOT_ENABLED | true |
| NEXT_PUBLIC_ENABLE_AR | NEXT_PUBLIC_AR_MODE_ENABLED | false |
| ENABLE_MARKETPLACE | NEXT_PUBLIC_MARKETPLACE_ENABLED | true |
| ENABLE_SALES | SALES_ENABLED | true |

### New Feature Flags
- `NEXT_PUBLIC_ADVANCED_ANALYTICS_ENABLED` - Advanced analytics dashboard
- `NEXT_PUBLIC_TEAM_COLLABORATION_ENABLED` - Multi-user features
- `NEXT_PUBLIC_API_ACCESS_ENABLED` - API access for integrations
- `NEXT_PUBLIC_CUSTOM_BRANDING_ENABLED` - White-label options

## Migration Steps

1. **Update .env.local**
   - Rename old variables to new names
   - Add new feature flags with appropriate values

2. **Update Vercel Environment Variables**
   - Go to Vercel Dashboard > Settings > Environment Variables
   - Update variable names to match new schema
   - Redeploy to apply changes

3. **Code Updates**
   - Replace `isFeatureEnabled('ai')` with `isFeatureEnabled(FEATURES.AI_COPILOT)`
   - Use the `Feature` component for conditional rendering
   - Import `FEATURES` constant for type safety

## Usage Examples

### Check if feature is enabled
```typescript
import { isFeatureEnabled, FEATURES } from '@/lib/features'

if (isFeatureEnabled(FEATURES.AI_COPILOT)) {
  // Feature is enabled
}
```

### Conditional rendering
```tsx
import { Feature, FEATURES } from '@/lib/features'

<Feature flag={FEATURES.MARKETPLACE}>
  <MarketplaceComponent />
</Feature>
```

### With fallback
```tsx
<Feature flag={FEATURES.AR_MODE} fallback={<StandardView />}>
  <ARView />
</Feature>
```

### React hook
```typescript
import { useFeature, FEATURES } from '@/lib/features'

function MyComponent() {
  const { enabled, config } = useFeature(FEATURES.ADVANCED_ANALYTICS)
  
  if (!enabled) return null
  
  return <AnalyticsDashboard />
}
```

## Testing Features

1. **Local Development**
   - Set feature flags in `.env.local`
   - Restart dev server to apply changes

2. **Preview Deployments**
   - Use Vercel preview environment variables
   - Test features in isolation

3. **Production**
   - Enable features gradually
   - Monitor for issues before full rollout
```

## Verification Steps for Codex

1. **Install shadcn/ui components**:
   ```bash
   # Follow the installation steps in Task 2
   # Verify components are installed in components/ui/
   ```

2. **Update environment variables**:
   - Copy new .env.example to .env.local
   - Update variable names to match new schema

3. **Test feature flags**:
   - Toggle each feature flag
   - Verify UI elements show/hide correctly
   - Check admin panel at /admin/features

4. **Verify naming consistency**:
   ```bash
   # Check for old naming patterns
   grep -r "ENABLE_AI_FEATURES" --include="*.ts" --include="*.tsx" .
   grep -r "isFeatureEnabled('ai')" --include="*.ts" --include="*.tsx" .
   ```

5. **Test conditional rendering**:
   - AI Copilot appears when enabled
   - Marketplace hidden when disabled
   - AR mode components only load when enabled

6. **Check TypeScript**:
   ```bash
   npm run type-check
   # Should pass with no errors
   ```

## Notes for Next Sprint
For the final sprint (Sprint 12), we'll focus on developer experience improvements, testing setup, and deployment optimization.