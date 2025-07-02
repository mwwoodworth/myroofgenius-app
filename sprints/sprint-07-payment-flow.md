# Sprint 07: Fix Payment & Fulfillment Flow Gaps

## Objective
Complete the e-commerce implementation by fixing order tracking, implementing the cleanup cron job, and ensuring proper email template usage for order confirmations.

## Critical Context for Codex
- **Current Issues**:
  - Orders may not link properly to Stripe sessions
  - Expired download cleanup cron route is missing
  - Email templates exist in seed data but aren't being used
  - Potential race conditions in order creation
- **Solution**: Implement proper order tracking, cleanup automation, and template-based emails

## Implementation Tasks

### Task 1: Fix Order Creation Flow
Update: `app/api/checkout/route.ts`

```typescript
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createRouteClient } from '@/lib/supabase-route-handler'
import { getEnv } from '@/lib/env'
import { nanoid } from 'nanoid'

const env = getEnv()
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
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

    const { productId, quantity = 1 } = await req.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      )
    }

    // Fetch product details with proper error handling
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      console.error('Product fetch error:', productError)
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      )
    }

    // Create order ID upfront
    const orderId = nanoid(12)

    // Calculate amounts
    const unitAmount = Math.round(product.price * 100) // Convert to cents
    const totalAmount = unitAmount * quantity

    // Create Stripe checkout session with metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images: product.image_url ? [product.image_url] : undefined,
              metadata: {
                product_id: productId,
              }
            },
            unit_amount: unitAmount,
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/products/${productId}?canceled=true`,
      metadata: {
        user_id: user.id,
        product_id: productId,
        order_id: orderId,
        quantity: quantity.toString(),
      },
      // Additional options for better UX
      billing_address_collection: 'auto',
      shipping_address_collection: product.requires_shipping ? {
        allowed_countries: ['US', 'CA'],
      } : undefined,
      automatic_tax: {
        enabled: true,
      },
      invoice_creation: {
        enabled: true,
      },
    })

    // Create pending order with all necessary fields
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: user.id,
        product_id: productId,
        stripe_session_id: session.id,
        stripe_checkout_url: session.url,
        amount: product.price * quantity,
        currency: 'usd',
        quantity,
        status: 'pending',
        customer_email: user.email,
        metadata: {
          product_name: product.name,
          product_price: product.price,
          session_created_at: new Date().toISOString(),
        }
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      // Don't fail the checkout - webhook will create order if needed
    } else {
      console.log('Order created:', order.id)
    }

    // Log checkout creation for monitoring
    if (env.MAKE_WEBHOOK_URL) {
      fetch(env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'checkout_created',
          order_id: orderId,
          user_id: user.id,
          product_id: productId,
          amount: totalAmount / 100,
          timestamp: new Date().toISOString(),
        }),
      }).catch(err => console.error('Failed to send checkout alert:', err))
    }

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
      orderId,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    
    // Send error alert if webhook configured
    if (env.MAKE_WEBHOOK_URL) {
      fetch(env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'checkout_error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {})
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
```

### Task 2: Implement Email Template System
Create file: `app/lib/email-service.ts`

```typescript
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { getEnv } from './env'

const env = getEnv()
const resend = new Resend(env.RESEND_API_KEY)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

interface EmailData {
  to: string
  templateSlug: string
  variables: Record<string, any>
}

export class EmailService {
  async sendTemplatedEmail({ to, templateSlug, variables }: EmailData) {
    try {
      // Fetch email template
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('slug', templateSlug)
        .eq('is_active', true)
        .single()

      if (templateError || !template) {
        console.error('Email template not found:', templateSlug)
        throw new Error(`Email template not found: ${templateSlug}`)
      }

      // Replace variables in template
      let subject = template.subject
      let htmlContent = template.html_content
      let textContent = template.text_content || ''

      // Replace all {{variable}} patterns
      Object.entries(variables).forEach(([key, value]) => {
        const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
        subject = subject.replace(pattern, String(value))
        htmlContent = htmlContent.replace(pattern, String(value))
        textContent = textContent.replace(pattern, String(value))
      })

      // Send email
      const { data, error } = await resend.emails.send({
        from: template.from_email || env.RESEND_FROM_EMAIL || 'orders@myroofgenius.com',
        to,
        subject,
        html: this.wrapInLayout(htmlContent, template.layout_template),
        text: textContent || this.htmlToText(htmlContent),
        reply_to: template.reply_to_email,
        headers: {
          'X-Template-ID': template.id,
          'X-Template-Slug': templateSlug,
        },
      })

      if (error) {
        console.error('Failed to send email:', error)
        throw error
      }

      // Log email send
      await supabase
        .from('email_logs')
        .insert({
          template_id: template.id,
          to_email: to,
          subject,
          status: 'sent',
          resend_id: data?.id,
          variables,
        })

      return { success: true, emailId: data?.id }
    } catch (error) {
      // Log failure
      await supabase
        .from('email_logs')
        .insert({
          to_email: to,
          template_slug: templateSlug,
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          variables,
        })

      throw error
    }
  }

  private wrapInLayout(content: string, layout?: string): string {
    if (!layout) {
      layout = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MyRoofGenius</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              {{content}}
            </div>
          </body>
        </html>
      `
    }

    return layout.replace('{{content}}', content)
  }

  private htmlToText(html: string): string {
    // Basic HTML to text conversion
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim()
  }
}

export const emailService = new EmailService()
```

### Task 3: Update Webhook to Use Email Templates
Update the email sending portion in: `app/api/webhook/route.ts`

```typescript
// Replace the sendOrderConfirmation function
async function sendOrderConfirmation(order: any) {
  try {
    // Fetch complete order details
    const { data: fullOrder } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          id,
          name,
          description,
          image_url
        ),
        user_profiles (
          display_name,
          email
        ),
        downloads (
          token,
          expires_at
        )
      `)
      .eq('id', order.id)
      .single()

    if (!fullOrder) {
      throw new Error('Order not found')
    }

    const download = fullOrder.downloads?.[0]
    const customerName = fullOrder.user_profiles?.display_name || 
                       fullOrder.customer_email?.split('@')[0] || 
                       'Customer'

    // Send templated email
    await emailService.sendTemplatedEmail({
      to: fullOrder.customer_email || fullOrder.user_profiles?.email || '',
      templateSlug: 'order_confirmation',
      variables: {
        customer_name: customerName,
        order_id: fullOrder.id.slice(0, 8).toUpperCase(),
        order_date: new Date(fullOrder.created_at).toLocaleDateString(),
        product_name: fullOrder.products?.name || 'Product',
        product_description: fullOrder.products?.description || '',
        product_image_url: fullOrder.products?.image_url || '',
        amount: fullOrder.amount.toFixed(2),
        currency: fullOrder.currency.toUpperCase(),
        download_url: download ? `${process.env.NEXT_PUBLIC_APP_URL}/download/${download.token}` : '',
        download_expiry: download ? new Date(download.expires_at).toLocaleDateString() : '',
        support_email: 'support@myroofgenius.com',
        company_name: 'MyRoofGenius',
        current_year: new Date().getFullYear().toString(),
      }
    })

    console.log('Order confirmation email sent for order:', order.id)
  } catch (error) {
    console.error('Failed to send order confirmation:', error)
    
    // Don't throw - we don't want to fail the webhook
    // Log to monitoring system
    if (process.env.MAKE_WEBHOOK_URL) {
      await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'email_send_failed',
          order_id: order.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {})
    }
  }
}
```

### Task 4: Implement Download Cleanup Cron
Create file: `app/api/cron/cleanup-expired-downloads/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnv } from '@/lib/env'

