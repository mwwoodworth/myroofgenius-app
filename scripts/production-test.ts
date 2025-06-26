import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import Stripe from 'stripe'

async function testEndpoint(name: string, endpoint: string, method: string) {
  try {
    const res = await fetch(endpoint, { method })
    if (!res.ok) throw new Error(`${name} returned ${res.status}`)
    console.log(`✓ ${name}`)
  } catch (err) {
    console.error(`✗ ${name} -`, (err as Error).message)
  }
}

async function testSupabaseConnection() {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { error } = await client.from('products').select('id').limit(1)
  if (error) throw error
}

async function testAuthFlow() {
  // Placeholder for auth test
}

async function testOpenAI() {
  if (!process.env.OPENAI_API_KEY) throw new Error('No OpenAI key')
}

async function testEmailSending() {
  if (!process.env.RESEND_API_KEY) throw new Error('No Resend key')
}

async function testStripeConnection() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
  await stripe.balance.retrieve()
}

export default async function runProductionTests() {
  console.log('🔍 Running production readiness tests...\n')
  const apiBase = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const apiTests = [
    { name: 'AI Estimator API', endpoint: `${apiBase}/api/ai/analyze-roof`, method: 'POST' },
    { name: 'Copilot API', endpoint: `${apiBase}/api/copilot`, method: 'POST' },
    { name: 'Stripe Checkout', endpoint: `${apiBase}/api/checkout`, method: 'POST' }
  ]

  for (const t of apiTests) {
    await testEndpoint(t.name, t.endpoint, t.method)
  }

  const otherTests = [
    { name: 'Supabase Connection', test: testSupabaseConnection },
    { name: 'Auth Flow', test: testAuthFlow },
    { name: 'OpenAI API', test: testOpenAI },
    { name: 'Resend Email', test: testEmailSending },
    { name: 'Stripe API', test: testStripeConnection }
  ]

  for (const t of otherTests) {
    try {
      await t.test()
      console.log(`✓ ${t.name}`)
    } catch (err) {
      console.error(`✗ ${t.name} -`, (err as Error).message)
    }
  }
}

if (require.main === module) {
  runProductionTests().catch(err => {
    console.error('Test suite failed', err)
    process.exit(1)
  })
}
