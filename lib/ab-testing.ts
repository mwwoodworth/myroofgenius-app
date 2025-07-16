import React from 'react'
import { Analytics } from './analytics'
import { ErrorHandler } from './error-handler'

declare global {
  interface Window {
    __VERCEL_FLAGS__?: {
      get: (key: string) => any
      set: (key: string, value: any) => void
    }
  }
}

export interface ABTestConfig {
  name: string
  description: string
  variants: Array<{
    name: string
    weight: number
    description: string
  }>
  enabled: boolean
  targetAudience?: {
    country?: string[]
    device?: string[]
    newUsers?: boolean
  }
  startDate?: string
  endDate?: string
}

export interface ABTestResult {
  testName: string
  variant: string
  userId?: string
  timestamp: string
  metadata?: Record<string, any>
}

export class ABTestingService {
  private static instance: ABTestingService
  private analytics: Analytics
  private userVariants: Map<string, string> = new Map()
  private tests: Map<string, ABTestConfig> = new Map()

  constructor() {
    this.analytics = Analytics.getInstance()
    this.initializeTests()
  }

  static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService()
    }
    return ABTestingService.instance
  }

  private initializeTests() {
    // Define A/B tests
    const tests: ABTestConfig[] = [
      {
        name: 'landing_page_hero',
        description: 'Test different hero sections on landing page',
        variants: [
          { name: 'control', weight: 50, description: 'Original hero section' },
          { name: 'video_hero', weight: 30, description: 'Video background hero' },
          { name: 'testimonial_hero', weight: 20, description: 'Testimonial-focused hero' },
        ],
        enabled: true,
        targetAudience: {
          newUsers: true,
        },
      },
      {
        name: 'pricing_page_layout',
        description: 'Test different pricing page layouts',
        variants: [
          { name: 'control', weight: 50, description: 'Original pricing layout' },
          { name: 'feature_comparison', weight: 50, description: 'Feature comparison table' },
        ],
        enabled: true,
      },
      {
        name: 'cta_button_text',
        description: 'Test different CTA button text',
        variants: [
          { name: 'control', weight: 25, description: 'Get Started' },
          { name: 'try_free', weight: 25, description: 'Try Free' },
          { name: 'start_estimate', weight: 25, description: 'Start Estimate' },
          { name: 'book_demo', weight: 25, description: 'Book Demo' },
        ],
        enabled: true,
      },
      {
        name: 'onboarding_flow',
        description: 'Test different onboarding flows',
        variants: [
          { name: 'control', weight: 50, description: 'Original onboarding' },
          { name: 'progressive', weight: 50, description: 'Progressive disclosure' },
        ],
        enabled: true,
        targetAudience: {
          newUsers: true,
        },
      },
      {
        name: 'calculator_layout',
        description: 'Test different calculator layouts',
        variants: [
          { name: 'control', weight: 50, description: 'Original calculator' },
          { name: 'wizard', weight: 50, description: 'Step-by-step wizard' },
        ],
        enabled: true,
      },
    ]

    tests.forEach(test => {
      this.tests.set(test.name, test)
    })
  }

  getVariant(testName: string, userId?: string): string {
    try {
      const test = this.tests.get(testName)
      if (!test || !test.enabled) {
        return 'control'
      }

      // Check date range
      if (test.startDate && new Date() < new Date(test.startDate)) {
        return 'control'
      }
      if (test.endDate && new Date() > new Date(test.endDate)) {
        return 'control'
      }

      // Check target audience
      if (test.targetAudience) {
        if (!this.matchesTargetAudience(test.targetAudience, userId)) {
          return 'control'
        }
      }

      // Check if user already has a variant assigned
      const userKey = `${testName}_${userId || 'anonymous'}`
      if (this.userVariants.has(userKey)) {
        return this.userVariants.get(userKey)!
      }

      // Use Vercel flags if available
      if (typeof window !== 'undefined' && window.__VERCEL_FLAGS__) {
        const flagValue = window.__VERCEL_FLAGS__.get(testName)
        if (flagValue) {
          const variant = this.parseVercelFlag(flagValue, test)
          this.userVariants.set(userKey, variant)
          this.trackVariantAssignment(testName, variant, userId)
          return variant
        }
      }

      // Fallback to weighted random assignment
      const variant = this.assignRandomVariant(test)
      this.userVariants.set(userKey, variant)
      this.trackVariantAssignment(testName, variant, userId)
      
      return variant
    } catch (error) {
      ErrorHandler.handle(error, 'ABTestingService.getVariant')
      return 'control'
    }
  }

  private parseVercelFlag(flagValue: any, test: ABTestConfig): string {
    // If flag is a string, use it directly
    if (typeof flagValue === 'string') {
      return flagValue
    }

    // If flag is an object with variant assignment logic
    if (typeof flagValue === 'object' && flagValue.variant) {
      return flagValue.variant
    }

    // Fallback to weighted assignment
    return this.assignRandomVariant(test)
  }

  private assignRandomVariant(test: ABTestConfig): string {
    const random = Math.random() * 100
    let cumulativeWeight = 0

    for (const variant of test.variants) {
      cumulativeWeight += variant.weight
      if (random <= cumulativeWeight) {
        return variant.name
      }
    }

    return test.variants[0].name // Fallback to first variant
  }

  private matchesTargetAudience(targetAudience: ABTestConfig['targetAudience'], userId?: string): boolean {
    if (!targetAudience) return true

    // Check if user is new (simplified logic)
    if (targetAudience.newUsers && userId) {
      // In a real implementation, you'd check user creation date
      return true
    }

    // Check country (would need geolocation)
    if (targetAudience.country) {
      // Implementation would check user's country
      return true
    }

    // Check device type
    if (targetAudience.device) {
      if (typeof window !== 'undefined') {
        const userAgent = navigator.userAgent
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
        const isDesktop = !isMobile
        
        return targetAudience.device.some(device => {
          if (device === 'mobile' && isMobile) return true
          if (device === 'desktop' && isDesktop) return true
          return false
        })
      }
    }

    return true
  }

  private trackVariantAssignment(testName: string, variant: string, userId?: string) {
    const result: ABTestResult = {
      testName,
      variant,
      userId,
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      },
    }

    // Track with analytics
    this.analytics.track({
      name: 'ab_test_assignment',
      properties: {
        testName,
        variant,
        userId,
      },
    })

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        const existingResults = JSON.parse(localStorage.getItem('ab_test_results') || '[]')
        existingResults.push(result)
        localStorage.setItem('ab_test_results', JSON.stringify(existingResults))
      } catch (error) {
        ErrorHandler.handle(error, 'ABTestingService.trackVariantAssignment')
      }
    }
  }

  trackConversion(testName: string, conversionType: string, value?: number, userId?: string) {
    const variant = this.getVariant(testName, userId)
    
    this.analytics.track({
      name: 'ab_test_conversion',
      properties: {
        testName,
        variant,
        conversionType,
        value,
        userId,
      },
    })
  }

  getTestResults(testName: string): ABTestResult[] {
    if (typeof window !== 'undefined') {
      try {
        const results = JSON.parse(localStorage.getItem('ab_test_results') || '[]')
        return results.filter((result: ABTestResult) => result.testName === testName)
      } catch (error) {
        ErrorHandler.handle(error, 'ABTestingService.getTestResults')
      }
    }
    return []
  }

  getActiveTests(): ABTestConfig[] {
    return Array.from(this.tests.values()).filter(test => test.enabled)
  }

  isTestActive(testName: string): boolean {
    const test = this.tests.get(testName)
    return test ? test.enabled : false
  }

  forceVariant(testName: string, variant: string, userId?: string) {
    const userKey = `${testName}_${userId || 'anonymous'}`
    this.userVariants.set(userKey, variant)
    
    // Update Vercel flags if available
    if (typeof window !== 'undefined' && window.__VERCEL_FLAGS__) {
      window.__VERCEL_FLAGS__.set(testName, variant)
    }
  }

  resetUserVariants(userId?: string) {
    if (userId) {
      // Reset specific user's variants
      Array.from(this.userVariants.keys()).forEach(key => {
        if (key.endsWith(`_${userId}`)) {
          this.userVariants.delete(key)
        }
      })
    } else {
      // Reset all variants
      this.userVariants.clear()
    }
  }
}

