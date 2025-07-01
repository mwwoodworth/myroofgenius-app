import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: true };
  const { data: profile } = await supabase.from('user_profiles').select('is_admin').eq('user_id', user.id).single();
  if (!profile?.is_admin) return { error: true };
  return {};
}

export async function GET() {
  const check = await verifyAdmin();
  if (check.error) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables not configured');
  }
  const admin = createClient(url, key);
  const { data } = await admin.from('products').select('*').order('created_at', { ascending: false });
  return NextResponse.json({ products: data || [] });
}

export async function POST(request: NextRequest) {
  const check = await verifyAdmin();
  if (check.error) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables not configured');
  }
  const admin = createClient(url, key);
  const { error } = await admin.from('products').insert({
    ...body,
    price: parseFloat(body.price),
    price_id: `price_${Date.now()}`,
    is_active: true
  });
  if (error) return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  return NextResponse.json({ success: true });
}
