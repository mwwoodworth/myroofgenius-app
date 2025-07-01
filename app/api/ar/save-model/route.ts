import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DroneScan } from '../../../../app/lib/ar-types';

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'supabase not configured' }, { status: 500 });
  }

  try {
    const body = (await req.json()) as DroneScan;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase environment variables not configured');
    }
    const supabase = createClient(url, key);

    await supabase.from('ar_models').insert({
      model_url: body.modelUrl,
      drone_data: body.metadata || null,
    });

    return NextResponse.json({ status: 'success' });
  } catch {
    return NextResponse.json({ error: 'save failed' }, { status: 500 });
  }
}

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'supabase not configured' }, { status: 500 });
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase environment variables not configured');
    }
    const supabase = createClient(url, key);

    const { data, error } = await supabase.from('ar_models').select('*');
    if (error) throw error;

    return NextResponse.json({ models: data || [] });
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 });
  }
}
