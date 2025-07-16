/**
 * Stripe Integration Test Suite
 * 
 * Tests the Stripe payment integration including:
 * - Payment intent creation
 * - Checkout session creation
 * - Webhook handling
 * - Error handling
 */

import { stripeService, TestCards } from '../lib/stripe.js'
import { ErrorHandler } from '../lib/error-handler.js'

describe('Stripe Integration Tests', () => {
  let testPaymentIntent
  let testCheckoutSession
  let testCustomer

  beforeAll(async () => {
    // Setup test data
    console.log('Setting up Stripe integration tests...')
  })

  afterAll(async () => {
    // Cleanup test data
    console.log('Cleaning up Stripe integration tests...')
  })

  describe('Payment Intent Creation', () => {
    test('should create payment intent successfully', async () => {
      const amount = 29.99
      const currency = 'usd'
      const metadata = { test: 'true', planType: 'starter' }

      const paymentIntent = await stripeService.createPaymentIntent(
        amount,
        currency,
        metadata
      )

      expect(paymentIntent).toBeDefined()
      expect(paymentIntent.amount).toBe(amount)
      expect(paymentIntent.currency).toBe(currency)
      expect(paymentIntent.clientSecret).toBeDefined()
      expect(paymentIntent.metadata).toEqual(metadata)

      testPaymentIntent = paymentIntent
    })

    test('should handle invalid amount', async () => {
      await expect(
        stripeService.createPaymentIntent(-10, 'usd')
      ).rejects.toThrow()
    })

    test('should handle invalid currency', async () => {
      await expect(
        stripeService.createPaymentIntent(29.99, 'invalid')
      ).rejects.toThrow()
    })
  })

  describe('Checkout Session Creation', () => {
    test('should create checkout session successfully', async () => {
      const products = [
        {
          name: 'MyRoofGenius Professional',
          description: 'Professional roofing software plan',
          amount: 79.99,
          currency: 'usd',
          quantity: 1
        }
      ]

      const options = {
        successUrl: 'https://myroofgenius.com/success',
        cancelUrl: 'https://myroofgenius.com/cancel',
        customerEmail: 'test@example.com',
        metadata: { test: 'true' }
      }

      const session = await stripeService.createCheckoutSession(products, options)

      expect(session).toBeDefined()
      expect(session.url).toBeDefined()
      expect(session.paymentStatus).toBe('unpaid')
      expect(session.metadata).toEqual(options.metadata)

      testCheckoutSession = session
    })

    test('should handle empty products array', async () => {
      const options = {
        successUrl: 'https://myroofgenius.com/success',
        cancelUrl: 'https://myroofgenius.com/cancel'
      }

      await expect(
        stripeService.createCheckoutSession([], options)
      ).rejects.toThrow()
    })

    test('should handle invalid URLs', async () => {
      const products = [
        {
          name: 'Test Product',
          description: 'Test description',
          amount: 29.99,
          quantity: 1
        }
      ]

      const options = {
        successUrl: 'invalid-url',
        cancelUrl: 'invalid-url'
      }

      await expect(
        stripeService.createCheckoutSession(products, options)
      ).rejects.toThrow()
    })
  })

  describe('Customer Management', () => {
    test('should create customer successfully', async () => {
      const email = 'test@example.com'
      const name = 'Test User'
      const metadata = { test: 'true' }

      const customer = await stripeService.createCustomer(email, name, metadata)

      expect(customer).toBeDefined()
      expect(customer.email).toBe(email)
      expect(customer.name).toBe(name)
      expect(customer.metadata).toEqual(metadata)

      testCustomer = customer
    })

    test('should retrieve customer successfully', async () => {
      if (!testCustomer) {
        throw new Error('Test customer not created')
      }

      const customer = await stripeService.getCustomer(testCustomer.id)

      expect(customer).toBeDefined()
      expect(customer.id).toBe(testCustomer.id)
      expect(customer.email).toBe(testCustomer.email)
    })

    test('should handle invalid customer ID', async () => {
      await expect(
        stripeService.getCustomer('invalid-customer-id')
      ).rejects.toThrow()
    })
  })

  describe('Payment Method Testing', () => {
    test('should create test payment method successfully', async () => {
      const paymentMethod = await stripeService.createTestPaymentMethod()

      expect(paymentMethod).toBeDefined()
      expect(paymentMethod.type).toBe('card')
      expect(paymentMethod.card).toBeDefined()
      expect(paymentMethod.card.last4).toBe('4242')
    })

    test('should retrieve payment method successfully', async () => {
      const testPaymentMethod = await stripeService.createTestPaymentMethod()
      const paymentMethod = await stripeService.getPaymentMethod(testPaymentMethod.id)

      expect(paymentMethod).toBeDefined()
      expect(paymentMethod.id).toBe(testPaymentMethod.id)
      expect(paymentMethod.type).toBe('card')
    })
  })

  describe('Webhook Handling', () => {
    test('should handle payment_intent.succeeded webhook', async () => {
      const payload = JSON.stringify({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 2999,
            currency: 'usd',
            status: 'succeeded',
            metadata: { test: 'true' }
          }
        }
      })

      const signature = 'test_signature'

      // Mock the webhook secret validation
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'

      const result = await stripeService.handleWebhook(payload, signature)
      expect(result).toEqual({ received: true })
    })

    test('should handle checkout.session.completed webhook', async () => {
      const payload = JSON.stringify({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_status: 'paid',
            amount_total: 7999,
            currency: 'usd',
            metadata: { test: 'true' }
          }
        }
      })

      const signature = 'test_signature'

      const result = await stripeService.handleWebhook(payload, signature)
      expect(result).toEqual({ received: true })
    })

    test('should handle invalid webhook signature', async () => {
      const payload = JSON.stringify({
        type: 'payment_intent.succeeded',
        data: { object: {} }
      })

      await expect(
        stripeService.handleWebhook(payload, 'invalid_signature')
      ).rejects.toThrow()
    })
  })

  describe('Error Handling', () => {
    test('should handle card declined error', async () => {
      // This would normally require a real Stripe test
      // For unit testing, we'll mock the error
      const mockError = {
        code: 'card_declined',
        message: 'Your card was declined.',
        type: 'card_error'
      }

      const customError = ErrorHandler.createPaymentError(mockError)
      
      expect(customError.code).toBe('PAYMENT_INVALID_CARD')
      expect(customError.userMessage).toBe('Your card was declined')
    })

    test('should handle insufficient funds error', async () => {
      const mockError = {
        code: 'insufficient_funds',
        message: 'Your card has insufficient funds.',
        type: 'card_error'
      }

      const customError = ErrorHandler.createPaymentError(mockError)
      
      expect(customError.code).toBe('PAYMENT_INSUFFICIENT_FUNDS')
      expect(customError.userMessage).toBe('Insufficient funds')
    })

    test('should handle expired card error', async () => {
      const mockError = {
        code: 'expired_card',
        message: 'Your card has expired.',
        type: 'card_error'
      }

      const customError = ErrorHandler.createPaymentError(mockError)
      
      expect(customError.code).toBe('PAYMENT_INVALID_CARD')
      expect(customError.userMessage).toBe('Your card has expired')
    })
  })

  describe('Session Retrieval', () => {
    test('should retrieve checkout session successfully', async () => {
      if (!testCheckoutSession) {
        throw new Error('Test checkout session not created')
      }

      const session = await stripeService.retrieveSession(testCheckoutSession.id)

      expect(session).toBeDefined()
      expect(session.id).toBe(testCheckoutSession.id)
      expect(session.paymentStatus).toBeDefined()
    })

    test('should handle invalid session ID', async () => {
      await expect(
        stripeService.retrieveSession('invalid-session-id')
      ).rejects.toThrow()
    })
  })

  describe('Test Card Validation', () => {
    test('should define all test cards', () => {
      expect(TestCards.SUCCESS).toBe('4242424242424242')
      expect(TestCards.DECLINE).toBe('4000000000000002')
      expect(TestCards.INSUFFICIENT_FUNDS).toBe('4000000000009995')
      expect(TestCards.EXPIRED).toBe('4000000000000069')
      expect(TestCards.PROCESSING_ERROR).toBe('4000000000000119')
      expect(TestCards.REQUIRE_3DS).toBe('4000002760003184')
    })
  })
})

