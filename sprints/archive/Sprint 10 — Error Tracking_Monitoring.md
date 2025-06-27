Sprint 10 — Error Tracking & Monitoring (Sentry)
Objective
Implement comprehensive error tracking, performance monitoring, and user analytics with Sentry integration, providing real-time insights into platform health and user experience.
File Targets

lib/monitoring/sentry.ts (create)
pages/_app.tsx (update)
pages/_error.tsx (create)
components/monitoring/ErrorBoundary.tsx (create)
lib/monitoring/performance.ts (create)
lib/monitoring/user-tracking.ts (create)
sentry.client.config.js (create)
sentry.server.config.js (create)

Step-by-Step Instructions
1. Install and Configure Sentry
bashnpm install @sentry/nextjs
npx @sentry/wizard -i nextjs
2. Create Sentry Configuration
javascript// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Filtering
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Random plugins/extensions
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    // Facebook related
    'fb_xd_fragment',
    // Network errors
    /Failed to fetch/,
    /NetworkError/,
    /Load failed/,
  ],
  
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    // Analytics
    /google-analytics\.com/i,
    /googletagmanager\.com/i,
  ],
  
  beforeSend(event, hint) {
    // Filter out non-application errors
    if (event.exception && event.exception.values) {
      const error = event.exception.values[0];
      
      // Don't send errors from browser extensions
      if (error.stacktrace?.frames?.some(frame => 
        frame.filename?.includes('extension://') ||
        frame.filename?.includes('chrome-extension://')
      )) {
        return null;
      }
    }
    
    // Add user context
    if (typeof window !== 'undefined') {
      const user = getUserFromLocalStorage();
      if (user) {
        event.user = {
          id: user.id,
          email: user.email,
          username: user.name,
        };
      }
    }
    
    return event;
  },
});
javascript// sentry.server.config.js
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
});
3. Create Error Boundary Component
tsx// components/monitoring/ErrorBoundary.tsx
import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import GlassPanel from '@/components/ui/GlassPanel';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = Sentry.captureException(error);
    return {
      hasError: true,
      error,
      errorId: typeof errorId === 'string' ? errorId : null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to Sentry with additional context
    Sentry.withScope((scope) => {
      scope.setContext('errorBoundary', {
        componentStack: errorInfo.componentStack,
      });
      scope.setLevel('error');
      Sentry.captureException(error);
    });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
          />
        );
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
          <GlassPanel className="max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">
              Something went wrong
            </h1>
            
            <p className="text-gray-400 mb-6">
              We've been notified and are working to fix this issue.
            </p>
            
            {this.state.errorId && (
              <p className="text-xs text-gray-500 mb-6 font-mono">
                Error ID: {this.state.errorId}
              </p>
            )}
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6">
                <summary className="cursor-pointer text-sm text-gray-400 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs bg-black/50 p-4 rounded-lg overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.resetError}
                className="glass-button-primary px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              
                href="/"
                className="glass-button px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </a>
            </div>
          </GlassPanel>
        </div>
      );
    }

    return this.props.children;
  }
}
4. Create Performance Monitoring
typescript// lib/monitoring/performance.ts
import * as Sentry from '@sentry/nextjs';

export class PerformanceMonitor {
  private static transactions: Map<string, any> = new Map();

  static startTransaction(name: string, op: string = 'navigation') {
    const transaction = Sentry.startTransaction({
      name,
      op,
      data: {
        timestamp: Date.now(),
      },
    });

    Sentry.getCurrentHub().configureScope((scope) => scope.setSpan(transaction));
    this.transactions.set(name, transaction);
    
    return transaction;
  }

  static finishTransaction(name: string) {
    const transaction = this.transactions.get(name);
    if (transaction) {
      transaction.finish();
      this.transactions.delete(name);
    }
  }

  static measureApiCall(url: string, options?: RequestInit) {
    const span = Sentry.getCurrentHub().getScope()?.getSpan();
    const child = span?.startChild({
      op: 'http.client',
      description: `${options?.method || 'GET'} ${url}`,
    });

    return {
      finish: (status?: number) => {
        if (child) {
          child.setHttpStatus(status || 200);
          child.finish();
        }
      },
    };
  }

  static measureDatabaseQuery(query: string, params?: any) {
    const span = Sentry.getCurrentHub().getScope()?.getSpan();
    const child = span?.startChild({
      op: 'db.query',
      description: query,
      data: { params },
    });

    return {
      finish: () => child?.finish(),
    };
  }

  static addBreadcrumb(message: string, category: string, data?: any) {
    Sentry.addBreadcrumb({
      message,
      category,
      level: 'info',
      data,
      timestamp: Date.now() / 1000,
    });
  }

  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    Sentry.captureMessage(message, level);
  }

  static setUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser(user);
  }

  static clearUser() {
    Sentry.setUser(null);
  }

  static setContext(key: string, context: any) {
    Sentry.setContext(key, context);
  }

  static addTag(key: string, value: string) {
    Sentry.setTag(key, value);
  }
}

// Web Vitals tracking
export function reportWebVitals(metric: any) {
  const { id, name, label, value } = metric;

  // Send to Sentry
  Sentry.captureMessage(`Web Vital: ${name}`, 'info');
  Sentry.setContext('webVital', {
    id,
    name,
    label,
    value,
  });

  // You can also send to analytics
  if (window.gtag) {
    window.gtag('event', name, {
      event_category: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_label: id,
      non_interaction: true,
    });
  }
}
5. Create User Tracking
typescript// lib/monitoring/user-tracking.ts
import * as Sentry from '@sentry/nextjs';