const env = getEnv()
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (env.CRON_SECRET && authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date().toISOString()
    
    // Find expired downloads
    const { data: expiredDownloads, error: fetchError } = await supabase
      .from('downloads')
      .select('id, token, order_id, expires_at')
      .lt('expires_at', now)
      .limit(100) // Process in batches

    if (fetchError) {
      throw fetchError
    }

    const deletedCount = expiredDownloads?.length || 0

    if (deletedCount > 0) {
      // Delete expired downloads
      const { error: deleteError } = await supabase
        .from('downloads')
        .delete()
        .in('id', expiredDownloads.map(d => d.id))

      if (deleteError) {
        throw deleteError
      }

      // Log the cleanup
      console.log(`Cleaned up ${deletedCount} expired downloads`)

      // Send notification if webhook configured
      if (env.MAKE_WEBHOOK_URL) {
        await fetch(env.MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'downloads_cleanup',
            deleted_count: deletedCount,
            timestamp: now,
          }),
        }).catch(() => {})
      }
    }

    // Also clean up old email logs (older than 90 days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { error: emailLogError } = await supabase
      .from('email_logs')
      .delete()
      .lt('created_at', ninetyDaysAgo.toISOString())

    if (emailLogError) {
      console.error('Failed to cleanup email logs:', emailLogError)
    }

    return NextResponse.json({ 
      success: true,
      downloads_cleaned: deletedCount,
      timestamp: now
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    
    // Send error notification
    if (env.SLACK_WEBHOOK_URL) {
      await fetch(env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Download cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }),
      }).catch(() => {})
    }

    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    )
  }
}

