Sprint 11 — Performance & Analytics
Objective
Implement comprehensive performance optimization and analytics tracking to ensure sub-3s load times, smooth animations, and detailed user behavior insights.
File Targets

lib/analytics/posthog.ts (create)
lib/performance/optimization.ts (create)
components/analytics/Analytics.tsx (create)
next.config.js (update)
pages/_document.tsx (update)
lib/performance/image-optimization.ts (create)
lib/performance/code-splitting.ts (create)
public/sw.js (create service worker)

Step-by-Step Instructions
1. Install Analytics Dependencies
bashnpm install posthog-js @vercel/analytics web-vitals
npm install --save-dev @next/bundle-analyzer
2. Configure Next.js Performance Optimizations
javascript// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Compression
  compress: true,
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate',
          },
        ],
      },
    ];
  },
});
3. Create PostHog Analytics Integration
typescript// lib/analytics/posthog.ts
import posthog from 'posthog-js';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export class Analytics {
  private static initialized = false;

  static init() {
    if (typeof window === 'undefined' || this.initialized) return;
    
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
    
    if (!posthogKey) {
      console.warn('PostHog key not found');
      return;
    }

    posthog.init(posthogKey, {
      api_host: posthogHost,
      autocapture: true,
      capture_pageview: false, // We'll handle this manually
      capture_pageleave: true,
      disable_session_recording: false,
      enable_recording_console_log: true,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog loaded');
        }
      },
    });

    this.initialized = true;
  }

  static identify(userId: string, properties?: Record<string, any>) {
    if (!this.initialized) return;
    posthog.identify(userId, properties);
  }

  static track(event: string, properties?: Record<string, any>) {
    if (!this.initialized) return;
    posthog.capture(event, properties);
  }

  static trackPageView(url: string, properties?: Record<string, any>) {
    if (!this.initialized) return;
    posthog.capture('$pageview', {
      $current_url: url,
      ...properties,
    });
  }

  static setUserProperties(properties: Record<string, any>) {
    if (!this.initialized) return;
    posthog.people.set(properties);
  }

  static reset() {
    if (!this.initialized) return;
    posthog.reset();
  }

  static trackEvent(
    category: string,
    action: string,
    label?: stringRetryMContinueEditPlotted course for completing Sprint 11 and future tasks.3sThe user wants me to continue with the remaining content from Sprint 11 onwards. I need to complete Sprint 11 (Performance & Analytics) and then continue with any remaining sprints. Looking at the pattern, I should complete the Analytics section and then move on to any final sprints.
Based on the master context file, I should also create a Future Sprint Template as mentioned in the original request.typescript    value?: number
  ) {
    this.track(`${category}_${action}`, {
      category,
      action,
      label,
      value,
    });
  }

  static startTimer(label: string) {
    if (!this.initialized) return;
    const startTime = performance.now();
    
    return {
      end: (metadata?: Record<string, any>) => {
        const duration = performance.now() - startTime;
        this.track('timing', {
          label,
          duration,
          ...metadata,
        });
      },
    };
  }
}

// React hook for analytics
export function useAnalytics() {
  const router = useRouter();

  useEffect(() => {
    Analytics.init();

    const handleRouteChange = (url: string) => {
      Analytics.trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return {
    track: Analytics.track.bind(Analytics),
    identify: Analytics.identify.bind(Analytics),
    trackEvent: Analytics.trackEvent.bind(Analytics),
    startTimer: Analytics.startTimer.bind(Analytics),
  };
}
4. Create Performance Optimization Utilities
typescript// lib/performance/optimization.ts
import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Lazy load heavy components
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    ssr?: boolean;
    loading?: ComponentType;
  }
) {
  return dynamic(importFunc, {
    ssr: options?.ssr ?? true,
    loading: options?.loading || (() => <div className="glass-panel-loading h-32" />),
  });
}

// Intersection Observer for lazy loading
export function useLazyLoad(threshold = 0.1) {
  const [ref, setRef] = useState<Element | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return { ref: setRef, isVisible };
}

// Debounce expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function debounced(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Request idle callback wrapper
export function whenIdle(callback: () => void) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
}

// Prefetch critical resources
export function prefetchResources(urls: string[]) {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = url.endsWith('.js') ? 'script' : 
              url.endsWith('.css') ? 'style' : 'fetch';
    document.head.appendChild(link);
  });
}

