import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest, { params }: { params: { session_id: string } }) {
  const sessionId = params.session_id;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, status')
    .eq('stripe_session_id', sessionId)
    .limit(1);
  if (error || !orders || orders.length === 0) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  const order = orders[0];
  if (order.status !== 'completed') {
    return NextResponse.json({ downloads: [] });
  }
  const { data: downloads, error: dlError } = await supabase
    .from('downloads')
    .select('download_token, product_files(file_name)')
    .eq('order_id', order.id);
  if (dlError) {
    console.error('Error fetching downloads:', dlError.message);
    return NextResponse.json({ downloads: [] });
  }
  const downloadList = (downloads || []).map((d: any) => ({
    file_name: d.product_files?.file_name || 'File',
    download_url: `/api/download/${d.download_token}`
  }));
  return NextResponse.json({ downloads: downloadList });
}
