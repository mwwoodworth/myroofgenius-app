import * as Sentry from '@sentry/nextjs'

export interface AppError {
  code: string
  message: string
  details?: any
  statusCode?: number
  timestamp: string
  userMessage?: string
}

export class CustomError extends Error {
  code: string
  statusCode: number
  userMessage?: string
  details?: any

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    userMessage?: string,
    details?: any
  ) {
    super(message)
    this.name = 'CustomError'
    this.code = code
    this.statusCode = statusCode
    this.userMessage = userMessage
    this.details = details
  }
}

export const ErrorCodes = {
  // Authentication Errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // Validation Errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Database Errors
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',
  DB_CONSTRAINT_ERROR: 'DB_CONSTRAINT_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  RECORD_ALREADY_EXISTS: 'RECORD_ALREADY_EXISTS',

  // API Errors
  API_REQUEST_FAILED: 'API_REQUEST_FAILED',
  API_RATE_LIMITED: 'API_RATE_LIMITED',
  API_TIMEOUT: 'API_TIMEOUT',
  API_UNAUTHORIZED: 'API_UNAUTHORIZED',

  // Payment Errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
  PAYMENT_INVALID_CARD: 'PAYMENT_INVALID_CARD',
  PAYMENT_INSUFFICIENT_FUNDS: 'PAYMENT_INSUFFICIENT_FUNDS',

  // File Upload Errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_INVALID: 'FILE_TYPE_INVALID',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',

  // Business Logic Errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',

  // External Service Errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  NOTIFICATION_SEND_FAILED: 'NOTIFICATION_SEND_FAILED',
} as const

export const UserMessages = {
  [ErrorCodes.AUTH_REQUIRED]: 'Please sign in to continue',
  [ErrorCodes.AUTH_INVALID]: 'Invalid credentials. Please try again.',
  [ErrorCodes.AUTH_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS]: 'You don\'t have permission to perform this action',
  
  [ErrorCodes.VALIDATION_FAILED]: 'Please check your input and try again',
  [ErrorCodes.INVALID_INPUT]: 'Invalid input provided',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields',
  
  [ErrorCodes.DB_CONNECTION_ERROR]: 'Database connection failed. Please try again later.',
  [ErrorCodes.RECORD_NOT_FOUND]: 'The requested item was not found',
  [ErrorCodes.RECORD_ALREADY_EXISTS]: 'This item already exists',
  
  [ErrorCodes.API_REQUEST_FAILED]: 'Request failed. Please try again.',
  [ErrorCodes.API_RATE_LIMITED]: 'Too many requests. Please wait a moment and try again.',
  [ErrorCodes.API_TIMEOUT]: 'Request timed out. Please try again.',
  
  [ErrorCodes.PAYMENT_FAILED]: 'Payment failed. Please check your payment details and try again.',
  [ErrorCodes.PAYMENT_CANCELLED]: 'Payment was cancelled',
  [ErrorCodes.PAYMENT_INVALID_CARD]: 'Invalid card details. Please check and try again.',
  [ErrorCodes.PAYMENT_INSUFFICIENT_FUNDS]: 'Insufficient funds. Please try a different payment method.',
  
  [ErrorCodes.FILE_TOO_LARGE]: 'File is too large. Maximum size is 10MB.',
  [ErrorCodes.FILE_TYPE_INVALID]: 'Invalid file type. Please use a supported format.',
  [ErrorCodes.FILE_UPLOAD_FAILED]: 'File upload failed. Please try again.',
  
  [ErrorCodes.BUSINESS_RULE_VIOLATION]: 'This action violates business rules',
  [ErrorCodes.OPERATION_NOT_ALLOWED]: 'This operation is not allowed',
  [ErrorCodes.QUOTA_EXCEEDED]: 'Usage quota exceeded. Please upgrade your plan.',
  
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'External service error. Please try again later.',
  [ErrorCodes.EMAIL_SEND_FAILED]: 'Failed to send email. Please try again.',
  [ErrorCodes.NOTIFICATION_SEND_FAILED]: 'Failed to send notification',
} as const

