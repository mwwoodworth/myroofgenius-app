import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';

const stripeKey = process.env.STRIPE_SECRET_KEY;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!stripeKey || !endpointSecret) {
  throw new Error('Stripe environment variables not configured');
}
const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'supabase not configured' }, { status: 500 });
  }
  const supabase = createClient(url, key);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { data: existing } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_session_id', session.id)
          .single();

        if (!existing) {
          await supabase.from('orders').insert({
            user_id: session.metadata?.user_id || null,
            product_id: session.metadata?.product_id,
            stripe_session_id: session.id,
            amount: session.amount_total ? session.amount_total / 100 : null,
            status: 'paid'
          });
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('stripe_session_id', intent.metadata?.session_id || '');
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('stripe_session_id', intent.metadata?.session_id || '');
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.deleted': {
        // Handle subscription events as needed
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}
