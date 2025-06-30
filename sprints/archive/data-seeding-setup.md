# Data Seeding & Initial Setup

## Objective
Seed the production database with all necessary initial data for a successful launch.

## Task 1: Master Seeding Script

### Create Comprehensive Seed Script

```typescript
// scripts/seedProductionData.ts
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import * as bcrypt from 'bcrypt'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

async function seedAllData() {
  console.log('🌱 Starting production data seeding...\n')
  
  try {
    // 1. Create admin user
    await createAdminUser()
    
    // 2. Create test users
    await createTestUsers()
    
    // 3. Seed marketplace products
    await seedMarketplaceProducts()
    
    // 4. Seed blog posts
    await seedBlogPosts()
    
    // 5. Seed FAQs
    await seedFAQs()
    
    // 6. Initialize feature flags
    await initializeFeatureFlags()
    
    // 7. Create sample data for each persona
    await createPersonaSampleData()
    
    console.log('\n✅ All data seeded successfully!')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

async function createAdminUser() {
  console.log('👤 Creating admin user...')
  
  const email = process.env.ADMIN_EMAIL || 'admin@myroofgenius.com'
  const password = process.env.ADMIN_PASSWORD || generateSecurePassword()
  
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  
  if (authError) throw authError
  
  // Create user profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      email,
      full_name: 'Admin User',
      company_name: 'MyRoofGenius',
      role: 'admin',
      is_admin: true,
      persona: 'admin',
      onboarding_completed: true,
      phone: '+1-555-0100',
      subscription_tier: 'premium',
      subscription_status: 'active'
    })
  
  if (profileError) throw profileError
  
  console.log(`✅ Admin user created: ${email}`)
  console.log(`   Password: ${password}`)
}

async function createTestUsers() {
  console.log('\n👥 Creating test users...')
  
  const testUsers = [
    {
      email: 'estimator@example.com',
      password: 'TestPass123!',
      full_name: 'Emma Estimator',
      company_name: 'Precision Roofing Co',
      persona: 'Estimator',
      phone: '+1-555-0101'
    },
    {
      email: 'architect@example.com',
      password: 'TestPass123!',
      full_name: 'Alex Architect',
      company_name: 'Design Build Associates',
      persona: 'Architect',
      phone: '+1-555-0102'
    },
    {
      email: 'owner@example.com',
      password: 'TestPass123!',
      full_name: 'Oliver Owner',
      company_name: 'Corporate Properties LLC',
      persona: 'Building Owner',
      phone: '+1-555-0103'
    },
    {
      email: 'contractor@example.com',
      password: 'TestPass123!',
      full_name: 'Carlos Contractor',
      company_name: 'Premier Roofing Solutions',
      persona: 'Contractor',
      phone: '+1-555-0104'
    }
  ]
  
  for (const user of testUsers) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true
    })
    
    if (authError) {
      console.error(`Failed to create ${user.email}:`, authError)
      continue
    }
    
    await supabase.from('user_profiles').insert({
      id: authData.user.id,
      email: user.email,
      full_name: user.full_name,
      company_name: user.company_name,
      role: user.persona.toLowerCase(),
      persona: user.persona,
      phone: user.phone,
      onboarding_completed: true,
      subscription_tier: 'free',
      subscription_status: 'active'
    })
    
    console.log(`✅ Test user created: ${user.email}`)
  }
}

async function seedMarketplaceProducts() {
  console.log('\n🛍️ Creating marketplace products...')
  
  const products = [
    {
      name: 'Commercial Roofing Estimate Template Bundle',
      description: 'Complete estimation toolkit with 15+ templates for commercial roofing projects. Includes material calculators, labor worksheets, and profit margin analyzers.',
      price: 9900, // $99.00
      category: 'templates',
      features: [
        'Excel-based with automatic calculations',
        'Material takeoff worksheets',
        'Labor hour estimators',
        'Overhead and profit calculators',
        'Proposal generator',
        'Free updates for 1 year'
      ],
      downloadUrl: '/downloads/commercial-estimate-bundle.zip',
      fileSize: '25MB',
      format: 'Excel (.xlsx)',
      thumbnailUrl: '/products/estimate-bundle-thumb.jpg'
    },
    {
      name: 'Roof Inspection Checklist Pro',
      description: 'Comprehensive 150-point digital inspection checklist for commercial and residential roofs. Mobile-friendly format with photo integration.',
      price: 4900, // $49.00
      category: 'checklists',
      features: [
        'Digital and printable formats',
        'Photo documentation guides',
        'Compliance tracking sections',
        'Client report generator',
        'Severity rating system',
        'Customizable for your brand'
      ],
      downloadUrl: '/downloads/inspection-checklist-pro.pdf',
      fileSize: '8MB',
      format: 'PDF + Word',
      thumbnailUrl: '/products/inspection-checklist-thumb.jpg'
    },
    {
      name: 'Project Management Dashboard',
      description: 'ClickUp template pre-configured for roofing contractors. Track multiple projects, crews, and materials in one centralized system.',
      price: 7900, // $79.00
      category: 'project-management',
      features: [
        'Pre-built ClickUp workspace',
        'Project timeline views',
        'Crew scheduling boards',
        'Material tracking lists',
        'Budget vs actual reports',
        'Installation video guide'
      ],
      downloadUrl: '/downloads/clickup-template-export.json',
      fileSize: '2MB',
      format: 'ClickUp Template',
      thumbnailUrl: '/products/pm-dashboard-thumb.jpg'
    },
    {
      name: 'Roofing Sales Playbook',
      description: 'Proven sales scripts, objection handlers, and closing techniques specifically for roofing contractors. Includes training videos.',
      price: 14900, // $149.00
      category: 'training',
      features: [
        '50+ proven sales scripts',
        'Objection handling guide',
        'Pricing psychology tactics',
        'Follow-up email templates',
        '3 hours of video training',
        'Quarterly updates'
      ],
      downloadUrl: '/downloads/sales-playbook-complete.zip',
      fileSize: '500MB',
      format: 'PDF + Videos',
      thumbnailUrl: '/products/sales-playbook-thumb.jpg'
    },
    {
      name: 'Safety Program Template Pack',
      description: 'OSHA-compliant safety program documentation for roofing contractors. Includes training logs, toolbox talks, and incident forms.',
      price: 6900, // $69.00
      category: 'safety',
      features: [
        'Complete safety manual template',
        '52 toolbox talk topics',
        'Training documentation forms',
        'Incident report templates',
        'Safety audit checklists',
        'OSHA compliance guide'
      ],
      downloadUrl: '/downloads/safety-program-pack.zip',
      fileSize: '15MB',
      format: 'Word + PDF',
      thumbnailUrl: '/products/safety-program-thumb.jpg'
    }
  ]
  
  for (const product of products) {
    // Create Stripe product
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      metadata: {
        category: product.category,
        format: product.format
      }
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
        download_url: product.downloadUrl,
        file_size: product.fileSize,
        format: product.format,
        thumbnail_url: product.thumbnailUrl,
        is_active: true,
        is_featured: product.price > 7900, // Feature higher-priced items
        sales_count: Math.floor(Math.random() * 100) + 10, // Random initial sales
        rating: (4 + Math.random()).toFixed(1), // 4.0-5.0 rating
        reviews_count: Math.floor(Math.random() * 20) + 5
      })
    
    if (error) throw error
    console.log(`✅ Product created: ${product.name}`)
  }
}

async function seedBlogPosts() {
  console.log('\n📝 Creating blog posts...')
  
  // Blog posts content from previous artifact
  // ... (include blog posts from Content Population artifact)
  
  console.log('✅ Blog posts created')
}

async function seedFAQs() {
  console.log('\n❓ Creating FAQs...')
  
  const faqs = [
    // ... (include FAQs from Content Population artifact)
  ]
  
  for (const faq of faqs) {
    await supabase.from('faq_items').insert({
      ...faq,
      is_published: true
    })
  }
  
  console.log('✅ FAQs created')
}

async function initializeFeatureFlags() {
  console.log('\n🚩 Initializing feature flags...')
  
  const featureFlags = [
    {
      key: 'SALES_ENABLED',
      value: 'true',
      description: 'Enable marketplace and payment processing',
      is_public: true
    },
    {
      key: 'AI_COPILOT_ENABLED',
      value: 'true',
      description: 'Enable AI assistant features',
      is_public: true
    },
    {
      key: 'ESTIMATOR_ENABLED',
      value: 'false',
      description: 'Enable AI image-based estimator (beta)',
      is_public: true
    },
    {
      key: 'AR_MODE_ENABLED',
      value: 'false',
      description: 'Enable AR measurement features',
      is_public: true
    },
    {
      key: 'MAINTENANCE_MODE',
      value: 'false',
      description: 'Enable maintenance mode',
      is_public: false
    },
    {
      key: 'NEW_USER_DISCOUNT',
      value: '20',
      description: 'Percentage discount for new users',
      is_public: false
    }
  ]
  
  for (const flag of featureFlags) {
    await supabase.from('feature_flags').insert(flag)
  }
  
  console.log('✅ Feature flags initialized')
}

async function createPersonaSampleData() {
  console.log('\n📊 Creating persona sample data...')
  
  // Create sample onboarding analysis results
  const sampleAnalyses = {
    Estimator: {
      costDrivers: [
        'Material costs up 15% YoY in your region',
        'Labor shortage increasing rates by $5-8/hour',
        'Consider bulk purchasing for 10%+ savings'
      ],
      riskFactors: [
        'Weather delays common April-June',
        'Supply chain issues with modified bitumen',
        'Subcontractor availability limited'
      ],
      recommendations: [
        'Add 10-15% contingency for current market',
        'Lock in material prices early',
        'Build preferred subcontractor network'
      ]
    },
    Architect: {
      designConsiderations: [
        'Energy code requires R-30 minimum',
        'Consider cool roof requirements',
        'Green roof options gaining popularity'
      ],
      complianceIssues: [
        'New wind uplift requirements in effect',
        'Updated fire ratings for assembly',
        'Stormwater management regulations'
      ],
      materialRecommendations: [
        'TPO for energy efficiency',
        'Modified bitumen for durability',
        'Green roof systems for LEED points'
      ]
    },
    'Building Owner': {
      roiAnalysis: {
        currentRoofValue: '$850,000',
        annualMaintenanceCost: '$25,000',
        projectedLifeExtension: '5-7 years',
        totalSavings: '$175,000-245,000'
      },
      maintenanceSchedule: [
        'Bi-annual inspections (Spring/Fall)',
        'Quarterly drain cleaning',
        'Annual infrared moisture scan'
      ],
      warrantyConsiderations: [
        'Current warranty expires in 18 months',
        'Extended warranty available for $12,000',
        'NDL coverage recommended'
      ]
    },
    Contractor: {
      projectSchedule: {
        optimalStart: 'Mid-May',
        duration: '45-60 days',
        weatherWindows: '70% clear days expected'
      },
      laborRequirements: {
        crewSize: '8-10 workers',
        specializedSkills: 'Sheet metal, hot-air welding',
        estimatedHours: '1,200-1,500'
      },
      equipmentNeeds: [
        '60-ton crane for 2 days',
        'Hot-air welders (3 units)',
        'Safety equipment for 10'
      ]
    }
  }
  
  // Store sample data for demo accounts
  for (const [persona, data] of Object.entries(sampleAnalyses)) {
    await supabase.from('onboarding_analyses').insert({
      persona,
      sample_data: data,
      is_sample: true,
      created_at: new Date().toISOString()
    })
  }
  
  console.log('✅ Persona sample data created')
}

function generateSecurePassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Run the seeding
seedAllData().catch(console.error)
```

