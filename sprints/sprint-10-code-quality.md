# Sprint 10: Code Quality & Best Practices

## Objective
Improve code quality by fixing TypeScript issues, implementing proper error handling, removing dead code, and establishing consistent patterns throughout the codebase.

## Critical Context for Codex
- **Current Issues**:
  - Several uses of `any` type that should be properly typed
  - Silent error catches that mask problems
  - Non-null assertions (!) used unsafely
  - Legacy code referencing REACT_APP_* variables
  - Inconsistent error handling patterns
- **Solution**: Implement strict TypeScript, comprehensive error handling, and clean up legacy code

## Implementation Tasks

### Task 1: Create Proper TypeScript Definitions
Create file: `types/global.d.ts`

```typescript
// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  
  start(): void
  stop(): void
  abort(): void
  
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition
}

interface Window {
  SpeechRecognition: SpeechRecognitionConstructor
  webkitSpeechRecognition: SpeechRecognitionConstructor
}

// Supabase Database types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          image_url: string | null
          file_url: string | null
          is_active: boolean
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      orders: {
        Row: {
          id: string
          user_id: string
          product_id: string
          stripe_session_id: string | null
          stripe_payment_intent: string | null
          stripe_checkout_url: string | null
          amount: number
          currency: string
          quantity: number
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          customer_email: string | null
          completed_at: string | null
          error_message: string | null
          metadata: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      downloads: {
        Row: {
          id: string
          token: string
          order_id: string
          user_id: string
          product_id: string
          expires_at: string
          download_count: number
          max_downloads: number
          last_downloaded_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['downloads']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['downloads']['Insert']>
      }
      roof_analyses: {
        Row: {
          id: string
          user_id: string
          address: string | null
          analysis_data: Json
          map_image_url: string | null
          thumbnail_url: string | null
          raw_analysis: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['roof_analyses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['roof_analyses']['Insert']>
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string
          subject: string
          description: string
          status: 'open' | 'in_progress' | 'closed'
          priority: 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['support_tickets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['support_tickets']['Insert']>
      }
    }
  }
}
```

### Task 2: Create Error Handling Service
Create file: `app/lib/error-service.ts`

```typescript
import { getEnv } from './env'

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'AUTH_ERROR', 401)
    this.name = 'AuthError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT', 429)
    this.name = 'RateLimitError'
  }
}

interface ErrorLogEntry {
  error: Error | AppError
  context?: Record<string, any>
  userId?: string
  url?: string
  method?: string
}

export class ErrorService {
  private static instance: ErrorService
  
  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService()
    }
    return ErrorService.instance
  }

  async logError({ error, context, userId, url, method }: ErrorLogEntry): Promise<void> {
    const env = getEnv()
    
    // Console log in development
    if (env.NODE_ENV === 'development') {
      console.error('Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context,
        userId,
        url,
        method
      })
    }

    // Send to monitoring service
    if (env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry is configured separately
      // This is just a placeholder for the logging
    }

    // Send critical errors to webhook
    if (env.MAKE_WEBHOOK_URL && this.isCriticalError(error)) {
      try {
        await fetch(env.MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'critical_error',
            error: {
              name: error.name,
              message: error.message,
              code: error instanceof AppError ? error.code : 'UNKNOWN',
              statusCode: error instanceof AppError ? error.statusCode : 500
            },
            context,
            userId,
            url,
            method,
            timestamp: new Date().toISOString()
          })
        })
      } catch (webhookError) {
        console.error('Failed to send error webhook:', webhookError)
      }
    }
  }

  private isCriticalError(error: Error): boolean {
    // Define what constitutes a critical error
    if (error instanceof AppError) {
      return error.statusCode >= 500
    }
    
    // Check for specific error types
    const criticalPatterns = [
      /database/i,
      /stripe/i,
      /payment/i,
      /supabase/i,
      /auth/i
    ]
    
    return criticalPatterns.some(pattern => 
      pattern.test(error.message) || pattern.test(error.name)
    )
  }

  handleApiError(error: unknown): { error: string; details?: any; statusCode: number } {
    // Log the error
    this.logError({ 
      error: error instanceof Error ? error : new Error(String(error)) 
    })

    // Handle known errors
    if (error instanceof AppError) {
      return {
        error: error.message,
        details: error.details,
        statusCode: error.statusCode
      }
    }

    // Handle Stripe errors
    if (error && typeof error === 'object' && 'type' in error && String(error.type).includes('Stripe')) {
      return {
        error: 'Payment processing error',
        details: env.NODE_ENV === 'development' ? error : undefined,
        statusCode: 400
      }
    }

    // Handle Supabase errors
    if (error && typeof error === 'object' && 'code' in error && String(error.code).startsWith('PGRST')) {
      return {
        error: 'Database error',
        details: env.NODE_ENV === 'development' ? error : undefined,
        statusCode: 500
      }
    }

    // Default error
    return {
      error: 'An unexpected error occurred',
      statusCode: 500
    }
  }
}

export const errorService = ErrorService.getInstance()
```

