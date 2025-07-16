import Stripe from 'stripe'
import { ErrorHandler, CustomError, ErrorCodes } from './error-handler'
import { Analytics, AnalyticsEvents } from './analytics'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  clientSecret: string
  metadata?: Record<string, string>
}

export interface PaymentSession {
  id: string
  url: string
  paymentStatus: string
  metadata?: Record<string, string>
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  metadata?: Record<string, string>
}

export class StripeService {
  private static instance: StripeService
  private analytics: Analytics

  constructor() {
    this.analytics = Analytics.getInstance()
  }

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService()
    }
    return StripeService.instance
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      })

      this.analytics.track({
        name: AnalyticsEvents.PURCHASE_STARTED,
        properties: {
          amount: amount,
          currency,
          paymentIntentId: paymentIntent.id,
        },
      })

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret!,
        metadata: paymentIntent.metadata,
      }
    } catch (error: any) {
      this.analytics.trackError(error, 'StripeService.createPaymentIntent')
      throw ErrorHandler.createPaymentError(error)
    }
  }

  async createCheckoutSession(
    products: Array<{
      priceId?: string
      name: string
      description: string
      amount: number
      currency?: string
      quantity?: number
    }>,
    options: {
      successUrl: string
      cancelUrl: string
      customerEmail?: string
      metadata?: Record<string, string>
      mode?: 'payment' | 'subscription'
    }
  ): Promise<PaymentSession> {
    try {
      const lineItems = products.map(product => ({
        price_data: {
          currency: product.currency || 'usd',
          unit_amount: Math.round(product.amount * 100),
          product_data: {
            name: product.name,
            description: product.description,
          },
        },
        quantity: product.quantity || 1,
      }))

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: options.mode || 'payment',
        success_url: options.successUrl,
        cancel_url: options.cancelUrl,
        customer_email: options.customerEmail,
        metadata: options.metadata,
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        shipping_address_collection: {
          allowed_countries: ['US', 'CA'],
        },
      })

      this.analytics.track({
        name: AnalyticsEvents.PURCHASE_STARTED,
        properties: {
          sessionId: session.id,
          amount: products.reduce((sum, p) => sum + p.amount, 0),
          productCount: products.length,
        },
      })

      return {
        id: session.id,
        url: session.url!,
        paymentStatus: session.payment_status,
        metadata: session.metadata || undefined,
      }
    } catch (error: any) {
      this.analytics.trackError(error, 'StripeService.createCheckoutSession')
      throw ErrorHandler.createPaymentError(error)
    }
  }

  async retrieveSession(sessionId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'payment_intent'],
      })

      return {
        id: session.id,
        paymentStatus: session.payment_status,
        paymentIntent: session.payment_intent,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        metadata: session.metadata || undefined,
      }
    } catch (error: any) {
      this.analytics.trackError(error, 'StripeService.retrieveSession')
      throw ErrorHandler.createPaymentError(error)
    }
  }

  async handleWebhook(payload: string, signature: string) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
          break
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
          break
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
          break
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
          break
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription)
          break
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return { received: true }
    } catch (error: any) {
      this.analytics.trackError(error, 'StripeService.handleWebhook')
      throw ErrorHandler.createPaymentError(error)
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    try {
      this.analytics.trackConversion({
        event: AnalyticsEvents.PURCHASE_COMPLETED,
        value: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        transactionId: paymentIntent.id,
      })

      // TODO: Update order status in database
      // TODO: Send confirmation email
      // TODO: Fulfill order
    } catch (error) {
      this.analytics.trackError(error, 'StripeService.handlePaymentSuccess')
    }
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
      this.analytics.track({
        name: AnalyticsEvents.PAYMENT_ERROR,
        properties: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          lastPaymentError: paymentIntent.last_payment_error,
        },
      })

      // TODO: Update order status in database
      // TODO: Send failure notification
    } catch (error) {
      this.analytics.trackError(error, 'StripeService.handlePaymentFailed')
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    try {
      this.analytics.trackConversion({
        event: AnalyticsEvents.PURCHASE_COMPLETED,
        value: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency || 'usd',
        transactionId: session.id,
      })

      // TODO: Process order fulfillment
      // TODO: Send confirmation email
      // TODO: Update user account
    } catch (error) {
      this.analytics.trackError(error, 'StripeService.handleCheckoutCompleted')
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    try {
      this.analytics.trackConversion({
        event: 'subscription_payment',
        value: invoice.amount_paid / 100,
        currency: invoice.currency,
        transactionId: invoice.id,
      })

      // TODO: Update subscription status
      // TODO: Send receipt email
    } catch (error) {
      this.analytics.trackError(error, 'StripeService.handleInvoicePaymentSucceeded')
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
      this.analytics.track({
        name: 'subscription_created',
        properties: {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id,
        },
      })

      // TODO: Create subscription record in database
      // TODO: Send welcome email
    } catch (error) {
      this.analytics.trackError(error, 'StripeService.handleSubscriptionCreated')
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
      this.analytics.track({
        name: 'subscription_updated',
        properties: {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id,
        },
      })

      // TODO: Update subscription record in database
    } catch (error) {
      this.analytics.trackError(error, 'StripeService.handleSubscriptionUpdated')
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
      this.analytics.track({
        name: 'subscription_cancelled',
        properties: {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          canceledAt: subscription.canceled_at,
        },
      })

      // TODO: Update subscription record in database
      // TODO: Send cancellation email
    } catch (error) {
      this.analytics.trackError(error, 'StripeService.handleSubscriptionDeleted')
    }
  }

  // Test payment methods
  async createTestPaymentMethod() {
    try {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      })

      return paymentMethod
    } catch (error: any) {
      throw ErrorHandler.createPaymentError(error)
    }
  }

  // Get payment method details
  async getPaymentMethod(paymentMethodId: string) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
      return paymentMethod
    } catch (error: any) {
      throw ErrorHandler.createPaymentError(error)
    }
  }

  // Create customer
  async createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      })

      return customer
    } catch (error: any) {
      throw ErrorHandler.createPaymentError(error)
    }
  }

  // Get customer
  async getCustomer(customerId: string) {
    try {
      const customer = await stripe.customers.retrieve(customerId)
      return customer
    } catch (error: any) {
      throw ErrorHandler.createPaymentError(error)
    }
  }
}

// Export singleton instance
export const stripeService = StripeService.getInstance()

// Test cards for development
export const TestCards = {
  SUCCESS: '4242424242424242',
  DECLINE: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED: '4000000000000069',
  PROCESSING_ERROR: '4000000000000119',
  REQUIRE_3DS: '4000002760003184',
} as const