import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { product_id } = await request.json();
  if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 });
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  await supabase
    .from('favorites')
    .insert({ user_id: user.id, product_id })
    // @ts-expect-error missing typing for onConflict
    .onConflict('user_id,product_id')
    .ignore();
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { product_id } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', product_id);
  return NextResponse.json({ success: true });
}
