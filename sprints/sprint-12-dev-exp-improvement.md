Sprint 12: Developer Experience Improvements
markdown# Sprint 12: Developer Experience Improvements

## Objective
Enhance developer experience by addressing ESLint warnings, implementing proper error tracking with Sentry, and ensuring test suites are passing.

## Critical Context for Codex
- Address all ESLint warnings properly instead of disabling them
- Implement Sentry for production error tracking
- Ensure all tests pass before deployment
- Remove legacy/dead code

## Task 1: Fix ESLint Warnings

### Files to Modify:
1. `src/components/CopilotPanel.tsx`
2. `src/components/marketplace/Marketplace.tsx`
3. Any other files with `eslint-disable` comments

### Implementation:

#### Fix exhaustive-deps warnings in CopilotPanel.tsx:
```typescript
// Replace the useEffect with proper dependencies
useEffect(() => {
  const loadHistory = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/copilot/history/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };
  
  loadHistory();
}, [sessionId]); // Proper dependency array

// Use useCallback for event handlers
const handleSubmit = useCallback(async (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim() || isLoading) return;
  
  // ... rest of the function
}, [input, isLoading, sessionId, messages, role]);
Task 2: Implement Sentry Error Tracking
Create src/lib/sentry.ts:
typescriptimport * as Sentry from '@sentry/nextjs';

export function initSentry() {
  const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured');
    return;
  }
  
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
    
    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      return event;
    },
    
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.nextRouterInstrumentation,
      }),
    ],
  });
}

export { Sentry };
Update app/layout.tsx:
typescriptimport { initSentry } from '@/lib/sentry';

// Initialize Sentry
if (typeof window !== 'undefined') {
  initSentry();
}
Create sentry.client.config.ts:
typescriptimport * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
Create sentry.server.config.ts:
typescriptimport * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
});
Create sentry.edge.config.ts:
typescriptimport * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
});
Task 3: Remove Legacy Code
Delete src/config/validate-env.js:
This file contains Create React App conventions not used in Next.js.
Clean up unused imports and variables:
bash# Run these commands to identify unused code
npx eslint . --fix
npx tsc --noEmit
Task 4: Fix and Run Tests
Update test scripts in package.json:
json{
  "scripts": {
    "test": "jest",
    "test:e2e": "playwright test",
    "test:ci": "jest --ci --coverage && playwright test"
  }
}
Fix homepage test if needed:
typescript// tests/e2e/homepage.spec.ts
import { test, expect } from '@playwright/test';

test('homepage has correct tagline', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Your AI-Powered Roofing Assistant');
});
Task 5: Add Error Boundaries
Create src/components/ErrorBoundary.tsx:
typescript'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback) {
        return <Fallback error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            We're sorry for the inconvenience. Please try refreshing the page.
          </p>
          <Button onClick={this.resetError}>Try again</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
Wrap app in ErrorBoundary in app/layout.tsx:
typescriptimport { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          {/* existing providers and children */}
        </ErrorBoundary>
      </body>
    </html>
  );
}
Validation Steps

Run npm run lint and ensure no warnings
Run npm test and ensure all tests pass
Run npm run test:e2e and ensure e2e tests pass
Check Sentry dashboard for test error capture
Verify error boundaries work by triggering a test error

Success Criteria

 All ESLint warnings resolved properly
 Sentry integration capturing errors in dev/prod
 All tests passing
 Legacy code removed
 Error boundaries protecting user experience