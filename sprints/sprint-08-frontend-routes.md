# Sprint 08: Fix Frontend Routes & UI

## Objective
Fix broken frontend routes, implement missing pages, and resolve UI inconsistencies including the demo page, navigation issues, and AI Copilot persona options.

## Critical Context for Codex
- **Current Issues**:
  - /demo route returns 404
  - Field Apps and Tools nav items point to non-existent pages
  - AI Copilot executive persona is unreachable due to mismatched values
  - AR mode toggle logic needs verification
- **Solution**: Create missing pages, fix navigation, and resolve UI inconsistencies

## Implementation Tasks

### Task 1: Create Demo Page
Create file: `app/demo/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Play, Pause, Maximize2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Demo video URL - replace with actual demo video
  const demoVideoUrl = '/demo-video.mp4' // You'll need to add this to public folder
  const demoVideoYouTube = 'dQw4w9WgXcQ' // Replace with actual YouTube ID

  const demos = [
    {
      id: 'roof-analysis',
      title: 'AI Roof Analysis',
      description: 'See how our AI instantly analyzes roof conditions from photos',
      duration: '2:34',
      thumbnail: '/images/demo-roof-analysis.jpg',
    },
    {
      id: 'project-estimation',
      title: 'Smart Project Estimation',
      description: 'Watch how we generate accurate estimates in seconds',
      duration: '3:15',
      thumbnail: '/images/demo-estimation.jpg',
    },
    {
      id: 'field-app',
      title: 'Field App Walkthrough',
      description: 'Tour our mobile app for field technicians',
      duration: '4:22',
      thumbnail: '/images/demo-field-app.jpg',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              See MyRoofGenius in Action
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover how our AI-powered platform transforms roofing project management
            </p>
          </div>

          {/* Main Demo Video */}
          <div className="relative max-w-5xl mx-auto">
            <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
              {/* Placeholder for video - implement actual video player */}
              <div className="relative w-full h-full flex items-center justify-center">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${demoVideoYouTube}?autoplay=0&controls=1&modestbranding=1`}
                  title="MyRoofGenius Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* CTA below video */}
            <div className="mt-8 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Start Free Trial
              </Link>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                No credit card required • 14-day free trial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Demos Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Feature Demonstrations
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {demos.map((demo) => (
              <motion.div
                key={demo.id}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer"
                onClick={() => {
                  // Implement demo video modal or navigation
                  console.log('Play demo:', demo.id)
                }}
              >
                <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                  {/* Placeholder for thumbnail */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {demo.duration}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {demo.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {demo.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-white">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold mb-4">
                Try Our Interactive Demo
              </h2>
              <p className="text-lg mb-8 text-blue-100">
                Experience MyRoofGenius with sample data. No signup required.
              </p>
              <div className="space-y-4">
                <Link
                  href="/demo/roof-analyzer"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 hover:bg-gray-100 font-medium rounded-lg transition-colors"
                >
                  Try Roof Analyzer →
                </Link>
                <Link
                  href="/demo/estimation"
                  className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-lg transition-colors ml-4"
                >
                  Try Estimation Tool →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <details className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                How accurate is the AI roof analysis?
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Our AI achieves 95%+ accuracy in identifying common roofing issues, materials, and conditions. 
                It's trained on millions of roof images and continuously improves.
              </p>
            </details>

            <details className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                Can I integrate with my existing tools?
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Yes! MyRoofGenius integrates with popular CRM systems, accounting software, and project 
                management tools through our API and Zapier integration.
              </p>
            </details>

            <details className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                What's included in the free trial?
              </summary>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                The 14-day free trial includes full access to all features, unlimited roof analyses, 
                and our complete template library. No credit card required to start.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  )
}
```

### Task 2: Create Coming Soon Pages for Field Apps and Tools
Create file: `app/field-apps/page.tsx`

```typescript
import Link from 'next/link'
import { Smartphone, Bell, MapPin, Camera, Calendar, Users } from 'lucide-react'

export default function FieldAppsPage() {
  const features = [
    {
      icon: Camera,
      title: 'Photo Capture & Analysis',
      description: 'Take photos and get instant AI analysis of roof conditions',
    },
    {
      icon: MapPin,
      title: 'GPS Job Tracking',
      description: 'Automatic location tracking for accurate job site documentation',
    },
    {
      icon: Calendar,
      title: 'Schedule Management',
      description: 'View and manage your daily schedule with real-time updates',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Communicate with office staff and share updates instantly',
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Get alerts for schedule changes and important updates',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6">
            <Smartphone className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Field Apps Coming Soon
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Native mobile apps for iOS and Android designed specifically for roofing professionals in the field
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <feature.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Early Access CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Get Early Access
          </h2>
          <p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">
            Join our beta program and be among the first to use MyRoofGenius mobile apps. 
            Help shape the future of field technology for roofing.
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-blue-600 hover:bg-gray-100 font-medium rounded-lg transition-colors"
            >
              Join Beta
            </button>
          </form>
          <p className="mt-4 text-sm text-blue-100">
            Expected launch: Q2 2025
          </p>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
```

Create file: `app/tools/page.tsx`

```typescript
import Link from 'next/link'
import { Wrench, Calculator, FileText, BarChart, Zap, Shield } from 'lucide-react'

export default function ToolsPage() {
  const tools = [
    {
      icon: Calculator,
      title: 'Material Calculator',
      description: 'Calculate exact material needs for any roofing project',
      status: 'coming-soon',
    },
    {
      icon: BarChart,
      title: 'ROI Analyzer',
      description: 'Show customers their return on investment for roof upgrades',
      status: 'coming-soon',
    },
    {
      icon: FileText,
      title: 'Contract Generator',
      description: 'Create professional contracts with built-in legal protection',
      status: 'coming-soon',
    },
    {
      icon: Shield,
      title: 'Warranty Tracker',
      description: 'Manage and track all warranties in one place',
      status: 'coming-soon',
    },
    {
      icon: Zap,
      title: 'Energy Calculator',
      description: 'Estimate energy savings from roofing improvements',
      status: 'coming-soon',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6">
            <Wrench className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Professional Tools
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Powerful calculators and tools designed to streamline your roofing business
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative">
              {tool.status === 'coming-soon' && (
                <div className="absolute top-4 right-4 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded">
                  Coming Soon
                </div>
              )}
              <tool.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {tool.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {tool.description}
              </p>
            </div>
          ))}
        </div>

        {/* Request a Tool */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Need a specific tool?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Let us know what would help your business and we'll prioritize it
          </p>
          <Link
            href="/support?topic=tool-request"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Request a Tool
          </Link>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
```

### Task 3: Fix AI Copilot Persona Selection
Update: `components/copilot/CopilotPanel.tsx`

```typescript
// Update the role selector section and quickActions

const ROLES = [
  { value: 'field', label: 'Field Technician', icon: '🔧' },
  { value: 'pm', label: 'Project Manager', icon: '📊' },
  { value: 'exec', label: 'Executive', icon: '💼' }, // Add exec option
] as const

type Role = typeof ROLES[number]['value']

// Update quickActions to use consistent keys
const quickActions: Record<Role, string[]> = {
  field: [
    'How do I identify hail damage?',
    'What safety equipment do I need?',
    'How to measure roof pitch?',
  ],
  pm: [
    'Create project timeline',
    'Calculate material needs',
    'Write client update email',
  ],
  exec: [ // Change from 'executive' to 'exec'
    'Show best-selling template',
    'Market analysis summary',
    'Revenue optimization tips',
  ],
}

// In the component JSX, update the role selector:
{/* Role Selector */}
<div className="p-3 border-b border-gray-200 dark:border-gray-700">
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
    Select your role:
  </label>
  <select
    value={role}
    onChange={(e) => {
      setRole(e.target.value as Role)
      clearSession()
    }}
    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
  >
    {ROLES.map((r) => (
      <option key={r.value} value={r.value}>
        {r.icon} {r.label}
      </option>
    ))}
  </select>
</div>

{/* Quick Actions - update to show based on current role */}
{messages.length === 0 && (
  <div className="mt-4">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
      Quick actions:
    </p>
    <div className="space-y-2">
      {quickActions[role as Role]?.map((action, index) => (
        <button
          key={index}
          onClick={() => {
            setInput(action)
            sendMessage()
          }}
          className="w-full text-left px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          {action}
        </button>
      ))}
    </div>
  </div>
)}
```

### Task 4: Update Navigation to Handle Missing Pages
Update: `components/layout/Navbar.tsx`

```typescript
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Products', href: '/products' },
  { 
    name: 'Field Apps', 
    href: '/field-apps',
    badge: 'Coming Soon',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
  },
  { 
    name: 'Tools', 
    href: '/tools',
    badge: 'Coming Soon',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
  },
  { name: 'Support', href: '/support' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="space-x-8 flex items-center">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            'relative text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400',
            pathname === item.href
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300'
          )}
        >
          {item.name}
          {item.badge && (
            <span className={cn(
              'ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
              item.badgeColor
            )}>
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  )
}
```

### Task 5: Verify AR Mode Feature Flag
Update: `components/providers/ARModeProvider.tsx`

```typescript
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { isFeatureEnabled } from '@/lib/features'

interface ARModeContextType {
  isAREnabled: boolean
  toggleARMode: () => void
}

const ARModeContext = createContext<ARModeContextType>({
  isAREnabled: false,
  toggleARMode: () => {},
})

export function ARModeProvider({ children }: { children: React.ReactNode }) {
  const [isAREnabled, setIsAREnabled] = useState(false)
  
  // Check if AR mode is enabled in environment
  const arModeFeatureEnabled = isFeatureEnabled('ar')

  useEffect(() => {
    if (!arModeFeatureEnabled) {
      setIsAREnabled(false)
      return
    }

    // Load AR preference from localStorage
    const savedARMode = localStorage.getItem('ar_mode')
    if (savedARMode === 'true') {
      setIsAREnabled(true)
    }
  }, [arModeFeatureEnabled])

  const toggleARMode = () => {
    if (!arModeFeatureEnabled) return
    
    const newValue = !isAREnabled
    setIsAREnabled(newValue)
    localStorage.setItem('ar_mode', String(newValue))
  }

  // Don't render AR features if not enabled
  if (!arModeFeatureEnabled) {
    return <>{children}</>
  }

  return (
    <ARModeContext.Provider value={{ isAREnabled, toggleARMode }}>
      {children}
    </ARModeContext.Provider>
  )
}

export const useARMode = () => {
  const context = useContext(ARModeContext)
  if (!context) {
    throw new Error('useARMode must be used within ARModeProvider')
  }
  return context
}
```

### Task 6: Add 404 Page
Create file: `app/not-found.tsx`

```typescript
import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Homepage
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>

          <Link
            href="/search"
            className="inline-flex items-center justify-center w-full px-4 py-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
          >
            <Search className="h-5 w-5 mr-2" />
            Search our site
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          If you think this is a mistake, please{' '}
          <Link href="/support" className="text-blue-600 hover:underline dark:text-blue-400">
            contact support
          </Link>
        </div>
      </div>
    </div>
  )
}
```

## Verification Steps for Codex

1. **Test all new routes**:
   - Navigate to `/demo` - should show demo page
   - Navigate to `/field-apps` - should show coming soon page
   - Navigate to `/tools` - should show tools listing
   - Navigate to a non-existent route - should show 404

2. **Test AI Copilot personas**:
   - Open Copilot panel
   - Select each role (Field, PM, Executive)
   - Verify quick actions update for each role
   - Send a message in Executive mode

3. **Test navigation badges**:
   - Verify "Coming Soon" badges appear on Field Apps and Tools
   - Check responsive behavior on mobile

4. **Test AR mode toggle**:
   - If `NEXT_PUBLIC_AR_MODE_ENABLED=false`, verify no AR UI appears
   - If enabled, verify toggle works and persists

5. **Check for console errors**:
   - No errors about missing routes
   - No errors about undefined quickActions

## Notes for Next Sprint
Next, we'll optimize performance and data loading (Sprint 09) to improve page load times and reduce sequential fetching.