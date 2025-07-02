import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Create service role client for webhook
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook error: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          stripe_session_id: session.id,
          payment_intent: session.payment_intent as string,
        })
        .eq('id', session.metadata?.order_id);

      if (updateError) {
        console.error('Order update failed:', updateError);
        throw updateError;
      }

      // Create download record
      const downloadToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error: downloadError } = await supabase
        .from('downloads')
        .insert({
          user_id: session.metadata?.user_id,
          order_id: session.metadata?.order_id,
          product_id: session.metadata?.product_id,
          token: downloadToken,
          expires_at: expiresAt.toISOString(),
        });

      if (downloadError) {
        console.error('Download creation failed:', downloadError);
      }

      // TODO: Send confirmation email
      console.log('Order completed:', session.metadata?.order_id);
      
    } catch (error) {
      console.error('Webhook processing error:', error);
      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