// Integration test for the complete payment flow
describe('Complete Payment Flow Integration', () => {
  test('should complete full payment flow', async () => {
    // 1. Create checkout session
    const products = [
      {
        name: 'MyRoofGenius Professional',
        description: 'Professional plan',
        amount: 79.99,
        quantity: 1
      }
    ]

    const options = {
      successUrl: 'https://myroofgenius.com/success',
      cancelUrl: 'https://myroofgenius.com/cancel',
      customerEmail: 'test@example.com'
    }

    const session = await stripeService.createCheckoutSession(products, options)
    expect(session).toBeDefined()

    // 2. Simulate successful payment webhook
    const webhookPayload = JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: session.id,
          payment_status: 'paid',
          amount_total: 7999,
          currency: 'usd',
          customer_email: 'test@example.com'
        }
      }
    })

    const result = await stripeService.handleWebhook(webhookPayload, 'test_signature')
    expect(result).toEqual({ received: true })

    // 3. Retrieve session to verify status
    const retrievedSession = await stripeService.retrieveSession(session.id)
    expect(retrievedSession.id).toBe(session.id)
  })
})

// Performance tests
describe('Performance Tests', () => {
  test('should handle concurrent payment intent creation', async () => {
    const promises = []
    
    for (let i = 0; i < 10; i++) {
      promises.push(
        stripeService.createPaymentIntent(29.99, 'usd', { test: i.toString() })
      )
    }

    const results = await Promise.all(promises)
    
    expect(results).toHaveLength(10)
    results.forEach((result, index) => {
      expect(result.metadata.test).toBe(index.toString())
    })
  })

  test('should handle multiple webhook events', async () => {
    const webhookPromises = []
    
    for (let i = 0; i < 5; i++) {
      const payload = JSON.stringify({
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: `pi_test_${i}`,
            amount: 2999,
            currency: 'usd',
            status: 'succeeded'
          }
        }
      })

      webhookPromises.push(
        stripeService.handleWebhook(payload, 'test_signature')
      )
    }

    const results = await Promise.all(webhookPromises)
    
    expect(results).toHaveLength(5)
    results.forEach(result => {
      expect(result).toEqual({ received: true })
    })
  })
})

// Helper functions for testing
function generateTestCard(type) {
  const cards = {
    success: '4242424242424242',
    decline: '4000000000000002',
    insufficient_funds: '4000000000009995',
    expired: '4000000000000069',
    processing_error: '4000000000000119',
    require_3ds: '4000002760003184'
  }

  return {
    number: cards[type],
    exp_month: 12,
    exp_year: 2025,
    cvc: '123'
  }
}

function generateTestMetadata() {
  return {
    test: 'true',
    timestamp: new Date().toISOString(),
    source: 'integration_test'
  }
}

export { generateTestCard, generateTestMetadata }