### Task 3: Fix TypeScript Issues in CopilotPanel
Update: `components/copilot/CopilotPanel.tsx`

```typescript
'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Mic, MicOff, User, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

// Define proper types
interface Message {
  role: 'user' | 'assistant'
  content: string
}

const ROLES = [
  { value: 'field', label: 'Field Technician', icon: '🔧' },
  { value: 'pm', label: 'Project Manager', icon: '📊' },
  { value: 'exec', label: 'Executive', icon: '💼' },
] as const

type Role = typeof ROLES[number]['value']

// Get Speech Recognition constructor with proper typing
function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if ('SpeechRecognition' in window) {
    return window.SpeechRecognition
  }
  if ('webkitSpeechRecognition' in window) {
    return window.webkitSpeechRecognition
  }
  return null
}

export function CopilotPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<Role>('field')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const { user } = useAuth()

  // Properly typed quick actions
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
    exec: [
      'Show best-selling template',
      'Market analysis summary',
      'Revenue optimization tips',
    ],
  }

  useEffect(() => {
    if (user && isOpen && !sessionId) {
      loadRecentSession().catch(error => {
        console.error('Failed to load session:', error)
      })
    }
  }, [user, isOpen, sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const loadRecentSession = async () => {
    try {
      const response = await fetch('/api/copilot')
      if (!response.ok) {
        throw new Error(`Failed to load sessions: ${response.statusText}`)
      }

      const { sessions } = await response.json()
      if (sessions && sessions.length > 0) {
        const recentSession = sessions[0]
        setSessionId(recentSession.id)
        setRole(recentSession.metadata?.role || 'field')
        
        const messagesResponse = await fetch(`/api/copilot?sessionId=${recentSession.id}`)
        if (messagesResponse.ok) {
          const { messages: sessionMessages } = await messagesResponse.json()
          setMessages(sessionMessages.map((m: any) => ({
            role: m.role as Message['role'],
            content: m.content
          })))
        }
      }
    } catch (error) {
      errorService.logError({
        error: error instanceof Error ? error : new Error('Failed to load session'),
        context: { component: 'CopilotPanel', action: 'loadRecentSession' }
      })
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId,
          role
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let assistantMessage = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        
        const sessionMatch = chunk.match(/\[SESSION_ID:([^\]]+)\]/)
        if (sessionMatch) {
          setSessionId(sessionMatch[1])
          assistantMessage += chunk.replace(sessionMatch[0], '')
        } else {
          assistantMessage += chunk
        }

        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          
          if (lastMessage?.role === 'assistant') {
            lastMessage.content = assistantMessage.trim()
          } else {
            newMessages.push({ 
              role: 'assistant', 
              content: assistantMessage.trim() 
            })
          }
          
          return newMessages
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
      
      errorService.logError({
        error: error instanceof Error ? error : new Error('Copilot message failed'),
        context: { component: 'CopilotPanel', action: 'sendMessage', role }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startListening = () => {
    const SpeechRecognitionConstructor = getSpeechRecognition()
    
    if (!SpeechRecognitionConstructor) {
      console.warn('Speech recognition not supported')
      return
    }

    try {
      const recognition = new SpeechRecognitionConstructor()
      recognitionRef.current = recognition
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event)
        setIsListening(false)
      }
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript || ''
        if (transcript) {
          setInput(transcript)
        }
      }
      
      recognition.start()
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      errorService.logError({
        error: error instanceof Error ? error : new Error('Speech recognition failed'),
        context: { component: 'CopilotPanel', action: 'startListening' }
      })
    }
  }

  const clearSession = () => {
    setMessages([])
    setSessionId(null)
  }

  if (!user) return null

  // Rest of the component remains the same...
  return (
    <>
      {/* Component JSX */}
    </>
  )
}
```