// Also support POST for flexibility
export async function POST(request: Request) {
  return GET(request)
}
```

### Task 5: Create Database Tables for Email System
Add to your Supabase migrations:

```sql
-- Create email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id),
  template_slug TEXT,
  to_email TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  resend_id TEXT,
  error_message TEXT,
  variables JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);
CREATE INDEX idx_email_logs_template_id ON email_logs(template_id);

-- Add RLS policies
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Admin users can view all email logs
CREATE POLICY "Admin users can view email logs" ON email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Add missing fields to orders table if not present
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_checkout_url TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add index for order lookups
CREATE INDEX IF NOT EXISTS idx_orders_metadata ON orders USING GIN(metadata);
```

### Task 6: Update Order Dashboard Display
Update: `components/dashboard/RecentOrders.tsx`

```typescript
import { formatDistanceToNow } from 'date-fns'
import { Package, Download, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  created_at: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  amount: number
  currency: string
  products?: {
    id: string
    name: string
    image_url?: string
  }
  downloads?: {
    token: string
    expires_at: string
    download_count: number
    max_downloads: number
  }[]
}

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'Processing'
      case 'failed':
        return 'Failed'
      case 'refunded':
        return 'Refunded'
      default:
        return status
    }
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
          <Link
            href="/products"
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            Browse products →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {orders.map((order) => {
          const download = order.downloads?.[0]
          const canDownload = download && 
            new Date(download.expires_at) > new Date() &&
            download.download_count < download.max_downloads

          return (
            <div key={order.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {order.products?.image_url ? (
                    <img
                      src={order.products.image_url}
                      alt={order.products.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {order.products?.name || 'Product'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    ${order.amount.toFixed(2)}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    {getStatusIcon(order.status)}
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              </div>

              {order.status === 'completed' && download && (
                <div className="mt-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <div className="text-sm">
                    {canDownload ? (
                      <>
                        <p className="text-gray-600 dark:text-gray-300">
                          Downloads: {download.download_count} / {download.max_downloads}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          Expires: {new Date(download.expires_at).toLocaleDateString()}
                        </p>
                      </>
                    ) : (
                      <p className="text-red-600 dark:text-red-400">
                        Download expired or limit reached
                      </p>
                    )}
                  </div>
                  {canDownload && (
                    <Link
                      href={`/download/${download.token}`}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Link>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/orders"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          View all orders →
        </Link>
      </div>
    </div>
  )
}
```

## Verification Steps for Codex

1. **Apply database migrations**:
   - Run the SQL to create email_logs table
   - Add missing order fields

2. **Test order creation flow**:
   - Create a test purchase
   - Verify order is created with pending status
   - Check order has stripe_session_id

3. **Test email templates**:
   - Ensure email_templates table has order_confirmation template
   - Test webhook sends templated emails
   - Check email_logs for sent emails

4. **Test cleanup cron**:
   ```bash
   # Test locally
   curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/cron/cleanup-expired-downloads
   ```

5. **Verify order tracking**:
   ```sql
   -- Check orders are properly linked
   SELECT o.*, d.token, d.expires_at 
   FROM orders o
   LEFT JOIN downloads d ON d.order_id = o.id
   WHERE o.status = 'completed'
   ORDER BY o.created_at DESC;
   ```

6. **Test edge cases**:
   - Multiple quantity orders
   - Failed payments
   - Refund handling

## Notes for Next Sprint
Next, we'll fix the frontend routes and UI issues (Sprint 08), including missing demo page and navigation problems.