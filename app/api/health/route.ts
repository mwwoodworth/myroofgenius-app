import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export async function GET() {
  const checks: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      storage: 'unknown',
      stripe: 'unknown',
      openai: 'unknown',
      email: 'unknown'
    }
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: dbError } = await supabaseAdmin.from('products').select('id').limit(1)
    checks.services.database = dbError ? 'unhealthy' : 'healthy'

    const { error: storageError } = await supabaseAdmin.storage.from('product-files').list('', { limit: 1 })
    checks.services.storage = storageError ? 'unhealthy' : 'healthy'

    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })
        await stripe.balance.retrieve()
        checks.services.stripe = 'healthy'
      } catch {
        checks.services.stripe = 'unhealthy'
      }
    }

    if (process.env.OPENAI_API_KEY) {
      checks.services.openai = 'healthy'
    }
    if (process.env.RESEND_API_KEY) {
      checks.services.email = 'healthy'
    }

    const anyUnhealthy = Object.values(checks.services).includes('unhealthy')
    if (anyUnhealthy) {
      checks.status = 'degraded'
    }

    return NextResponse.json(checks)
  } catch (error) {
    checks.status = 'unhealthy'
    return NextResponse.json(checks, { status: 500 })
  }
}