export class ErrorHandler {
  static handle(error: unknown, context?: string): AppError {
    const timestamp = new Date().toISOString()
    
    // Handle CustomError
    if (error instanceof CustomError) {
      const appError: AppError = {
        code: error.code,
        message: error.message,
        details: error.details,
        statusCode: error.statusCode,
        timestamp,
        userMessage: error.userMessage || UserMessages[error.code as keyof typeof UserMessages],
      }
      
      this.logError(appError, context)
      return appError
    }
    
    // Handle standard Error
    if (error instanceof Error) {
      const appError: AppError = {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        statusCode: 500,
        timestamp,
        userMessage: 'An unexpected error occurred. Please try again.',
      }
      
      this.logError(appError, context)
      return appError
    }
    
    // Handle unknown error types
    const appError: AppError = {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      statusCode: 500,
      timestamp,
      userMessage: 'An unexpected error occurred. Please try again.',
    }
    
    this.logError(appError, context)
    return appError
  }

  static logError(error: AppError, context?: string) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR]', {
        code: error.code,
        message: error.message,
        context,
        timestamp: error.timestamp,
        details: error.details,
      })
    }
    
    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(new Error(error.message), {
        tags: {
          errorCode: error.code,
          context,
        },
        extra: {
          details: error.details,
          statusCode: error.statusCode,
          userMessage: error.userMessage,
        },
      })
    }
  }

  static createValidationError(field: string, message: string): CustomError {
    return new CustomError(
      `Validation failed for field: ${field}`,
      ErrorCodes.VALIDATION_FAILED,
      400,
      message,
      { field }
    )
  }

  static createNotFoundError(resource: string): CustomError {
    return new CustomError(
      `${resource} not found`,
      ErrorCodes.RECORD_NOT_FOUND,
      404,
      `The requested ${resource.toLowerCase()} was not found`
    )
  }

  static createAuthError(message: string = 'Authentication required'): CustomError {
    return new CustomError(
      message,
      ErrorCodes.AUTH_REQUIRED,
      401,
      'Please sign in to continue'
    )
  }

  static createPermissionError(action: string): CustomError {
    return new CustomError(
      `Insufficient permissions for: ${action}`,
      ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS,
      403,
      'You don\'t have permission to perform this action'
    )
  }

  static createPaymentError(
    stripeError: any,
    userMessage?: string
  ): CustomError {
    let code: string = ErrorCodes.PAYMENT_FAILED
    let message = userMessage || 'Payment failed'

    // Map Stripe error codes to our error codes
    if (stripeError?.code) {
      switch (stripeError.code) {
        case 'card_declined':
          code = ErrorCodes.PAYMENT_INVALID_CARD
          message = 'Your card was declined'
          break
        case 'insufficient_funds':
          code = ErrorCodes.PAYMENT_INSUFFICIENT_FUNDS
          message = 'Insufficient funds'
          break
        case 'expired_card':
          code = ErrorCodes.PAYMENT_INVALID_CARD
          message = 'Your card has expired'
          break
        case 'processing_error':
          code = ErrorCodes.PAYMENT_FAILED
          message = 'Payment processing error'
          break
        default:
          code = ErrorCodes.PAYMENT_FAILED
          message = 'Payment failed'
      }
    }

    return new CustomError(
      stripeError?.message || 'Payment failed',
      code,
      400,
      message,
      { stripeError }
    )
  }
}

// API Response helpers
export function createErrorResponse(error: AppError) {
  return Response.json(
    {
      error: {
        code: error.code,
        message: error.userMessage || error.message,
        timestamp: error.timestamp,
      },
    },
    { status: error.statusCode || 500 }
  )
}

export function createSuccessResponse<T>(data: T, message?: string) {
  return Response.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  })
}

// Error boundary helpers
export function withErrorBoundary<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      const appError = ErrorHandler.handle(error, context)
      throw new CustomError(
        appError.message,
        appError.code,
        appError.statusCode,
        appError.userMessage,
        appError.details
      )
    }
  }
}

// React hook for error handling
export function useErrorHandler() {
  return {
    handleError: (error: unknown, context?: string) => {
      return ErrorHandler.handle(error, context)
    },
    createError: (
      message: string,
      code: string,
      statusCode: number = 500,
      userMessage?: string
    ) => {
      return new CustomError(message, code, statusCode, userMessage)
    },
  }
}