// Memory usage monitoring
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  return null;
}
5. Create Image Optimization Component
tsx// lib/performance/image-optimization.ts
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  quality?: number;
  onLoad?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  quality = 85,
  onLoad,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [blurDataUrl, setBlurDataUrl] = useState<string>('');

  useEffect(() => {
    // Generate low-quality placeholder
    if (src && !src.startsWith('data:')) {
      generateBlurDataUrl(src).then(setBlurDataUrl);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800/50 animate-pulse rounded-lg" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        placeholder={blurDataUrl ? 'blur' : 'empty'}
        blurDataURL={blurDataUrl}
        onLoad={handleLoad}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  );
}

async function generateBlurDataUrl(src: string): Promise<string> {
  // This would typically call an API to generate a low-res placeholder
  // For now, return a simple gradient placeholder
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIj48c3RvcCBzdG9wLWNvbG9yPSIjMzMzIiBvZmZzZXQ9IjIwJSIgLz48c3RvcCBzdG9wLWNvbG9yPSIjMjIyIiBvZmZzZXQ9IjUwJSIgLz48c3RvcCBzdG9wLWNvbG9yPSIjMzMzIiBvZmZzZXQ9IjcwJSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiMzMzMiIC8+PHJlY3QgaWQ9InIiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0idXJsKCNnKSIgLz48L3N2Zz4=';
}
6. Create Service Worker for Offline Support
javascript// public/sw.js
const CACHE_NAME = 'myroofgenius-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/_next/static/css/styles.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          // Don't cache API calls or analytics
          if (!event.request.url.includes('/api/') && 
              !event.request.url.includes('posthog') &&
              !event.request.url.includes('sentry')) {
            cache.put(event.request, responseToCache);
          }
        });

        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/offline');
        }
      });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Sync offline analytics when back online
  const cache = await caches.open('analytics-cache');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      await fetch(request);
      await cache.delete(request);
    } catch (error) {
      console.error('Failed to sync analytics:', error);
    }
  }
}
7. Create Analytics Component
tsx// components/analytics/Analytics.tsx
import { useEffect } from 'react';
import { Analytics } from '@/lib/analytics/posthog';
import { PerformanceMonitor } from '@/lib/monitoring/performance';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize analytics
    Analytics.init();

    // Track performance metrics
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        Analytics.track('web_vitals', {
          metric: 'LCP',
          value: lastEntry.startTime,
          rating: lastEntry.startTime < 2500 ? 'good' : 
                  lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor',
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          Analytics.track('web_vitals', {
            metric: 'FID',
            value: entry.processingStart - entry.startTime,
            rating: entry.processingStart - entry.startTime < 100 ? 'good' :
                    entry.processingStart - entry.startTime < 300 ? 'needs-improvement' : 'poor',
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        Analytics.track('web_vitals', {
          metric: 'CLS',
          value: clsValue,
          rating: clsValue < 0.1 ? 'good' :
                  clsValue < 0.25 ? 'needs-improvement' : 'poor',
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }

    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration);
            Analytics.track('service_worker_registered');
          })
          .catch((error) => {
            console.error('SW registration failed:', error);
            PerformanceMonitor.captureMessage('Service Worker registration failed', 'error');
          });
      });
    }
  }, []);

  return <>{children}</>;
}
8. Update Document for Performance
tsx// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://app.posthog.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://api.mapbox.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        
        {/* Resource hints */}
        <link rel="prefetch" href="/api/estimator" as="fetch" crossOrigin="anonymous" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#0F172A" />
        
        {/* Optimize font loading */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        
        <Main />
        <NextScript />
        
        {/* Inline critical performance monitoring */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Measure Time to Interactive
              if ('PerformanceObserver' in window) {
                new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    console.log('TTI:', entry.startTime);
                  }
                }).observe({entryTypes: ['measure']});
              }
            `,
          }}
        />
      </body>
    </Html>
  );
}
Commit Message
feat(performance): implemented comprehensive performance optimization with analytics, service worker, and monitoring
QA/Acceptance Checklist

 Page loads achieve sub-3s FCP on 3G networks
 Service worker caches critical resources
 Analytics tracks all user interactions
 Web Vitals metrics are within good range
 Images lazy load with blur placeholders
 Bundle size is optimized (<200KB initial)
 Offline fallback page works correctly
 Memory usage stays under control

AI Execution Block
Codex/Operator Instructions:

Install all performance dependencies
Set NEXT_PUBLIC_POSTHOG_KEY in environment
Create manifest.json for PWA support
Generate app icons (192x192, 512x512)
Run bundle analyzer: ANALYZE=true npm run build
Test service worker on production build
Verify analytics events in PostHog dashboard

Advanced/Optional Enhancements

Implement edge caching with Vercel Edge Functions
Add resource budget monitoring
Create performance regression tests
Implement predictive prefetching
Add A/B testing for performance experiments