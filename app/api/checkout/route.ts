import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

let stripe: Stripe | null = null;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripe) {
    stripe = new Stripe(key, {
      apiVersion: '2023-10-16',
    });
  }
  return stripe;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { price_id, product_id, user_id } = body;

    if (!price_id || !product_id || !user_id) {
      return NextResponse.json({ error: 'missing data' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: product } = await supabase
      .from('products')
      .select('price_id, price')
      .eq('id', product_id)
      .single();
    if (!product || product.price_id !== price_id) {
      return NextResponse.json({ error: 'invalid product' }, { status: 400 });
    }

    const idempotencyKey = request.headers.get('Idempotency-Key') || crypto.randomUUID();

    const stripeClient = getStripe();
    if (!stripeClient) {
      return NextResponse.json(
        { error: 'Server not configured' },
        { status: 500 }
      );
    }

    const session = await stripeClient.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [{ price: price_id, quantity: 1 }],
        metadata: { product_id, user_id },
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      },
      { idempotencyKey }
    );

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    console.error(`[Checkout] session creation failed: ${message}`);
    return NextResponse.json(
      { error: 'Unable to complete request. Please refresh and try again.' },
      { status: 500 }
    );
  }
}