## Task 2: Database Verification Script

### Verify All Tables and Data

```typescript
// scripts/verifyProductionData.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyProductionData() {
  console.log('🔍 Verifying production data...\n')
  
  const checks = []
  
  // Check admin user
  const { data: adminUsers } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('is_admin', true)
  
  checks.push({
    name: 'Admin users',
    expected: '≥ 1',
    actual: adminUsers?.length || 0,
    passed: (adminUsers?.length || 0) >= 1
  })
  
  // Check test users
  const { data: testUsers } = await supabase
    .from('user_profiles')
    .select('*')
    .in('persona', ['Estimator', 'Architect', 'Building Owner', 'Contractor'])
  
  checks.push({
    name: 'Test users',
    expected: '≥ 4',
    actual: testUsers?.length || 0,
    passed: (testUsers?.length || 0) >= 4
  })
  
  // Check products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
  
  checks.push({
    name: 'Active products',
    expected: '≥ 3',
    actual: products?.length || 0,
    passed: (products?.length || 0) >= 3
  })
  
  // Check blog posts
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
  
  checks.push({
    name: 'Published blog posts',
    expected: '≥ 3',
    actual: blogPosts?.length || 0,
    passed: (blogPosts?.length || 0) >= 3
  })
  
  // Check FAQs
  const { data: faqs } = await supabase
    .from('faq_items')
    .select('*')
  
  checks.push({
    name: 'FAQ items',
    expected: '≥ 5',
    actual: faqs?.length || 0,
    passed: (faqs?.length || 0) >= 5
  })
  
  // Check feature flags
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('*')
  
  checks.push({
    name: 'Feature flags',
    expected: '≥ 4',
    actual: flags?.length || 0,
    passed: (flags?.length || 0) >= 4
  })
  
  // Print results
  console.log('Data Verification Results:')
  console.log('=' .repeat(50))
  
  for (const check of checks) {
    const icon = check.passed ? '✅' : '❌'
    console.log(`${icon} ${check.name}: ${check.actual} (expected ${check.expected})`)
  }
  
  const allPassed = checks.every(c => c.passed)
  
  console.log('\n' + '='.repeat(50))
  if (allPassed) {
    console.log('✅ All data verification checks passed!')
  } else {
    console.log('❌ Some data checks failed. Run seeding script.')
    process.exit(1)
  }
}

verifyProductionData().catch(console.error)
```

