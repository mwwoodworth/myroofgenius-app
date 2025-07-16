import { NextRequest, NextResponse } from 'next/server'
import { abTesting } from '@/lib/ab-testing'
import { ErrorHandler, createErrorResponse, createSuccessResponse } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testName = searchParams.get('testName')

    if (testName) {
      // Get specific test configuration
      const isActive = abTesting.isTestActive(testName)
      const variant = abTesting.getVariant(testName)
      
      return createSuccessResponse({
        testName,
        isActive,
        variant,
        timestamp: new Date().toISOString()
      })
    } else {
      // Get all active tests
      const activeTests = abTesting.getActiveTests()
      
      return createSuccessResponse({
        activeTests,
        count: activeTests.length,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    const appError = ErrorHandler.handle(error, 'GET /api/ab-testing/config')
    return createErrorResponse(appError)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testName, variant, userId } = body

    if (!testName || !variant) {
      throw ErrorHandler.createValidationError('request', 'testName and variant are required')
    }

    // Force a specific variant for a user
    abTesting.forceVariant(testName, variant, userId)

    return createSuccessResponse({
      testName,
      variant,
      userId,
      forced: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    const appError = ErrorHandler.handle(error, 'POST /api/ab-testing/config')
    return createErrorResponse(appError)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { testName, action, userId } = body

    if (!testName || !action) {
      throw ErrorHandler.createValidationError('request', 'testName and action are required')
    }

    let result: any = {}

    switch (action) {
      case 'reset':
        abTesting.resetUserVariants(userId)
        result = { action: 'reset', testName, userId }
        break
      
      case 'get_results':
        const results = abTesting.getTestResults(testName)
        result = { action: 'get_results', testName, results }
        break
      
      default:
        throw ErrorHandler.createValidationError('action', 'Invalid action')
    }

    return createSuccessResponse({
      ...result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    const appError = ErrorHandler.handle(error, 'PUT /api/ab-testing/config')
    return createErrorResponse(appError)
  }
}