import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabase.from('estimates').insert({
      square_feet: body.squareFeet,
      damage: body.damage,
      confidence: body.confidence,
      image_data: body.image,
      bbox: body.bbox || null,
    });
    return NextResponse.json({ status: 'success' });
  } catch (e) {
    return NextResponse.json({ error: 'save failed' }, { status: 500 });
  }
}
