import { NextRequest, NextResponse } from 'next/server'
import { Analytics } from '@/lib/analytics'
import { ErrorHandler, createErrorResponse, createSuccessResponse } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      testName,
      variant,
      event,
      value,
      userId,
      metadata
    } = body

    // Validate required fields
    if (!testName || !variant || !event) {
      throw ErrorHandler.createValidationError('request', 'testName, variant, and event are required')
    }

    // Initialize analytics
    const analytics = Analytics.getInstance()

    // Track the A/B test event
    analytics.track({
      name: `ab_test_${event}`,
      properties: {
        testName,
        variant,
        value,
        userId,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent'),
        ip: request.ip,
        ...metadata
      },
      userId
    })

    // Track conversion events separately
    if (event === 'conversion') {
      analytics.trackConversion({
        event: 'ab_test_conversion',
        value,
        transactionId: `${testName}_${variant}_${Date.now()}`,
        items: [{
          item_id: testName,
          item_name: `${testName} - ${variant}`,
          item_category: 'ab_test',
          quantity: 1,
          price: value || 0
        }]
      })
    }

    return createSuccessResponse({
      tracked: true,
      testName,
      variant,
      event
    })

  } catch (error) {
    const appError = ErrorHandler.handle(error, 'POST /api/ab-testing/track')
    return createErrorResponse(appError)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testName = searchParams.get('testName')
    const variant = searchParams.get('variant')
    const userId = searchParams.get('userId')

    // This would typically fetch from a database
    // For now, return mock data
    const mockData = {
      testName: testName || 'landing_page_hero',
      variant: variant || 'control',
      userId: userId || 'anonymous',
      events: [
        {
          event: 'assignment',
          timestamp: new Date().toISOString(),
          metadata: {
            userAgent: request.headers.get('user-agent'),
            ip: request.ip
          }
        }
      ]
    }

    return createSuccessResponse(mockData)

  } catch (error) {
    const appError = ErrorHandler.handle(error, 'GET /api/ab-testing/track')
    return createErrorResponse(appError)
  }
}