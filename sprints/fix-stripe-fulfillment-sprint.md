# Sprint: Fix Stripe Webhook & Fulfillment

**ID:** SPRINT-005  
**Priority:** Blocking  
**State:** To Do

## 1. Executive Summary

A broken payment flow erodes trust instantly. This sprint implements secure webhook handling and automated fulfillment to ensure customers receive their products immediately after payment. This protects revenue, reputation, and prevents support tickets from confused customers.

## 2. Acceptance Criteria

- [ ] The webhook endpoint at `/api/webhook` securely validates Stripe signatures
- [ ] Orders are marked as `completed` in Supabase after successful payment
- [ ] Fulfillment logic triggers an order confirmation email with download link
- [ ] Duplicate webhook events are handled idempotently
- [ ] Unmatched session IDs are logged but don't break the flow
- [ ] Email provider is configured and operational

## 3. Step-by-Step Implementation Guide

### File: app/api/webhook/route.ts

**Purpose:** Secure webhook endpoint that processes Stripe events and triggers fulfillment

```typescript
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { triggerFulfillment } from '@/lib/fulfillment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    // Get the raw body
    const body = await request.text();
    
    // Get the signature from headers
    const signature = headers().get('stripe-signature');
    
    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract session ID
        const sessionId = session.id;
        
        if (!sessionId) {
          console.error('No session ID in webhook event');
          return NextResponse.json({ received: true }, { status: 200 });
        }

        // Initialize Supabase client
        const supabase = createClient();
        
        // Find the order by stripe_session_id
        const { data: order, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();

        if (fetchError || !order) {
          console.error(`Order not found for session ${sessionId}:`, fetchError);
          // Return 200 to acknowledge receipt even if order not found
          return NextResponse.json({ received: true }, { status: 200 });
        }

        // Check if already completed (idempotency)
        if (order.status === 'completed') {
          console.log(`Order ${order.id} already completed, skipping`);
          return NextResponse.json({ received: true }, { status: 200 });
        }

        // Update order status to completed
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('id', order.id);

        if (updateError) {
          console.error(`Failed to update order ${order.id}:`, updateError);
          throw updateError;
        }

        // Get user details for email
        const { data: user, error: userError } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', order.user_id)
          .single();

        if (userError || !user) {
          console.error(`User not found for order ${order.id}:`, userError);
          throw new Error('User not found');
        }

        // Get product details
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('name, download_url')
          .eq('id', order.product_id)
          .single();

        if (productError || !product) {
          console.error(`Product not found for order ${order.id}:`, productError);
          throw new Error('Product not found');
        }

        // Trigger fulfillment
        await triggerFulfillment({
          orderId: order.id,
          userEmail: user.email,
          userName: user.full_name || 'Valued Customer',
          productName: product.name,
          downloadLink: product.download_url,
        });

        console.log(`Successfully processed order ${order.id}`);
        break;
      }

      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;

        if (sessionId) {
          const supabase = createClient();
          
          // Update order status to failed
          await supabase
            .from('orders')
            .update({ status: 'failed' })
            .eq('stripe_session_id', sessionId);
          
          console.log(`Marked order as failed for session ${sessionId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    // Return 500 to trigger retry from Stripe
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
```

### File: lib/fulfillment.ts

**Purpose:** Handles order fulfillment logic including email sending

```typescript
import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/emails/orderConfirmation';

const resend = new Resend(process.env.RESEND_API_KEY!);

export interface FulfillmentData {
  orderId: string;
  userEmail: string;
  userName: string;
  productName: string;
  downloadLink: string;
}

export async function triggerFulfillment(data: FulfillmentData): Promise<void> {
  try {
    console.log(`Starting fulfillment for order ${data.orderId}`);

    // Send confirmation email
    const { error } = await resend.emails.send({
      from: 'MyRoofGenius <support@myroofgenius.com>',
      to: data.userEmail,
      subject: 'Your MyRoofGenius Order Confirmation',
      react: OrderConfirmationEmail({
        userName: data.userName,
        productName: data.productName,
        downloadLink: data.downloadLink,
        orderId: data.orderId,
      }),
    });

    if (error) {
      console.error(`Failed to send email for order ${data.orderId}:`, error);
      throw error;
    }

    console.log(`Fulfillment completed for order ${data.orderId}`);
    
    // Log successful fulfillment for monitoring
    await logFulfillment(data.orderId, 'success');

  } catch (error) {
    console.error(`Fulfillment failed for order ${data.orderId}:`, error);
    
    // Log failed fulfillment for manual follow-up
    await logFulfillment(data.orderId, 'failed', error);
    
    // Re-throw to trigger webhook retry
    throw error;
  }
}

async function logFulfillment(
  orderId: string, 
  status: 'success' | 'failed',
  error?: any
): Promise<void> {
  // This could be enhanced to write to a fulfillment_logs table
  // For now, console logging for monitoring
  console.log('Fulfillment log:', {
    orderId,
    status,
    timestamp: new Date().toISOString(),
    error: error?.message || null,
  });
}
```

### File: emails/orderConfirmation.tsx

**Purpose:** Email template for order confirmations

```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface OrderConfirmationEmailProps {
  userName: string;
  productName: string;
  downloadLink: string;
  orderId: string;
}

export const OrderConfirmationEmail = ({
  userName,
  productName,
  downloadLink,
  orderId,
}: OrderConfirmationEmailProps) => {
  const previewText = `Your ${productName} is ready for download`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://myroofgenius.com/logo.png"
            width="150"
            height="50"
            alt="MyRoofGenius"
            style={logo}
          />
          
          <Heading style={h1}>Order Confirmation</Heading>
          
          <Text style={paragraph}>Hello {userName},</Text>
          
          <Text style={paragraph}>
            Thank you for your purchase! Your order has been processed successfully,
            and your download is ready.
          </Text>

          <Section style={productSection}>
            <Text style={productName}>{productName}</Text>
            <Text style={orderInfo}>Order ID: {orderId}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={downloadLink}>
              Download Your Product
            </Button>
          </Section>

          <Text style={paragraph}>
            This download link will remain active for 30 days. We recommend
            downloading your file immediately and saving it to a secure location.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you have any questions or need assistance, please don't hesitate
            to contact our support team at{' '}
            <Link href="mailto:support@myroofgenius.com" style={link}>
              support@myroofgenius.com
            </Link>
          </Text>

          <Text style={footer}>
            © {new Date().getFullYear()} MyRoofGenius. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const logo = {
  margin: '0 auto',
  marginBottom: '32px',
  display: 'block',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '36px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 20px',
};

const productSection = {
  backgroundColor: '#f4f4f5',
  borderRadius: '8px',
  margin: '24px 20px',
  padding: '24px',
};

const productName = {
  color: '#333',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const orderInfo = {
  color: '#666',
  fontSize: '14px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '5px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1',
  padding: '16px 32px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  padding: '0 20px',
  textAlign: 'center' as const,
};

const link = {
  color: '#5469d4',
  textDecoration: 'underline',
};

export default OrderConfirmationEmail;
```

### File: lib/supabase/types.ts (additions)

**Purpose:** Type definitions for database tables

```typescript
// Add to existing types file
export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  stripe_session_id: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
}

export interface Product {
  id: string;
  name: string;
  download_url: string;
  price: number;
  description?: string;
}
```

### File: package.json (dependencies to add)

```json
{
  "dependencies": {
    "@react-email/components": "^0.0.15",
    "resend": "^3.2.0"
  }
}
```

## 4. Test Instructions

### Local Testing
1. Set up ngrok to expose local webhook endpoint: `ngrok http 3000`
2. Add webhook endpoint in Stripe Dashboard: `https://your-ngrok-url.ngrok.io/api/webhook`
3. Use Stripe CLI to trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   ```

### Staging Testing
1. Create a test product in Supabase `products` table
2. Make a test purchase using Stripe test card `4242 4242 4242 4242`
3. Verify in Supabase that order status changes from `pending` to `completed`
4. Check email inbox for confirmation email
5. Click download link to verify it works

## 5. Post-Merge & Deploy Validation

- [ ] Deploy to production with all environment variables set
- [ ] Make a real purchase with a test product ($1)
- [ ] Confirm webhook fires (check Stripe webhook logs)
- [ ] Verify order status updates in Supabase
- [ ] Confirm email arrives within 2 minutes
- [ ] Test download link functionality
- [ ] Monitor error logs for any failures

## 6. References

- `sprints/sprint-4-payment-flow.md` - Original payment flow implementation
- `app/api/checkout/route.ts` - Checkout session creation
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Resend Documentation](https://resend.com/docs)

## 7. Operator Actions

### Environment Variables (Add to Vercel)
```bash
# Existing (should already be set)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# New variables needed
STRIPE_WEBHOOK_SECRET=whsec_... # Get from Stripe Dashboard after creating webhook
RESEND_API_KEY=re_... # Get from Resend dashboard
```

### Stripe Dashboard Setup
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://myroofgenius.com/api/webhook`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `checkout.session.async_payment_failed`
4. Copy the signing secret and add as `STRIPE_WEBHOOK_SECRET`

### Resend Setup
1. Sign up at [resend.com](https://resend.com)
2. Verify domain `myroofgenius.com`
3. Create API key and add as `RESEND_API_KEY`
4. Configure SPF/DKIM records as instructed

### Database Verification
Ensure these tables exist with correct schema:
- `orders` table with status enum
- `profiles` table with email and full_name
- `products` table with download_url field

---

**Implementation Time:** 2-3 hours  
**Risk Level:** Medium (payment flow)  
**Dependencies:** Stripe webhook secret, Resend API key