import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

export interface WebVitalsMetrics {
  CLS: number | null
  FCP: number | null
  INP: number | null
  LCP: number | null
  TTFB: number | null
}

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals'

function getConnectionSpeed() {
  return 'connection' in navigator &&
    navigator['connection' as keyof Navigator] &&
    'effectiveType' in (navigator['connection' as keyof Navigator] as any)
    ? (navigator['connection' as keyof Navigator] as any).effectiveType
    : ''
}

export function sendToAnalytics(metric: any, options: any) {
  const page = Object.entries(options.params).reduce(
    (acc, [key, value]) => acc.replace(value as string, `[${key}]`),
    options.path
  )

  const body = {
    dsn: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    id: metric.id,
    page,
    href: location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  }

  if (process.env.NODE_ENV === 'production') {
    fetch(vitalsUrl, {
      body: JSON.stringify(body),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric.name, metric.value, {
      ...metric,
      page,
      speed: getConnectionSpeed(),
    })
  }
}

export function reportWebVitals() {
  try {
    onCLS((metric) => sendToAnalytics(metric, { path: window.location.pathname, params: {} }))
    onFCP((metric) => sendToAnalytics(metric, { path: window.location.pathname, params: {} }))
    onINP((metric) => sendToAnalytics(metric, { path: window.location.pathname, params: {} }))
    onLCP((metric) => sendToAnalytics(metric, { path: window.location.pathname, params: {} }))
    onTTFB((metric) => sendToAnalytics(metric, { path: window.location.pathname, params: {} }))
  } catch (err) {
    console.error('[Web Vitals] Failed to log metrics', err)
  }
}

// Performance marks for custom metrics
export function measurePerformance(markName: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(markName)
  }
}

export function measureDuration(startMark: string, endMark: string, measureName: string) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    try {
      performance.measure(measureName, startMark, endMark)
      const measure = performance.getEntriesByName(measureName)[0]
      console.log(`[Performance] ${measureName}: ${measure.duration.toFixed(2)}ms`)
      return measure.duration
    } catch (err) {
      console.error('[Performance] Measurement failed', err)
    }
  }
  return null
}

// Get current Web Vitals snapshot
export function getCurrentWebVitals(): WebVitalsMetrics {
  return {
    CLS: null,
    FCP: null,
    INP: null,
    LCP: null,
    TTFB: null,
  }
}