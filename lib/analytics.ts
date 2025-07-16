import { ErrorHandler } from './error-handler'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    plausible: (event: string, options?: { props?: Record<string, any> }) => void
  }
}

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  userId?: string
  timestamp?: string
}

export interface ConversionEvent {
  event: string
  value?: number
  currency?: string
  transactionId?: string
  items?: Array<{
    item_id: string
    item_name: string
    item_category: string
    quantity: number
    price: number
  }>
}

export class Analytics {
  private static instance: Analytics
  private isInitialized = false
  private userId: string | null = null

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics()
    }
    return Analytics.instance
  }

  async initialize(userId?: string) {
    if (this.isInitialized) return

    this.userId = userId || null
    
    try {
      // Initialize Google Analytics
      if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
        await this.initializeGoogleAnalytics()
      }

      // Initialize Plausible
      if (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
        await this.initializePlausible()
      }

      // Initialize Vercel Analytics
      if (process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID) {
        await this.initializeVercelAnalytics()
      }

      this.isInitialized = true
    } catch (error) {
      ErrorHandler.handle(error, 'Analytics.initialize')
    }
  }

  private async initializeGoogleAnalytics() {
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    
    if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
      // Load Google Analytics script
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      script.async = true
      document.head.appendChild(script)

      // Initialize gtag
      window.gtag = function() {
        // @ts-ignore
        window.dataLayer = window.dataLayer || []
        // @ts-ignore
        window.dataLayer.push(arguments)
      }

      window.gtag('js', new Date())
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
        user_id: this.userId,
      })
    }
  }

  private async initializePlausible() {
    const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
    
    if (typeof window !== 'undefined' && PLAUSIBLE_DOMAIN) {
      // Load Plausible script
      const script = document.createElement('script')
      script.src = `https://plausible.io/js/script.js`
      script.defer = true
      script.setAttribute('data-domain', PLAUSIBLE_DOMAIN)
      document.head.appendChild(script)
    }
  }

  private async initializeVercelAnalytics() {
    if (typeof window !== 'undefined') {
      // Vercel Analytics is already imported in layout.tsx
      console.log('Vercel Analytics initialized')
    }
  }

  track(event: AnalyticsEvent) {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized')
      return
    }

    try {
      // Track with Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.name, {
          event_category: event.properties?.category || 'engagement',
          event_label: event.properties?.label,
          value: event.properties?.value,
          user_id: event.userId || this.userId,
          custom_parameters: event.properties,
        })
      }

      // Track with Plausible
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible(event.name, {
          props: event.properties,
        })
      }

      // Track with custom endpoint
      this.trackCustom(event)
    } catch (error) {
      ErrorHandler.handle(error, 'Analytics.track')
    }
  }

  private async trackCustom(event: AnalyticsEvent) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          userId: event.userId || this.userId,
          timestamp: event.timestamp || new Date().toISOString(),
          url: window.location.href,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
        }),
      })
    } catch (error) {
      ErrorHandler.handle(error, 'Analytics.trackCustom')
    }
  }

  trackConversion(event: ConversionEvent) {
    if (!this.isInitialized) return

    try {
      // Track with Google Analytics Enhanced Ecommerce
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'purchase', {
          transaction_id: event.transactionId,
          value: event.value,
          currency: event.currency || 'USD',
          items: event.items,
        })
      }

      // Track with Plausible
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('Purchase', {
          props: {
            value: event.value,
            currency: event.currency,
            transactionId: event.transactionId,
          },
        })
      }
    } catch (error) {
      ErrorHandler.handle(error, 'Analytics.trackConversion')
    }
  }

  trackPageView(url?: string) {
    if (!this.isInitialized) return

    try {
      const pageUrl = url || window.location.href

      // Track with Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
          page_title: document.title,
          page_location: pageUrl,
          user_id: this.userId,
        })
      }

      // Track with Plausible
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('pageview', {
          props: {
            url: pageUrl,
          },
        })
      }
    } catch (error) {
      ErrorHandler.handle(error, 'Analytics.trackPageView')
    }
  }

  trackError(error: any, context?: string) {
    if (!this.isInitialized) return

    try {
      const errorData = {
        message: error.message || String(error),
        stack: error.stack,
        context,
        url: window.location.href,
        userId: this.userId,
      }

      // Track with Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: errorData.message,
          fatal: false,
          custom_parameters: errorData,
        })
      }

      // Track with Plausible
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('Error', {
          props: {
            message: errorData.message,
            context,
          },
        })
      }
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError)
    }
  }

  identify(userId: string, properties?: Record<string, any>) {
    this.userId = userId

    try {
      // Set user ID in Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
          user_id: userId,
          custom_parameters: properties,
        })
      }

      // Track user properties
      if (properties) {
        this.track({
          name: 'user_properties',
          properties,
          userId,
        })
      }
    } catch (error) {
      ErrorHandler.handle(error, 'Analytics.identify')
    }
  }

  setUserProperties(properties: Record<string, any>) {
    if (!this.isInitialized) return

    try {
      // Set user properties in Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('set', {
          user_properties: properties,
        })
      }
    } catch (error) {
      ErrorHandler.handle(error, 'Analytics.setUserProperties')
    }
  }
}

// Predefined events for consistency
export const AnalyticsEvents = {
  // User Actions
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  
  // Page Views
  PAGE_VIEW: 'page_view',
  
  // Engagement
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  LINK_CLICK: 'link_click',
  
  // Roofing-specific
  ESTIMATE_STARTED: 'estimate_started',
  ESTIMATE_COMPLETED: 'estimate_completed',
  CALCULATOR_USED: 'calculator_used',
  PHOTO_ANALYZED: 'photo_analyzed',
  TEMPLATE_DOWNLOADED: 'template_downloaded',
  
  // E-commerce
  PRODUCT_VIEWED: 'product_viewed',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  PURCHASE_STARTED: 'purchase_started',
  PURCHASE_COMPLETED: 'purchase_completed',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
  PAYMENT_ERROR: 'payment_error',
} as const

// React hook for analytics
export function useAnalytics() {
  const analytics = Analytics.getInstance()

  return {
    track: (event: string, properties?: Record<string, any>) => {
      analytics.track({ name: event, properties })
    },
    trackConversion: (event: ConversionEvent) => {
      analytics.trackConversion(event)
    },
    trackPageView: (url?: string) => {
      analytics.trackPageView(url)
    },
    trackError: (error: any, context?: string) => {
      analytics.trackError(error, context)
    },
    identify: (userId: string, properties?: Record<string, any>) => {
      analytics.identify(userId, properties)
    },
    setUserProperties: (properties: Record<string, any>) => {
      analytics.setUserProperties(properties)
    },
  }
}

// Initialize analytics on app start
if (typeof window !== 'undefined') {
  Analytics.getInstance().initialize()
}