### Task 4: Remove Legacy Environment Validation
Delete: `src/config/validate-env.js` (if exists)

Update: `scripts/validate-env.ts` to remove legacy checks:

```typescript
#!/usr/bin/env node
import { config } from 'dotenv'
import { resolve } from 'path'
import { envSchema, featureRequirements } from '../app/lib/env-schema'
import chalk from 'chalk'

// Remove any REACT_APP_ references
const DEPRECATED_PREFIXES = ['REACT_APP_', 'GATSBY_', 'GRIDSOME_']

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local'
config({ path: resolve(process.cwd(), envFile) })

interface ValidationResult {
  success: boolean
  errors: string[]
  warnings: string[]
  deprecated: string[]
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
    deprecated: [],
    features: {}
  }

  // Check for deprecated variables
  Object.keys(process.env).forEach(key => {
    if (DEPRECATED_PREFIXES.some(prefix => key.startsWith(prefix))) {
      result.deprecated.push(key)
    }
  })

  try {
    // Parse and validate all environment variables
    const env = envSchema.parse(process.env)

    // ... rest of validation logic
  } catch (error) {
    // ... error handling
  }

  return result
}

// Update main function to show deprecated warnings
function main() {
  console.log(chalk.blue('\n🔍 Validating Environment Variables...\n'))

  const result = validateEnvironment()

  // Display deprecated variables
  if (result.deprecated.length > 0) {
    console.log(chalk.yellow('⚠️  Deprecated variables found:'))
    result.deprecated.forEach(key => {
      console.log(chalk.yellow(`   • ${key} - Remove this legacy variable`))
    })
    console.log()
  }

  // ... rest of output
}
```

### Task 5: Implement Comprehensive Error Boundaries
Create file: `app/components/ErrorBoundary.tsx`

```typescript
'use client'

import React from 'react'
import { errorService } from '@/lib/error-service'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorService.logError({
      error,
      context: {
        componentStack: errorInfo.componentStack,
        digest: (errorInfo as any).digest // Next.js specific
      }
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} reset={this.handleReset} />
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.handleReset} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            We encountered an unexpected error. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-200">
                Error details
              </summary>
              <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto">
                {error.stack || error.message}
              </pre>
            </details>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}

// Hook for using error boundary
export function useErrorHandler() {
  return (error: Error) => {
    throw error // This will be caught by the nearest error boundary
  }
}
```

### Task 6: Update API Routes with Error Handling
Example update for `app/api/marketplace/recommendations/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-route-handler'
import { errorService, ValidationError, AuthError } from '@/lib/error-service'

export async function GET(request: Request) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new AuthError()
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Build query
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6)

    if (category) {
      // Validate category exists
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()

      if (!categoryData) {
        throw new ValidationError('Invalid category')
      }

      query = query.eq('category_id', categoryData.id)
    }

    const { data: products, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      products: products || [],
      category 
    })

  } catch (error) {
    const { error: errorMessage, details, statusCode } = errorService.handleApiError(error)
    
    return NextResponse.json(
      { error: errorMessage, details },
      { status: statusCode }
    )
  }
}
```

## Verification Steps for Codex

1. **Check TypeScript compilation**:
   ```bash
   npm run type-check
   # Should complete with no errors
   ```

2. **Test error handling**:
   - Trigger various errors (auth, validation, etc.)
   - Verify errors are logged properly
   - Check error boundaries catch component errors

3. **Verify no `any` types remain**:
   ```bash
   # Search for remaining any types
   grep -r "any" --include="*.ts" --include="*.tsx" app/ components/
   ```

4. **Test Speech Recognition**:
   - Open Copilot panel
   - Use voice input
   - Verify no TypeScript errors

5. **Check for legacy code**:
   ```bash
   # Search for REACT_APP_ references
   grep -r "REACT_APP_" --include="*.ts" --include="*.tsx" --include="*.js" .
   ```

6. **Monitor error logs**:
   - Check console for proper error logging
   - Verify webhook alerts fire for critical errors
   - Ensure no silent failures

## Notes for Next Sprint
Next, we'll fix feature flags and configuration alignment (Sprint 11) to ensure consistent naming and proper feature toggling.