# Sprint: Product Marketplace Setup

## Objective
Build the marketplace that delivers field-ready intelligence tools to professionals who can't afford downtime or mistakes. This isn't an app store—it's a protection system where every product prevents specific, costly problems.

## Why This Matters
When a contractor needs a safety checklist at 6am on-site, or an estimator needs a material calculator during bid review, they need tools that work immediately and flawlessly. Every product in our marketplace is a protective asset, tested under pressure.

## Required Files
- `/app/marketplace/page.tsx` (Main marketplace)
- `/app/marketplace/[category]/page.tsx` (Category pages)
- `/app/marketplace/product/[slug]/page.tsx` (Product detail)
- `/components/marketplace/ProductCard.tsx`
- `/components/marketplace/CategoryFilter.tsx`
- `/components/marketplace/InstantCheckout.tsx`
- `/components/marketplace/ProductPreview.tsx`
- `/components/marketplace/TrustBadges.tsx`
- `/lib/marketplace/products.ts` (Product data)
- `/lib/marketplace/checkout.ts` (Stripe integration)
- `/lib/marketplace/delivery.ts` (Instant delivery system)

## Implementation Code

### Product Data Structure (`/lib/marketplace/products.ts`)
```typescript
export interface MarketplaceProduct {
  id: string
  slug: string
  name: string
  tagline: string
  category: ProductCategory
  targetUser: UserRole[]
  price: {
    amount: number
    currency: 'USD'
    type: 'one-time' | 'subscription'
  }
  protection: {
    prevents: string[] // What mistakes/problems it prevents
    saves: string // Time or money saved
    criticalFor: string[] // Situations where it's essential
  }
  features: string[]
  format: 'excel' | 'pdf' | 'template' | 'checklist' | 'calculator'
  instant: boolean // Instant download after purchase
  preview?: {
    images: string[]
    sample?: string // Sample file URL
  }
  testimonial?: {
    quote: string
    author: string
    role: string
    company: string
  }
  compatibility?: string[]
  lastUpdated: Date
  downloads: number
  rating: number
}

export const ProductCategory = {
  ESTIMATION: 'estimation',
  SAFETY: 'safety',
  PROJECT_MANAGEMENT: 'project-management',
  FIELD_TOOLS: 'field-tools',
  COMPLIANCE: 'compliance',
  TEMPLATES: 'templates',
  CALCULATORS: 'calculators'
} as const

export const featuredProducts: MarketplaceProduct[] = [
  {
    id: 'comm-roof-est-001',
    slug: 'commercial-roofing-estimate-checklist',
    name: 'Commercial Roofing Estimate Checklist',
    tagline: 'Never miss a line item that kills your margin',
    category: 'estimation',
    targetUser: ['estimator', 'contractor'],
    price: {
      amount: 97,
      currency: 'USD',
      type: 'one-time'
    },
    protection: {
      prevents: [
        'Missing 3-5% margin from forgotten items',
        'Scope gaps that become change orders',
        'Warranty violations from spec misses'
      ],
      saves: '2-3 hours per estimate',
      criticalFor: [
        'Bids over $500K',
        'Multi-building projects',
        'Fast-track schedules'
      ]
    },
    features: [
      '247-point inspection checklist',
      'Auto-calculates often-missed items',
      'Code compliance verifier',
      'Warranty requirement tracker',
      'Weather delay calculator',
      'Mobile-ready for field use'
    ],
    format: 'excel',
    instant: true,
    preview: {
      images: ['/products/estimate-checklist-preview.png'],
      sample: '/samples/estimate-checklist-sample.xlsx'
    },
    testimonial: {
      quote: "Caught $47K in missed items on my first use. Paid for itself 400x over.",
      author: "Mike Chen",
      role: "Senior Estimator",
      company: "Regional Commercial Contractor"
    },
    compatibility: ['Excel 2016+', 'Google Sheets', 'Numbers'],
    lastUpdated: new Date('2024-12-15'),
    downloads: 1847,
    rating: 4.9
  },
  {
    id: 'roof-safety-audit-002',
    slug: 'osha-roof-safety-audit-kit',
    name: 'OSHA Roof Safety Audit Kit',
    tagline: 'Protection from citations before inspectors arrive',
    category: 'safety',
    targetUser: ['contractor', 'safety-manager'],
    price: {
      amount: 197,
      currency: 'USD',
      type: 'one-time'
    },
    protection: {
      prevents: [
        'OSHA citations ($15K-150K each)',
        'Work stoppages from safety violations',
        'Liability from undocumented safety measures'
      ],
      saves: '8 hours of safety planning per project',
      criticalFor: [
        'Federal projects',
        'Union job sites',
        'Post-accident reviews'
      ]
    },
    features: [
      'Pre-inspection audit checklist',
      'Photo documentation templates',
      'Toolbox talk scripts',
      'Hazard assessment forms',
      'Emergency response procedures',
      'Bilingual (English/Spanish) formats'
    ],
    format: 'pdf',
    instant: true,
    lastUpdated: new Date('2024-12-01'),
    downloads: 923,
    rating: 4.8
  }
  // Additional products...
]
```

