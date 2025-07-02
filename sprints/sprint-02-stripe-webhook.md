# Sprint 02: Implement Stripe Webhook & Order Fulfillment

## Objective
Implement the missing Stripe webhook handler to process successful payments, mark orders as completed, generate download tokens, and send confirmation emails.

## Critical Context for Codex
- **Current Issue**: No webhook endpoint exists to handle Stripe checkout completion
- **Result**: Orders remain pending, no emails sent, no download links generated
- **Solution**: Create /api/webhook route with signature validation and fulfillment logic

## Implementation Tasks

### Task 1: Create Stripe Webhook Handler
Create file: `app/api/webhook/route.ts`

```typescript
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { nanoid } from 'nanoid'

// Initialize services with service role for webhook processing
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

// Raw body needed for signature verification
export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!
  
  if (!signature) {
    console.error('Missing Stripe signature')
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout completion:', session.id)

  // Extract metadata
  const { user_id, product_id } = session.metadata || {}
  
  if (!user_id || !product_id) {
    console.error('Missing required metadata:', { user_id, product_id })
    return
  }

  // Check for existing order to ensure idempotency
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id, status')
    .eq('stripe_session_id', session.id)
    .single()

  if (existingOrder?.status === 'completed') {
    console.log('Order already processed:', existingOrder.id)
    return
  }

  // Create or update order
  const orderData = {
    user_id,
    product_id,
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent as string,
    amount: session.amount_total! / 100, // Convert from cents
    currency: session.currency!,
    status: 'completed',
    customer_email: session.customer_email || session.customer_details?.email,
    completed_at: new Date().toISOString(),
  }

  const { data: order, error: orderError } = existingOrder
    ? await supabase
        .from('orders')
        .update(orderData)
        .eq('id', existingOrder.id)
        .select()
        .single()
    : await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

  if (orderError) {
    console.error('Error creating/updating order:', orderError)
    throw new Error('Failed to process order')
  }

  console.log('Order processed:', order.id)

  // Generate download token
  await generateDownloadToken(order.id, user_id, product_id)

  // Send confirmation email
  await sendOrderConfirmation(order)

  // Trigger alert for new order (if webhook URL configured)
  if (process.env.MAKE_WEBHOOK_URL) {
    await triggerOrderAlert(order)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing payment failure:', paymentIntent.id)

  // Find order by payment intent
  const { data: order, error } = await supabase
    .from('orders')
    .update({ 
      status: 'failed',
      error_message: paymentIntent.last_payment_error?.message || 'Payment failed'
    })
    .eq('stripe_payment_intent', paymentIntent.id)
    .select()
    .single()

  if (error || !order) {
    console.error('Order not found for payment intent:', paymentIntent.id)
    return
  }

  console.log('Order marked as failed:', order.id)
}

async function generateDownloadToken(orderId: string, userId: string, productId: string) {
  const token = nanoid(32)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

  const { error } = await supabase
    .from('downloads')
    .insert({
      token,
      order_id: orderId,
      user_id: userId,
      product_id: productId,
      expires_at: expiresAt.toISOString(),
      download_count: 0,
      max_downloads: 5,
    })

  if (error) {
    console.error('Error creating download token:', error)
    throw new Error('Failed to create download token')
  }

  console.log('Download token created:', token)
  return token
}

async function sendOrderConfirmation(order: any) {
  // Fetch product details
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('id', order.product_id)
    .single()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('id', order.user_id)
    .single()

  // Fetch download token
  const { data: download } = await supabase
    .from('downloads')
    .select('token')
    .eq('order_id', order.id)
    .single()

  const customerName = profile?.display_name || order.customer_email?.split('@')[0] || 'Customer'
  const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/download/${download?.token}`

  try {
    const { data, error } = await resend.emails.send({
      from: 'MyRoofGenius <orders@myroofgenius.com>',
      to: order.customer_email || '',
      subject: `Order Confirmation - ${product?.name || 'Your Purchase'}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1a1a1a; margin-bottom: 10px;">Order Confirmation</h1>
              <p style="color: #666; font-size: 18px;">Thank you for your purchase!</p>
            </div>

            <div style="background-color: #f7f7f7; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #1a1a1a; margin-top: 0;">Hi ${customerName},</h2>
              <p>Your order has been confirmed and your download is ready.</p>
              
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1a1a1a;">${product?.name || 'Product'}</h3>
                <p style="color: #666; margin: 10px 0;">${product?.description || ''}</p>
                <p style="font-size: 24px; font-weight: bold; color: #1a1a1a; margin: 10px 0;">
                  $${(order.amount).toFixed(2)} ${order.currency.toUpperCase()}
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${downloadUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Download Your Purchase
                </a>
                <p style="color: #666; font-size: 14px; margin-top: 10px;">
                  This link expires in 7 days
                </p>
              </div>
            </div>

            <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">
                <strong>Order ID:</strong> ${order.id}<br>
                <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
                <strong>Downloads remaining:</strong> 5
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              <p>Need help? Contact us at support@myroofgenius.com</p>
              <p>&copy; ${new Date().getFullYear()} MyRoofGenius. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send confirmation email:', error)
    } else {
      console.log('Confirmation email sent:', data?.id)
    }
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

async function triggerOrderAlert(order: any) {
  try {
    await fetch(process.env.MAKE_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'new_order',
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('Failed to trigger order alert:', error)
  }
}
```

### Task 2: Update Environment Variables
Add to `.env.local` and ensure these are set in Vercel:

```env
# Stripe Webhook Secret (get from Stripe Dashboard > Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Resend API Key (for sending emails)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Make.com Webhook URL (optional, for alerts)
MAKE_WEBHOOK_URL=https://hook.us1.make.com/xxxxxxxxxxxxx

# App URL for download links
NEXT_PUBLIC_APP_URL=https://myroofgenius.com
```

### Task 3: Update Checkout API to Store Session ID
Update: `app/api/checkout/route.ts`

```typescript
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createRouteClient } from '@/lib/supabase-route-handler'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: Request) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      )
    }

    // Fetch product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
              images: product.image_url ? [product.image_url] : [],
            },
            unit_amount: Math.round(product.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${productId}`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        product_id: productId,
      },
    })

    // Create pending order with session ID
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        product_id: productId,
        stripe_session_id: session.id,
        amount: product.price,
        currency: 'usd',
        status: 'pending',
        customer_email: user.email,
      })

    if (orderError) {
      console.error('Error creating pending order:', orderError)
      // Continue anyway - webhook will create order if needed
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
```

### Task 4: Configure Stripe Webhook in Vercel
Update: `vercel.json` (create if doesn't exist)

```json
{
  "functions": {
    "app/api/webhook/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### Task 5: Update Database Schema
Ensure the orders table has the required fields. Run this migration:

```sql
-- Add missing fields to orders table if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent);
```

## Verification Steps for Codex

1. **Set up Stripe webhook in dashboard**:
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: `https://your-domain.com/api/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.payment_failed`
   - Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

2. **Test locally with Stripe CLI**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   stripe trigger checkout.session.completed
   ```

3. **Verify the implementation**:
   - [ ] Webhook endpoint receives and validates Stripe signatures
   - [ ] Orders are marked as completed after successful payment
   - [ ] Download tokens are generated with 7-day expiry
   - [ ] Confirmation emails are sent with download links
   - [ ] Failed payments update order status to 'failed'
   - [ ] Idempotency is maintained (no duplicate processing)

4. **Check database**:
   ```sql
   -- Verify orders are being updated
   SELECT * FROM orders WHERE status = 'completed' ORDER BY created_at DESC LIMIT 5;
   
   -- Verify download tokens are created
   SELECT * FROM downloads ORDER BY created_at DESC LIMIT 5;
   ```

## Notes for Next Sprint
Next, we'll implement the success page (Sprint 03) to complete the post-checkout user experience.