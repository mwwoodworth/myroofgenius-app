import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase environment variables not configured');
    }
    const supabase = createClient(url, key);
    await supabase.from('estimates').insert({
      square_feet: body.squareFeet,
      damage: body.damage,
      confidence: body.confidence,
      image_data: body.image,
      bbox: body.bbox || null,
    });
    return NextResponse.json({ status: 'success' });
  } catch {
    return NextResponse.json({ error: 'save failed' }, { status: 500 });
  }
}
