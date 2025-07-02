import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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
  const correlationId = crypto.randomUUID();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook error: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  // Log attempt
  await supabase.from('webhook_logs').insert({
    id: correlationId,
    event_id: event.id,
    type: event.type,
    payload: body,
  });

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Replay protection / deduplication
      const { data: existing } = await supabase
        .from('webhook_logs')
        .select('id')
        .eq('event_id', event.id)
        .neq('id', correlationId)
        .maybeSingle();
      if (existing) {
        console.log('Duplicate webhook received, skipping');
        return NextResponse.json({ received: true });
      }

      const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', session.metadata?.order_id)
        .single();
      if (order?.status === 'completed') {
        console.log('Order already completed');
        return NextResponse.json({ received: true });
      }

      // Begin pseudo transaction
      const downloadToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error: updateError } = await supabase.from('orders').update({
        status: 'completed',
        stripe_session_id: session.id,
        payment_intent: session.payment_intent as string,
      }).eq('id', session.metadata?.order_id);

      if (updateError) {
        console.error('Order update failed:', updateError);
        throw updateError;
      }

      const { error: downloadError } = await supabase.from('downloads').insert({
        user_id: session.metadata?.user_id,
        order_id: session.metadata?.order_id,
        product_id: session.metadata?.product_id,
        token: downloadToken,
        expires_at: expiresAt.toISOString(),
      });

      if (downloadError) {
        // rollback order status
        await supabase.from('orders').update({ status: 'pending' }).eq('id', session.metadata?.order_id);
        console.error('Download creation failed:', downloadError);
        throw downloadError;
      }

      // TODO: Send confirmation email
      try {
        console.log('Sending confirmation email for', session.metadata?.order_id);
      } catch (emailErr) {
        await supabase.from('email_queue').insert({
          order_id: session.metadata?.order_id,
          payload: {},
        });
        console.error('Email send failed, queued for retry', emailErr);
      }

      console.log('Order completed:', session.metadata?.order_id, 'correlation', correlationId);

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