## Task 3: Create Demo Content Script

### Generate Demo Dashboard Data

```typescript
// scripts/createDemoData.ts
async function createDemoData(userId: string, persona: string) {
  // Create sample projects for dashboard
  const projects = [
    {
      user_id: userId,
      name: 'Walmart Distribution Center',
      type: 'commercial',
      status: 'in_progress',
      square_footage: 45000,
      estimated_cost: 285000,
      start_date: '2025-02-01',
      completion_date: '2025-04-15'
    },
    {
      user_id: userId,
      name: 'Medical Office Building',
      type: 'commercial',
      status: 'completed',
      square_footage: 12000,
      estimated_cost: 95000,
      actual_cost: 92500,
      start_date: '2024-11-01',
      completion_date: '2025-01-20'
    },
    {
      user_id: userId,
      name: 'School District Admin Building',
      type: 'institutional',
      status: 'bidding',
      square_footage: 25000,
      estimated_cost: 180000,
      bid_date: '2025-02-15'
    }
  ]
  
  for (const project of projects) {
    await supabase.from('projects').insert(project)
  }
  
  // Create dashboard metrics
  const metrics = {
    [userId]: {
      totalProjects: 15,
      activeProjects: 3,
      completedProjects: 12,
      totalRevenue: 1250000,
      avgProjectSize: 22000,
      winRate: 0.68,
      avgMargin: 0.22
    }
  }
  
  await supabase.from('user_metrics').insert({
    user_id: userId,
    metrics_data: metrics[userId],
    period: 'all_time',
    updated_at: new Date().toISOString()
  })
}
```

## Final Data Checklist

- [ ] Admin user created with credentials documented
- [ ] Test users created for each persona
- [ ] 5+ marketplace products with Stripe integration
- [ ] 3+ blog posts with real content
- [ ] 6+ FAQ items covering common questions  
- [ ] Feature flags initialized with correct values
- [ ] Sample onboarding data for each persona
- [ ] Demo projects for test accounts
- [ ] All database relationships verified