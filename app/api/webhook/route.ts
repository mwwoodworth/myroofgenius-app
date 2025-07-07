import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

let stripe: Stripe | null = null;
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripe) {
    stripe = new Stripe(key, { apiVersion: '2023-10-16' });
  }
  return stripe;
}

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let delay = 500;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw new Error('unreachable');
}

// Create service role client for webhook
let supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!supabase) {
    supabase = createClient(url, key);
  }
  return supabase;
}
export async function POST(req: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }
  const body = await req.text();
  const sig = headers().get('stripe-signature')!;
  const idempotencyKey = headers().get('idempotency-key');
  const correlationId = crypto.randomUUID();

  const stripeClient = getStripe();
  if (!stripeClient) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripeClient.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook error: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  if (idempotencyKey) {
    const { data: existing } = await supabase
      .from('webhook_logs')
      .select('id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ received: true });
    }
  }

  // Log attempt
  await supabase.from('webhook_logs').insert({
    id: correlationId,
    event_id: event.id,
    idempotency_key: idempotencyKey,
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
        return NextResponse.json({ received: true });
      }

      const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', session.metadata?.order_id || '')
        .single();
      if (order?.status === 'completed') {
        return NextResponse.json({ received: true });
      }

      // Begin pseudo transaction
      const downloadToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error: updateError } = await withRetry(async () =>
        supabase
          .from('orders')
          .update({
            status: 'completed',
            stripe_session_id: session.id,
            payment_intent: session.payment_intent as string,
          })
          .eq('id', session.metadata?.order_id || '')
      );

      if (updateError) {
        console.error('Order update failed:', updateError);
        throw updateError;
      }

      const { error: downloadError } = await withRetry(async () =>
        supabase
          .from('downloads')
          .insert({
            user_id: session.metadata?.user_id,
            order_id: session.metadata?.order_id,
            product_id: session.metadata?.product_id,
            token: downloadToken,
            expires_at: expiresAt.toISOString(),
          })
      );

      if (downloadError) {
        // rollback order status
        await withRetry(async () =>
          supabase
            .from('orders')
            .update({ status: 'pending' })
            .eq('id', session.metadata?.order_id || '')
            .throwOnError()
        );
        console.error('Download creation failed:', downloadError);
        throw downloadError;
      }

      // Send confirmation email (non-blocking)
      try {
        // Optionally integrate with email service
      } catch (emailErr) {
        await withRetry(async () =>
          supabase
            .from('email_queue')
            .insert({
              order_id: session.metadata?.order_id,
              payload: {},
            })
            .throwOnError()
        );
        console.error('Email send failed, queued for retry', emailErr);
      }



    } catch (error) {
      console.error('Webhook processing error:', error);
      await withRetry(async () =>
        supabase
          .from('webhook_dead_letter')
          .insert({
            event_id: event.id,
            payload: body,
            error: String(error),
          })
          .throwOnError()
      );
      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