interface UserAction {
  action: string;
  category: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export class UserTracking {
  static trackAction({ action, category, label, value, metadata }: UserAction) {
    // Add breadcrumb for Sentry
    Sentry.addBreadcrumb({
      message: action,
      category: `user.${category}`,
      level: 'info',
      data: {
        label,
        value,
        ...metadata,
      },
    });

    // Also send to analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
        ...metadata,
      });
    }
  }

  static trackPageView(url: string, title?: string) {
    const transaction = Sentry.startTransaction({
      name: title || url,
      op: 'pageload',
      data: {
        url,
        title,
      },
    });

    transaction.finish();

    this.trackAction({
      action: 'page_view',
      category: 'navigation',
      label: url,
      metadata: { title },
    });
  }

  static trackError(error: Error, context?: Record<string, any>) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('errorContext', context);
      }
      Sentry.captureException(error);
    });
  }

  static trackConversion(conversionType: string, value?: number) {
    this.trackAction({
      action: 'conversion',
      category: 'business',
      label: conversionType,
      value,
    });

    // Set tag for filtering in Sentry
    Sentry.setTag('conversion', conversionType);
  }

  static startSession(userId: string, userInfo?: any) {
    Sentry.setUser({
      id: userId,
      ...userInfo,
    });

    this.trackAction({
      action: 'session_start',
      category: 'user',
      metadata: { userId },
    });
  }

  static endSession() {
    this.trackAction({
      action: 'session_end',
      category: 'user',
    });

    Sentry.setUser(null);
  }
}
6. Update App Component
tsx// pages/_app.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import ErrorBoundary from '@/components/monitoring/ErrorBoundary';
import { PerformanceMonitor, reportWebVitals } from '@/lib/monitoring/performance';
import { UserTracking } from '@/lib/monitoring/user-tracking';
import '@/styles/globals.css';

export { reportWebVitals };

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Track page views
    const handleRouteChange = (url: string) => {
      UserTracking.trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    // Set up performance monitoring
    const transaction = PerformanceMonitor.startTransaction(
      `${router.pathname} - Initial Load`,
      'pageload'
    );

    // Simulate some async operations
    Promise.all([
      // Your initialization code here
    ]).then(() => {
      PerformanceMonitor.finishTransaction(`${router.pathname} - Initial Load`);
    });
  }, []);

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;
7. Create Custom Error Page
tsx// pages/_error.tsx
import { NextPageContext } from 'next';
import NextErrorComponent from 'next/error';
import * as Sentry from '@sentry/nextjs';
import GlassPanel from '@/components/ui/GlassPanel';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorProps {
  statusCode: number;
  hasGetInitialPropsRun: boolean;
  err?: Error;
}

const CustomErrorComponent = ({ statusCode, hasGetInitialPropsRun, err }: ErrorProps) => {
  if (!hasGetInitialPropsRun && err) {
    // getInitialProps has run but failed
    // This captures runtime errors on the client and server
    Sentry.captureException(err);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-4">
      <GlassPanel className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-4xl font-bold mb-2">
          {statusCode}
        </h1>
        
        <p className="text-xl mb-6">
          {statusCode === 404
            ? 'Page not found'
            : statusCode === 500
            ? 'Internal server error'
            : 'An error occurred'}
        </p>
        
        <p className="text-gray-400 mb-8">
          {statusCode === 404
            ? "The page you're looking for doesn't exist."
            : "We're working to fix this issue. Please try again later."}
        </p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="glass-button-primary px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          
            href="/"
            className="glass-button px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </a>
        </div>
      </GlassPanel>
    </div>
  );
};

CustomErrorComponent.getInitialProps = async (context: NextPageContext) => {
  const errorInitialProps = await NextErrorComponent.getInitialProps(context);

  const { res, err, asPath } = context;

  // Workaround for https://github.com/vercel/next.js/issues/8592
  errorInitialProps.hasGetInitialPropsRun = true;

  if (err) {
    Sentry.captureException(err);
    await Sentry.flush(2000);
    return errorInitialProps;
  }

  // If this point is reached, getInitialProps was called without a valid err.
  // This can happen when navigating to a non-existent page.
  Sentry.captureException(
    new Error(`_error.js getInitialProps missing data at path: ${asPath}`)
  );
  await Sentry.flush(2000);

  return errorInitialProps;
};

export default CustomErrorComponent;
Commit Message
feat(monitoring): integrated Sentry for comprehensive error tracking, performance monitoring, and user analytics
QA/Acceptance Checklist

 Sentry captures all unhandled errors
 Error boundary displays user-friendly error pages
 Performance metrics are tracked for key operations
 User actions create breadcrumbs in Sentry
 Session replay works for error sessions
 Source maps are uploaded for readable stack traces
 Error filtering excludes browser extension errors
 Custom error page matches glassmorphic design

AI Execution Block
Codex/Operator Instructions:

Run Sentry wizard: npx @sentry/wizard -i nextjs
Set SENTRY_DSN in .env.local and Vercel
Configure Sentry project settings on sentry.io
Test error boundary with intentional errors
Verify source map uploads in production build
Check Sentry dashboard for incoming events
Test performance monitoring on slow operations

Advanced/Optional Enhancements

Add custom Sentry integrations for specific tools
Implement error recovery strategies
Create error notification system for critical issues
Add performance budgets with alerts
Build error analytics dashboard