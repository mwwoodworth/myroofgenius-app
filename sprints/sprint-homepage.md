# Sprint: Homepage and Landing Pages Overhaul

## Objective
Transform the default Next.js homepage into a flagship SaaS platform that immediately conveys trust, capability, and protection. Build audience-specific landing pages that speak directly to estimators, contractors, architects, and building owners in high-stakes situations.

## Why This Matters
First impressions determine whether a stressed project manager trusts us with their $2M project estimate. Every pixel must communicate: "This system was built by people who understand your pressure."

## Required Files
- `/app/page.tsx` (homepage)
- `/app/estimator/page.tsx` (estimator landing)
- `/app/contractor/page.tsx` (contractor landing)
- `/app/architect/page.tsx` (architect landing)
- `/app/building-owner/page.tsx` (building owner landing)
- `/app/homeowner/page.tsx` (homeowner landing)
- `/components/HeroSection.tsx`
- `/components/ProtectionBanner.tsx`
- `/components/TrustIndicators.tsx`
- `/components/AnimatedNav.tsx`
- `/components/ProductHighlights.tsx`
- `/components/TestimonialCarousel.tsx`
- `/components/CTASection.tsx`

## Implementation Code

### Homepage Hero Section (`/components/HeroSection.tsx`)
```tsx
'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Brain } from 'lucide-react'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 -right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20"
        />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Trust indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-200">Trusted by 5,000+ roofing professionals</span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Your Intelligence Layer for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              High-Stakes Roofing
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
          >
            Built for estimators reviewing million-dollar bids. For contractors managing complex retrofits. 
            For architects specifying critical systems. This is your protection against costly mistakes.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 group"
            >
              <Zap className="w-5 h-5 group-hover:animate-pulse" />
              Start Your System
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              <Brain className="w-5 h-5" />
              See It Work
            </Link>
          </motion.div>

          {/* Quick value props */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          >
            {[
              {
                icon: Shield,
                title: "Prevents Margin Loss",
                description: "Catches the mistakes that eat 3-5% of every project"
              },
              {
                icon: Zap,
                title: "Works at Your Speed",
                description: "Real-time validation during the chaos of bid week"
              },
              {
                icon: Brain,
                title: "Learns Your Standards",
                description: "Adapts to your specs, codes, and preferences"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
              >
                <item.icon className="w-8 h-8 text-cyan-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
```

### Main Homepage (`/app/page.tsx`)
```tsx
import HeroSection from '@/components/HeroSection'
import ProtectionBanner from '@/components/ProtectionBanner'
import ProductHighlights from '@/components/ProductHighlights'
import TestimonialCarousel from '@/components/TestimonialCarousel'
import CTASection from '@/components/CTASection'
import AnimatedNav from '@/components/AnimatedNav'

export default function HomePage() {
  return (
    <>
      <AnimatedNav />
      <HeroSection />
      <ProtectionBanner />
      <ProductHighlights />
      <TestimonialCarousel />
      <CTASection />
    </>
  )
}
```

## Copy Requirements by Page

### Homepage Copy
**Meta Title**: "MyRoofGenius - Intelligence Layer for High-Stakes Roofing"  
**Meta Description**: "Built for professionals who can't afford mistakes. AI-powered estimation, analysis, and protection for commercial roofing projects."

### Estimator Landing Page (`/app/estimator/page.tsx`)
**Hero Title**: "Never Submit Another Estimate With Hidden Mistakes"  
**Subtitle**: "Built by estimators who've lived through the 3am bid reviews and last-minute scope changes."  
**Primary CTA**: "Protect Your Next Bid"

**Key Messages**:
- "Catches the $50K material miss before you hit send"
- "Validates every line item against 10,000+ successful projects"
- "Your safety net during bid week chaos"

### Contractor Landing Page (`/app/contractor/page.tsx`)
**Hero Title**: "Field Intelligence That Prevents Rework"  
**Subtitle**: "For contractors who measure success by what doesn't go wrong."  
**Primary CTA**: "Build Your Safety System"

**Key Messages**:
- "Spot change orders before they happen"
- "Document everything, forget nothing"
- "Turn field chaos into organized execution"

### Architect Landing Page (`/app/architect/page.tsx`)
**Hero Title**: "Specify With Confidence, Even Under Pressure"  
**Subtitle**: "When the schedule is compressed and the stakes are high, you need systems that don't fail."  
**Primary CTA**: "Access Specification Intelligence"

**Key Messages**:
- "Current codes, verified systems, zero guesswork"
- "From concept to closeout documentation"
- "Protect your reputation on every project"

### Building Owner Landing Page (`/app/building-owner/page.tsx`)
**Hero Title**: "See Through Your Roofing Project's Complexity"  
**Subtitle**: "Make million-dollar decisions with million-dollar intelligence."  
**Primary CTA**: "Get Clear Visibility"

**Key Messages**:
- "Know what you're buying before you sign"
- "Track every dollar, every milestone"
- "Your independent verification system"

## UX Requirements

### Design Principles
1. **Protection First**: Every element reinforces safety and confidence
2. **Clarity Under Pressure**: Information hierarchy that works when stressed
3. **Professional Trust**: Looks like enterprise software, works like consumer apps
4. **Speed**: Every interaction under 100ms

### Visual Standards
- Primary: Slate (#0F172A) and Electric Cyan (#0EA5E9)
- Glassmorphism with blur effects on cards
- Smooth Framer Motion transitions (stagger children, fade up)
- System font stack for speed: Inter, system-ui, -apple-system
- Mobile breakpoints: 640px, 768px, 1024px, 1280px

### Animation Requirements
- Page transitions: 200ms ease-out
- Card hovers: scale(1.02) with shadow
- Button interactions: immediate feedback
- Scroll-triggered reveals for sections
- Loading skeletons, never spinners

## Acceptance Checklist
- [ ] All pages load in under 2 seconds
- [ ] Mobile experience equals desktop quality
- [ ] Every CTA has hover, active, and focus states
- [ ] Accessibility: WCAG 2.1 AA compliant
- [ ] Copy speaks to specific user stress points
- [ ] No generic SaaS templates or stock photos
- [ ] Forms have inline validation and clear error states
- [ ] Navigation works at all breakpoints
- [ ] Testimonials include role, company size, project type
- [ ] Trust indicators visible without scrolling

## Logistics
- **Codex**: Implement all components and page integration
- **Operator**: Verify responsive design, test all CTAs, confirm Vercel deployment
- **Next**: AI Copilot Integration sprint after homepage completion