// React hook for A/B testing
export function useABTest(testName: string, userId?: string) {
  const abTesting = ABTestingService.getInstance()
  const variant = abTesting.getVariant(testName, userId)

  return {
    variant,
    isVariant: (variantName: string) => variant === variantName,
    trackConversion: (conversionType: string, value?: number) => {
      abTesting.trackConversion(testName, conversionType, value, userId)
    },
    forceVariant: (variantName: string) => {
      abTesting.forceVariant(testName, variantName, userId)
    },
  }
}

// HOC for A/B testing components
export function withABTest<P extends object>(
  Component: React.ComponentType<P>,
  testName: string,
  variantName: string
): React.ComponentType<P> {
  return function ABTestWrapper(props: P) {
    const { variant } = useABTest(testName)
    
    if (variant === variantName) {
      return React.createElement(Component, props)
    }
    
    return null
  }
}

// Export singleton instance
export const abTesting = ABTestingService.getInstance()

// Test configurations for easy reference
export const ABTests = {
  LANDING_PAGE_HERO: 'landing_page_hero',
  PRICING_PAGE_LAYOUT: 'pricing_page_layout',
  CTA_BUTTON_TEXT: 'cta_button_text',
  ONBOARDING_FLOW: 'onboarding_flow',
  CALCULATOR_LAYOUT: 'calculator_layout',
} as const

// Utility functions
export function getABTestVariant(testName: string, userId?: string): string {
  return abTesting.getVariant(testName, userId)
}

export function trackABTestConversion(testName: string, conversionType: string, value?: number, userId?: string) {
  abTesting.trackConversion(testName, conversionType, value, userId)
}