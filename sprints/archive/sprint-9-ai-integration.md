# Sprint 9 - AI Integration & Feature Completion

## Objective
Complete all AI integrations and finalize feature implementations for V1 launch.

## Task 1: Claude AI Integration in Onboarding

### Prerequisites
```bash
npm install @anthropic-ai/sdk
```

### Implementation

1. **Update pages/api/onboarding/run.ts**
```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs/promises'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

const ALLOWED_PERSONAS = ['Estimator', 'Architect', 'Building Owner', 'Contractor']
const MAX_DATA_SIZE = 10 * 1024 * 1024

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { persona, data } = req.body as { persona: string; data: any }
    
    // Validation
    if (!ALLOWED_PERSONAS.includes(persona)) {
      return res.status(400).json({ error: 'Invalid persona', allowed: ALLOWED_PERSONAS })
    }
    
    const dataSize = JSON.stringify(data).length
    if (dataSize > MAX_DATA_SIZE) {
      return res.status(413).json({ error: 'Data too large', maxSize: MAX_DATA_SIZE })
    }
    
    // Load persona prompt
    const promptFileName = `${persona.toLowerCase().replace(' ', '')}Prompt.json`
    const filePath = path.join(process.cwd(), 'prompts', promptFileName)
    const promptContent = await fs.readFile(filePath, 'utf8')
    const promptJson = JSON.parse(promptContent)

    // Initialize Claude
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY!,
    })

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: promptJson.systemPrompt,
      messages: [{
        role: 'user',
        content: `${promptJson.userPromptTemplate}\n\nData: ${JSON.stringify(data)}`
      }]
    })

    const analysis = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''

    // Parse structured response
    let structuredAnalysis = {}
    try {
      const jsonMatch = analysis.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        structuredAnalysis = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      structuredAnalysis = { summary: analysis }
    }

    return res.status(200).json({
      ok: true,
      persona,
      dataProcessed: dataSize,
      timestamp: new Date().toISOString(),
      analysis: structuredAnalysis
    })

  } catch (err: any) {
    console.error('Onboarding error:', err)
    return res.status(500).json({ 
      error: 'Processing failed', 
      details: process.env.NODE_ENV === 'development' ? err.message : undefined 
    })
  }
}
```

2. **Create Persona Prompts in /prompts/**

```json
// prompts/estimatorPrompt.json
{
  "systemPrompt": "You are an AI assistant for roofing estimators. Analyze project data and provide actionable insights for accurate cost estimation.",
  "userPromptTemplate": "Analyze this roofing project and provide a JSON response with: {\"costDrivers\": [], \"riskFactors\": [], \"recommendedPricing\": {}, \"materialEstimates\": {}}"
}

// prompts/architectPrompt.json
{
  "systemPrompt": "You are an AI assistant for architects working on roofing projects. Focus on design, compliance, and technical specifications.",
  "userPromptTemplate": "Analyze this roofing project and provide a JSON response with: {\"designConsiderations\": [], \"complianceIssues\": [], \"materialRecommendations\": [], \"sustainabilityOptions\": []}"
}

// prompts/buildingownerPrompt.json
{
  "systemPrompt": "You are an AI assistant for building owners managing roofing projects. Focus on ROI, maintenance, and lifecycle costs.",
  "userPromptTemplate": "Analyze this roofing data and provide a JSON response with: {\"roiAnalysis\": {}, \"maintenanceSchedule\": [], \"lifecycleCosts\": {}, \"warrantyConsiderations\": []}"
}

// prompts/contractorPrompt.json
{
  "systemPrompt": "You are an AI assistant for roofing contractors. Focus on project execution, scheduling, and resource management.",
  "userPromptTemplate": "Analyze this project and provide a JSON response with: {\"projectSchedule\": {}, \"laborRequirements\": {}, \"equipmentNeeds\": [], \"safetyConsiderations\": []}"
}
```

## Task 2: AI Estimator Feature Decision

### Disable AI Estimator for V1 Launch

1. **Update .env.production**
```env
NEXT_PUBLIC_ESTIMATOR_ENABLED=false
NEXT_PUBLIC_AR_MODE_ENABLED=false
```

2. **Update components/features/AIEstimator.tsx**
```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

export function AIEstimator() {
  const isEnabled = useFeatureFlag('ESTIMATOR_ENABLED')
  
  if (!isEnabled) {
    return (
      <div className="rounded-lg bg-gray-100 p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">AI Estimator Coming Soon</h3>
        <p className="text-gray-600">
          Our advanced AI-powered roof estimation tool is currently in beta. 
          Sign up for updates to be notified when it launches!
        </p>
        <button className="mt-4 btn-primary">
          Join Waitlist
        </button>
      </div>
    )
  }
  
  // Existing estimator code...
}
```

## Task 3: Admin Role Verification

### Create Admin Setup Script

```typescript
// scripts/createAdminUser.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createAdminUser() {
  const email = process.env.ADMIN_EMAIL || 'admin@myroofgenius.com'
  const password = process.env.ADMIN_PASSWORD || generateSecurePassword()
  
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  
  if (authError) throw authError
  
  // Update user profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({ 
      is_admin: true,
      role: 'admin',
      onboarding_completed: true
    })
    .eq('id', authData.user.id)
  
  if (profileError) throw profileError
  
  console.log('Admin user created:', email)
  console.log('Password:', password)
}

createAdminUser().catch(console.error)
```

## Task 4: Marketplace Product Verification

### Create Sample Products Script

```typescript
// scripts/seedMarketplaceProducts.ts
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const sampleProducts = [
  {
    name: 'Commercial Roofing Estimate Template',
    description: 'Professional estimation template with automated calculations',
    price: 4900, // $49.00
    category: 'templates',
    features: ['Auto-calculations', 'Material lists', 'Labor estimates', 'Profit margins']
  },
  {
    name: 'Roof Inspection Checklist Pro',
    description: 'Comprehensive 150-point inspection checklist',
    price: 2900, // $29.00
    category: 'checklists',
    features: ['Photo documentation', 'Compliance tracking', 'Client reports', 'Mobile-friendly']
  },
  {
    name: 'Project Management Bundle',
    description: 'Complete PM toolkit for roofing contractors',
    price: 9900, // $99.00
    category: 'bundles',
    features: ['Gantt charts', 'Resource planning', 'Budget tracking', 'Team collaboration']
  }
]

async function seedProducts() {
  for (const product of sampleProducts) {
    // Create Stripe product
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
    })
    
    // Create Stripe price
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: product.price,
      currency: 'usd',
    })
    
    // Insert into database
    const { error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description,
        price: product.price / 100,
        stripe_product_id: stripeProduct.id,
        stripe_price_id: stripePrice.id,
        category: product.category,
        features: product.features,
        is_active: true
      })
    
    if (error) throw error
    console.log('Created product:', product.name)
  }
}

seedProducts().catch(console.error)
```

## Testing Checklist

- [ ] Claude API integration returns meaningful analysis for each persona
- [ ] Onboarding flow completes without errors
- [ ] Dashboard displays AI-generated insights
- [ ] AI Estimator shows "Coming Soon" message when disabled
- [ ] Admin user can access /admin panel
- [ ] Marketplace displays seeded products
- [ ] Stripe checkout flow works with test cards

## Rollback Plan

If Claude integration fails:
1. Revert to stubbed responses by setting `CLAUDE_API_KEY=""` 
2. Deploy previous version from Vercel dashboard
3. Investigate API issues offline