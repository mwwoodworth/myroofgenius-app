import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export async function GET() {
  const checks: Record<string, boolean> = {
    database: false,
    stripe: false,
    email: false,
    ai: false
  };

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase environment variables not configured');
    }
    const supabaseAdmin = createClient(url, key);

    const { error: dbError } = await supabaseAdmin.from('products').select('id').limit(1);
    checks.database = !dbError;

    const { error: storageError } = await supabaseAdmin.storage.from('product-files').list('', { limit: 1 });
    checks.database &&= !storageError;

    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
        await stripe.balance.retrieve();
        checks.stripe = true;
      } catch {
        checks.stripe = false;
      }
    }

    checks.email = !!process.env.RESEND_API_KEY;
    checks.ai = !!process.env.OPENAI_API_KEY;

    const allOk = Object.values(checks).every(Boolean);
    return NextResponse.json({ checks, ok: allOk }, { status: allOk ? 200 : 503 });
  } catch {
    return NextResponse.json({ checks, ok: false }, { status: 503 });
  }
}
