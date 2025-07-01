import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  const orders = (data || []).map((o: any) => ({
    order_id: o.id,
    email: o.user_profiles?.email || '',
    product: o.products?.name || '',
    amount: Number(o.amount),
    created_at: o.created_at
  }));

  return NextResponse.json(orders);
}