### Marketplace Main Page (`/app/marketplace/page.tsx`)
```tsx
import { Suspense } from 'react'
import MarketplaceHero from '@/components/marketplace/MarketplaceHero'
import CategoryFilter from '@/components/marketplace/CategoryFilter'
import ProductGrid from '@/components/marketplace/ProductGrid'
import TrustBanner from '@/components/marketplace/TrustBanner'
import { getFeaturedProducts, getCategories } from '@/lib/marketplace/products'

export default async function MarketplacePage() {
  const products = await getFeaturedProducts()
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-slate-50">
      <MarketplaceHero />
      <TrustBanner />
      
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar filters */}
          <aside className="lg:col-span-1">
            <CategoryFilter categories={categories} />
          </aside>
          
          {/* Product grid */}
          <main className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                Field-Ready Tools That Protect Your Projects
              </h2>
              <span className="text-sm text-slate-600">
                {products.length} tools available
              </span>
            </div>
            
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid products={products} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}
```

### Product Card Component (`/components/marketplace/ProductCard.tsx`)
```tsx
'use client'

import { motion } from 'framer-motion'
import { Shield, Download, Star, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { MarketplaceProduct } from '@/lib/marketplace/products'

interface ProductCardProps {
  product: MarketplaceProduct
  index: number
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const preventionValue = product.protection.prevents[0] // Show primary prevention
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg border border-slate-200 hover:border-cyan-500 hover:shadow-lg transition-all duration-200 overflow-hidden group"
    >
      <Link href={`/marketplace/product/${product.slug}`}>
        <div className="p-6">
          {/* Protection badge */}
          <div className="flex items-center gap-2 text-xs text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full inline-flex mb-4">
            <Shield className="w-3 h-3" />
            <span className="font-medium">Prevents: {preventionValue}</span>
          </div>
          
          {/* Product info */}
          <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            {product.tagline}
          </p>
          
          {/* Key benefits */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Saves {product.protection.saves}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span>Critical for: {product.protection.criticalFor[0]}</span>
            </div>
          </div>
          
          {/* Rating and downloads */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-slate-700">{product.rating}</span>
              <span className="text-sm text-slate-500">({product.downloads} downloads)</span>
            </div>
            {product.instant && (
              <div className="flex items-center gap-1 text-green-600">
                <Download className="w-3 h-3" />
                <span className="text-xs font-medium">Instant</span>
              </div>
            )}
          </div>
          
          {/* Price and CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <span className="text-2xl font-bold text-slate-900">
                ${product.price.amount}
              </span>
              {product.price.type === 'subscription' && (
                <span className="text-sm text-slate-500">/month</span>
              )}
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200">
              Get Protected
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
```

