import { NextRequest, NextResponse } from 'next/server'
import { abTesting } from '@/lib/ab-testing'

export function abTestingMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Get user ID from cookies or generate anonymous ID
  const userId = request.cookies.get('user_id')?.value || 
    request.cookies.get('anonymous_id')?.value ||
    generateAnonymousId()
  
  // Set anonymous ID cookie if not exists
  if (!request.cookies.get('anonymous_id')?.value) {
    response.cookies.set('anonymous_id', userId, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  }
  
  // Get active tests and assign variants
  const activeTests = abTesting.getActiveTests()
  
  activeTests.forEach(test => {
    const variant = abTesting.getVariant(test.name, userId)
    
    // Set variant in response headers for client-side access
    response.headers.set(`x-ab-test-${test.name}`, variant)
    
    // Set variant in cookies for persistence
    response.cookies.set(`ab_test_${test.name}`, variant, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  })
  
  return response
}

function generateAnonymousId(): string {
  return 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// Route-specific A/B test configurations
export const routeABTests = {
  '/': ['landing_page_hero', 'cta_button_text'],
  '/pricing': ['pricing_page_layout', 'cta_button_text'],
  '/calculator': ['calculator_layout', 'cta_button_text'],
  '/onboarding': ['onboarding_flow'],
} as const

export function getRouteABTests(pathname: string): string[] {
  const tests = routeABTests[pathname as keyof typeof routeABTests]
  return tests ? [...tests] : []
}

// A/B test targeting rules
export function shouldParticipateInTest(
  testName: string,
  request: NextRequest,
  userId: string
): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer') || ''
  
  // Basic bot detection
  if (userAgent.includes('bot') || userAgent.includes('crawler')) {
    return false
  }
  
  // Test-specific targeting
  switch (testName) {
    case 'landing_page_hero':
      // Only for new users coming from specific sources
      return !userId.startsWith('user_') && (
        referer.includes('google.com') ||
        referer.includes('facebook.com') ||
        referer.includes('linkedin.com')
      )
    
    case 'pricing_page_layout':
      // Only for users who haven't seen pricing page before
      return !request.cookies.get('visited_pricing')?.value
    
    case 'calculator_layout':
      // All users can participate
      return true
    
    case 'onboarding_flow':
      // Only for new registered users
      return userId.startsWith('user_')
    
    default:
      return true
  }
}

// Statistical significance calculation
export function calculateSignificance(
  controlConversions: number,
  controlParticipants: number,
  testConversions: number,
  testParticipants: number
): {
  pValue: number
  isSignificant: boolean
  confidenceLevel: number
} {
  const controlRate = controlConversions / controlParticipants
  const testRate = testConversions / testParticipants
  
  // Simplified z-test calculation
  const pooledRate = (controlConversions + testConversions) / (controlParticipants + testParticipants)
  const pooledVariance = pooledRate * (1 - pooledRate)
  
  const standardError = Math.sqrt(pooledVariance * (1/controlParticipants + 1/testParticipants))
  const zScore = Math.abs(testRate - controlRate) / standardError
  
  // Approximate p-value calculation
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)))
  const isSignificant = pValue < 0.05
  const confidenceLevel = (1 - pValue) * 100
  
  return {
    pValue,
    isSignificant,
    confidenceLevel: Math.min(confidenceLevel, 99.9)
  }
}

// Normal cumulative distribution function approximation
function normalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.sqrt(2)))
}

// Error function approximation
function erf(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  
  const sign = x >= 0 ? 1 : -1
  x = Math.abs(x)
  
  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  
  return sign * y
}

// Minimum detectable effect calculation
export function calculateMinimumDetectableEffect(
  baselineConversion: number,
  participants: number,
  alpha: number = 0.05,
  power: number = 0.8
): number {
  // Simplified MDE calculation
  const zAlpha = 1.96 // 95% confidence
  const zBeta = 0.84 // 80% power
  
  const pooledVariance = baselineConversion * (1 - baselineConversion)
  const standardError = Math.sqrt(2 * pooledVariance / participants)
  
  const mde = (zAlpha + zBeta) * standardError
  
  return mde
}

// Sample size calculation
export function calculateSampleSize(
  baselineConversion: number,
  minimumDetectableEffect: number,
  alpha: number = 0.05,
  power: number = 0.8
): number {
  const zAlpha = 1.96 // 95% confidence
  const zBeta = 0.84 // 80% power
  
  const p1 = baselineConversion
  const p2 = baselineConversion + minimumDetectableEffect
  
  const pooledP = (p1 + p2) / 2
  const pooledVariance = pooledP * (1 - pooledP)
  
  const numerator = Math.pow(zAlpha + zBeta, 2) * 2 * pooledVariance
  const denominator = Math.pow(p2 - p1, 2)
  
  return Math.ceil(numerator / denominator)
}