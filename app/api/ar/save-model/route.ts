import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DroneScan } from '../../../../app/lib/ar-types'

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'supabase not configured' }, { status: 500 })
  }

  try {
    const body = (await req.json()) as DroneScan
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase.from('ar_models').insert({
      model_url: body.modelUrl,
      drone_data: body.metadata || null,
    })

    return NextResponse.json({ status: 'success' })
  } catch (e) {
    return NextResponse.json({ error: 'save failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ models: [] }) // TODO: fetch from DB
}
