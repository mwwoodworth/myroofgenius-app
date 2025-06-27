# Sprint Task: Implement Stripe Webhook Handler

## Why This Matters
Without webhook handling, purchased products won't be delivered automatically. This creates manual work and poor customer experience. The webhook ensures instant fulfillment after successful payments.

## What This Protects
- Customer satisfaction (instant delivery)
- Manual fulfillment labor
- Revenue tracking accuracy
- Order integrity

## Implementation

### 1. Create Webhook API Route

Create new file: `app/api/webhook/route.ts`

```typescript
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Extract metadata
      const { product_id, user_id } = session.metadata || {}
      
      if (!product_id) {
        console.error('No product_id in session metadata')
        return NextResponse.json({ error: 'Missing product_id' }, { status: 400 })
      }

      try {
        // Create order record
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user_id || session.customer_email,
            product_id,
            stripe_session_id: session.id,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            status: 'completed',
            customer_email: session.customer_email,
          })
          .select()
          .single()

        if (orderError) throw orderError

        // Create download access
        const { error: downloadError } = await supabase
          .from('downloads')
          .insert({
            user_id: user_id || session.customer_email,
            product_id,
            order_id: order.id,
            download_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/download/${product_id}`,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          })

        if (downloadError) throw downloadError

        // Send confirmation email (if Resend is configured)
        if (process.env.RESEND_API_KEY && session.customer_email) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'MyRoofGenius <orders@myroofgenius.com>',
              to: session.customer_email,
              subject: 'Your MyRoofGenius Purchase',
              html: `
                <h2>Thank you for your purchase!</h2>
                <p>Your order has been processed successfully.</p>
                <p>You can access your downloads from your dashboard:</p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard">View Downloads</a>
              `,
            }),
          })
        }

        console.log('Order fulfilled:', order.id)
      } catch (error) {
        console.error('Error fulfilling order:', error)
        return NextResponse.json(
          { error: 'Order fulfillment failed' },
          { status: 500 }
        )
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.error('Payment failed:', paymentIntent.id)
      // Optionally update order status to 'failed'
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
```

### 2. Create Download API Route

Create new file: `app/api/download/[productId]/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const supabase = createClient()
  
  // Get user from session
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify download access
  const { data: download, error } = await supabase
    .from('downloads')
    .select('*, products(file_url)')
    .eq('product_id', params.productId)
    .eq('user_id', user.id)
    .single()

  if (error || !download) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  // Check expiration
  if (new Date(download.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Download expired' }, { status: 403 })
  }

  // Redirect to actual file URL (stored in Supabase Storage or S3)
  const fileUrl = download.products.file_url
  return NextResponse.redirect(fileUrl)
}
```

### 3. Configure Stripe Webhook in Dashboard

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter endpoint URL: `https://myroofgenius.com/api/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Add to Vercel environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Database Schema Updates

Ensure these tables exist in Supabase:

```sql
-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  stripe_session_id TEXT UNIQUE,
  amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  customer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  download_url TEXT,
  download_count INT DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_downloads_user_id ON downloads(user_id);
```

## Testing Steps

1. Deploy webhook endpoint to staging
2. Use Stripe CLI to test locally:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
3. Create test purchase and verify:
   - Order record created in database
   - Download record created
   - Email sent (check logs)
   - Download link works

## Success Criteria
- [ ] Webhook endpoint responds with 200 status
- [ ] Successful payments create order records
- [ ] Download access is granted automatically
- [ ] Confirmation emails are sent
- [ ] Failed payments are logged appropriately