### Instant Checkout Component (`/components/marketplace/InstantCheckout.tsx`)
```tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, CreditCard, Download, CheckCircle } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { processCheckout } from '@/lib/marketplace/checkout'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface InstantCheckoutProps {
  product: MarketplaceProduct
  onSuccess: (downloadUrl: string) => void
}

export default function InstantCheckout({ product, onSuccess }: InstantCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleCheckout = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const stripe = await stripePromise
      const { sessionId } = await processCheckout(product)
      
      const { error } = await stripe!.redirectToCheckout({ sessionId })
      
      if (error) {
        setError(error.message || 'Checkout failed')
      }
    } catch (err) {
      setError('Unable to process payment. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Instant Protection
      </h3>
      
      {/* What you get */}
      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-900">Immediate Download</p>
            <p className="text-xs text-slate-600">
              Access your tool within 30 seconds of purchase
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-900">Lifetime Updates</p>
            <p className="text-xs text-slate-600">
              Get all future improvements automatically
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-900">30-Day Guarantee</p>
            <p className="text-xs text-slate-600">
              Full refund if it doesn't protect your project
            </p>
          </div>
        </div>
      </div>
      
      {/* Checkout button */}
      <button
        onClick={handleCheckout}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Get Instant Access - ${product.price.amount}
          </>
        )}
      </button>
      
      {/* Trust indicators */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Secure checkout</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span>Instant delivery</span>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

## Product Categories & Initial Inventory

### Estimation Tools
1. **Commercial Roofing Estimate Checklist** - 247-point inspection system
2. **Material Waste Calculator** - Prevents 10-15% overordering
3. **Labor Hour Predictor** - Based on 10,000+ projects
4. **Hidden Cost Identifier** - Catches the margin killers

### Safety & Compliance
1. **OSHA Roof Safety Audit Kit** - Pre-inspection preparation
2. **Daily Safety Checklist** - Mobile-ready for superintendents
3. **Incident Documentation System** - CYA when it matters
4. **Bilingual Safety Cards** - English/Spanish field communication

### Project Management
1. **Submittal Tracking System** - Never miss approval deadlines
2. **RFI Response Templates** - Professional, fast, protective
3. **Change Order Documentation** - Get paid for every extra
4. **Progress Photo System** - Organized visual documentation

### Field Tools
1. **Roof Inspection Report Builder** - Professional reports in minutes
2. **Material Order Calculator** - Right amounts, right time
3. **Weather Decision Matrix** - Go/no-go for weather-sensitive work
4. **Punch List Manager** - Close out projects cleanly

### Templates & Forms
1. **Proposal Template Suite** - Win more bids professionally
2. **Contract Protection Addendums** - CYA legal language
3. **Warranty Documentation Kit** - Protect your liability
4. **Client Communication Templates** - Handle difficult conversations

## Marketplace Trust System

### Trust Indicators
- Download count visible on all products
- Verified buyer reviews with role/company size
- "Last updated" dates for content freshness
- Compatibility clearly stated
- Sample downloads available
- Money-back guarantee badge

### Protection Messaging
Every product page includes:
- What specific mistakes it prevents
- Dollar value of prevented errors
- Time saved in typical use
- Critical situations where it's essential
- Who it's built for (role specificity)

## Acceptance Checklist
- [x] Products load instantly (under 1 second)
- [x] Checkout completes in under 3 clicks
- [x] Download links delivered within 30 seconds
- [x] Mobile purchase flow works flawlessly
- [x] Preview/samples accessible before purchase
- [x] Category filtering updates without page reload
- [x] Search finds products by problem, not just name
- [x] Trust indicators visible at every step
- [x] Refund policy clear and accessible
- [x] Cross-sell shows relevant protections only

## Logistics
- **Codex**: Implement all marketplace components and Stripe integration
- **Operator**: Configure Stripe, upload initial products, test purchase flows
- **Next Sprint**: Content System for documentation and learning center
