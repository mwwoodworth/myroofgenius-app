# Sprint 4: Payment Flow Completion & Order Management

## Why This Matters

Your orders are stuck in limbo. Customers pay, but the system never marks their purchase complete. No confirmation email arrives. They refresh the success page looking for download links that never appear. This isn't just a technical gap — it's a trust breach at the exact moment when confidence matters most.

## What This Protects

- Prevents paid orders from remaining in incomplete states
- Ensures customers receive immediate confirmation of their investment
- Protects your reputation during the critical post-payment moment
- Creates an audit trail for every transaction's lifecycle

## Sprint Objectives

### 🔴 Critical Fix 1: Complete the Payment Intent Loop

**Current Issue**: PaymentIntent webhook can't find orders because session_id isn't in metadata

**If you're a building owner** who just authorized a $50K roofing analysis, silence after payment feels like system failure.

**Field-Ready Implementation**:
```typescript
// app/api/checkout/route.ts - Include session ID in metadata
export async function POST(request: Request) {
  try {
    const { price_id, product_id, user_id } = await request.json()
    
    // Create the session first
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: price_id,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: {
        product_id,
        user_id,
      },
    })
    
    // Update the session to include its own ID in metadata
    await stripe.checkout.sessions.update(session.id, {
      metadata: {
        product_id,
        user_id,
        session_id: session.id, // Critical addition
      },
    })
    
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout creation failed:', error)
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    )
  }
}
```

**Alternative Approach** (simpler, more reliable):
```typescript
// app/api/webhook/route.ts - Complete order on checkout completion
case 'checkout.session.completed':
  const checkoutSession = event.data.object as Stripe.Checkout.Session
  
  // Update order status immediately on successful checkout
  const { error: updateError } = await supabase
    .from('orders')
    .update({ 
      status: 'completed', // Changed from 'paid' to 'completed'
      completed_at: new Date().toISOString()
    })
    .eq('stripe_session_id', checkoutSession.id)
    
  if (!updateError) {
    // Trigger email confirmation
    await sendOrderConfirmation(checkoutSession)
  }
  break
```

### 🔴 Critical Fix 2: Implement Order Confirmation Emails

**Current Issue**: Customers receive no confirmation after payment

**If you're a contractor** who just purchased premium estimation templates at 2 AM, that confirmation email is your receipt, your proof, and your access key.

**Implementation**:
```typescript
// app/lib/email.ts - Create email service
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendOrderConfirmation(
  session: Stripe.Checkout.Session
) {
  // Fetch order details with product info
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      product:products(name, description),
      user:auth.users(email)
    `)
    .eq('stripe_session_id', session.id)
    .single()
    
  if (!order) return
  
  // Fetch email template
  const { data: template } = await supabase
    .from('email_templates')
    .select('subject, body')
    .eq('name', 'order_confirmation')
    .single()
    
  // Generate download links
  const downloadLinks = await generateDownloadLinks(order.id)
  
  // Replace template variables
  const emailBody = template.body
    .replace('{{customer_name}}', order.user.email.split('@')[0])
    .replace('{{order_number}}', order.id.slice(0, 8).toUpperCase())
    .replace('{{product_name}}', order.product.name)
    .replace('{{amount}}', `$${(session.amount_total! / 100).toFixed(2)}`)
    .replace('{{download_links}}', downloadLinks.map(link => 
      `<a href="${link.url}">${link.name}</a>`
    ).join('<br>'))
    
  // Send email
  await resend.emails.send({
    from: 'MyRoofGenius <orders@myroofgenius.com>',
    to: order.user.email,
    subject: template.subject,
    html: emailBody,
  })
  
  // Log email sent
  await supabase.from('email_logs').insert({
    user_id: order.user_id,
    type: 'order_confirmation',
    order_id: order.id,
    sent_at: new Date().toISOString(),
  })
}
```

### ⚠️ Enhancement: Success Page Implementation

**Current Gap**: No dedicated success page to close the loop

**Implementation**:
```typescript
// app/success/page.tsx
export default async function SuccessPage({ 
  searchParams 
}: { 
  searchParams: { session_id: string } 
}) {
  const supabase = createServerComponentClient({ cookies })
  
  // Fetch order details
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      product:products(name, description),
      downloads:order_downloads(*)
    `)
    .eq('stripe_session_id', searchParams.session_id)
    .single()
    
  if (!order) {
    return <OrderNotFound />
  }
  
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          Order Complete
        </h1>
        <p className="text-green-700">
          Thank you for your purchase. A confirmation email has been sent to your inbox.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm text-gray-600">Order Number</dt>
            <dd className="font-mono">{order.id.slice(0, 8).toUpperCase()}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">Product</dt>
            <dd>{order.product.name}</dd>
          </div>
        </dl>
        
        {order.downloads.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Your Downloads</h3>
            <div className="space-y-2">
              {order.downloads.map((download) => (
                <a
                  key={download.id}
                  href={download.url}
                  className="block p-3 bg-blue-50 rounded hover:bg-blue-100"
                  download
                >
                  📥 {download.file_name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

## Sprint Deliverables Checklist

### Payment Flow Updates
- [ ] Add session_id to PaymentIntent metadata
- [ ] Update webhook to complete orders on checkout
- [ ] Implement order confirmation email sender
- [ ] Create success page with order details
- [ ] Add download link generation logic

### Database Updates
- [ ] Create email_logs table for audit trail
- [ ] Add completed_at timestamp to orders
- [ ] Create order_downloads junction table
- [ ] Add indexes for session_id lookups

### Email Template Setup
- [ ] Design order confirmation HTML template
- [ ] Test template with various products
- [ ] Verify download links work correctly
- [ ] Test email delivery to major providers

### Testing Protocol
- [ ] End-to-end purchase flow test
- [ ] Verify emails arrive within 60 seconds
- [ ] Test download link security (expires, auth)
- [ ] Confirm success page loads with order data
- [ ] Test failed payment handling

## What to Watch For

**During Implementation**:
- Stripe webhook retry behavior (store idempotency keys)
- Email delivery failures (implement retry logic)
- Download link security (add expiration, user validation)

**Post-Deployment**:
- Monitor email bounce rates
- Track time from payment to email delivery
- Watch for duplicate order confirmations
- Check success page load times

## Audit Loop Integration

Add these verifications to your payment testing:
1. Complete test purchase → Receive email within 2 minutes
2. Email contains correct order details and working download links
3. Success page shows order summary immediately
4. Downloads are user-specific and time-limited

## Next Sprint Preview

Sprint 5 establishes production monitoring and error handling — the early warning system that catches issues before your customers do.

---

**Sprint Duration**: 3 days  
**Risk Level**: Critical (Revenue and trust directly impacted)  
**Dependencies**: Stripe webhook must be properly configured