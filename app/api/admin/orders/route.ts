import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error('Supabase environment variables not configured');
}

const admin = createClient(supabaseUrl, serviceKey);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');
  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  }

  const { data: profile } = await admin
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', userId)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data } = await admin
    .from('orders')
    .select(
      'id, amount, created_at, products(name), user_profiles(email)'
    )
    .order('created_at', { ascending: false })
    .limit(20);

  const orders = (data || []).map((o: unknown) => {
    const order = o as {
      id: number;
      amount: number;
      created_at: string;
      products?: { name?: string } | null;
      user_profiles?: { email?: string } | null;
    };
    return {
      order_id: order.id,
      email: order.user_profiles?.email || '',
      product: order.products?.name || '',
      amount: Number(order.amount),
      created_at: order.created_at
    };
  });

  return NextResponse.json(orders);
}
