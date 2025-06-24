import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      
      // Save order to Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role for server
      )
      
      await supabase.from('orders').insert({
        user_id: session.metadata?.user_id || null,
        product_id: session.metadata?.product_id,
        stripe_session_id: session.id,
        amount: session.amount_total! / 100,
        status: 'paid'
      })
    }
    
    return NextResponse.json({ received: true })
  } catch (err) {
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 })
  }
}
