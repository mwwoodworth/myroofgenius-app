const requiredEnvVars: Record<string, string> = {
  OPENAI_API_KEY: 'Required for AI features',
  NEXT_PUBLIC_SUPABASE_URL: 'Required for database',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Required for client auth',
  SUPABASE_SERVICE_ROLE_KEY: 'Required for admin features',
  STRIPE_SECRET_KEY: 'Required for payments',
  STRIPE_WEBHOOK_SECRET: 'Required for order fulfillment',
  RESEND_API_KEY: 'Required for transactional email',
  SENTRY_DSN: 'Recommended for error tracking',
  GOOGLE_GENERATIVE_AI_API_KEY: 'Optional for Gemini AI',
  ANTHROPIC_API_KEY: 'Optional for Claude AI'
}

const missing: string[] = []
for (const key of Object.keys(requiredEnvVars)) {
  if (!process.env[key]) {
    missing.push(`${key} - ${requiredEnvVars[key]}`)
  }
}

if (missing.length) {
  console.error('Missing environment variables:\n')
  for (const line of missing) console.error(`- ${line}`)
  console.error('\nCopy the following into your .env file:\n')
  for (const key of Object.keys(requiredEnvVars)) {
    console.error(`${key}=`)
  }
  process.exit(1)
}

console.log('All required environment variables are set.')
