# Sprint 09: Performance & Data Loading Optimization

## Objective
Optimize data fetching patterns to reduce page load times, implement parallel queries, add caching strategies, and ensure the application meets the <3s initial load target.

## Critical Context for Codex
- **Current Issues**:
  - Dashboard fetches data sequentially (profile → orders → downloads → analyses → tickets)
  - No caching for static content like blog posts
  - Large image payloads for AI analysis
  - All pages use force-dynamic preventing any caching
- **Solution**: Implement parallel fetching, strategic caching, and optimize payload sizes

## Implementation Tasks

### Task 1: Optimize Dashboard Data Loading
Update: `app/dashboard/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { RecentOrders } from '@/components/dashboard/RecentOrders'
import { RecentAnalyses } from '@/components/dashboard/RecentAnalyses'
import { QuickStats } from '@/components/dashboard/QuickStats'
import { SupportTickets } from '@/components/dashboard/SupportTickets'
import { unstable_cache } from 'next/cache'

// Optimize with shorter cache for dynamic data
export const dynamic = 'force-dynamic'
export const revalidate = 60 // Revalidate every minute

// Create cached user stats function
const getUserStats = unstable_cache(
  async (userId: string) => {
    const supabase = createServerClient()
    
    // Count queries are fast and can be cached
    const [
      { count: ordersCount },
      { count: downloadsCount },
      { count: analysesCount },
      { count: openTicketsCount }
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('downloads').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('roof_analyses').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('support_tickets').select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .neq('status', 'closed')
    ])

    return {
      totalOrders: ordersCount || 0,
      totalDownloads: downloadsCount || 0,
      totalAnalyses: analysesCount || 0,
      openTickets: openTicketsCount || 0
    }
  },
  ['user-stats'],
  { revalidate: 60, tags: ['user-stats'] }
)

export default async function DashboardPage() {
  const supabase = createServerClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('Auth error in dashboard:', authError)
    redirect('/login')
  }

  // Parallel fetch all data
  const [
    profileResult,
    ordersResult,
    downloadsResult,
    analysesResult,
    ticketsResult,
    stats
  ] = await Promise.all([
    // User profile
    supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    
    // Recent orders with products (limited for performance)
    supabase
      .from('orders')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url
        ),
        downloads (
          token,
          expires_at,
          download_count,
          max_downloads
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    
    // Recent downloads (already limited)
    supabase
      .from('downloads')
      .select(`
        *,
        products (
          id,
          name,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    
    // Recent analyses (already limited)
    supabase
      .from('roof_analyses')
      .select('id, created_at, address, analysis_data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    
    // Open support tickets
    supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'closed')
      .order('created_at', { ascending: false })
      .limit(5),
    
    // Get cached stats
    getUserStats(user.id)
  ])

  // Extract data with error handling
  const profile = profileResult.data
  const orders = ordersResult.data || []
  const downloads = downloadsResult.data || []
  const analyses = analysesResult.data || []
  const tickets = ticketsResult.data || []

  // Log any errors but don't fail the page
  if (profileResult.error) console.error('Profile fetch error:', profileResult.error)
  if (ordersResult.error) console.error('Orders fetch error:', ordersResult.error)
  if (downloadsResult.error) console.error('Downloads fetch error:', downloadsResult.error)
  if (analysesResult.error) console.error('Analyses fetch error:', analysesResult.error)
  if (ticketsResult.error) console.error('Tickets fetch error:', ticketsResult.error)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.display_name || user.email?.split('@')[0]}
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's an overview of your activity and resources
          </p>
        </div>

        <QuickStats {...stats} />

        <div className="grid gap-8 md:grid-cols-2">
          <RecentOrders orders={orders} />
          <RecentAnalyses analyses={analyses} />
        </div>

        {tickets.length > 0 && (
          <SupportTickets tickets={tickets} />
        )}
      </div>
    </DashboardLayout>
  )
}
```

### Task 2: Implement Static Generation for Blog
Update: `app/blog/page.tsx`

```typescript
import { createClient } from '@supabase/supabase-js'
import { BlogCard } from '@/components/blog/BlogCard'
import { getEnv } from '@/lib/env'
import { unstable_cache } from 'next/cache'

// Enable static generation with ISR
export const revalidate = 3600 // Revalidate every hour

// Create cached blog posts fetcher
const getBlogPosts = unstable_cache(
  async () => {
    const env = getEnv()
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:user_profiles(display_name, avatar_url),
        categories:blog_post_categories(
          category:blog_categories(name, slug)
        )
      `)
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Failed to fetch blog posts:', error)
      return []
    }

    return posts || []
  },
  ['blog-posts'],
  { revalidate: 3600, tags: ['blog'] }
)

// Fallback static posts
const staticPosts = [
  {
    id: '1',
    title: '10 Signs Your Commercial Roof Needs Immediate Attention',
    slug: '10-signs-commercial-roof-needs-attention',
    excerpt: 'Learn the critical warning signs that indicate your commercial roof requires professional inspection.',
    featured_image: '/images/blog/roof-inspection.jpg',
    published_at: '2024-01-15',
    read_time: 5,
    author: {
      display_name: 'Mike Johnson',
      avatar_url: '/images/avatars/mike.jpg'
    },
    categories: [
      { category: { name: 'Maintenance', slug: 'maintenance' } }
    ]
  },
  // Add more static posts...
]

export default async function BlogPage() {
  let posts = []
  
  try {
    posts = await getBlogPosts()
  } catch (error) {
    console.error('Failed to load blog posts:', error)
    posts = staticPosts // Use static fallback
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Roofing Insights & Resources
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Expert advice, industry trends, and practical tips for roofing professionals
          </p>
        </div>

        {/* Blog Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">
              No blog posts available at the moment. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

### Task 3: Optimize Image Processing for AI Analysis
Update: `app/api/analyze-roof/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-route-handler'
import { aiService } from '@/lib/ai-service'
import sharp from 'sharp'

export const maxDuration = 60

// Optimized analysis prompt
const ROOF_ANALYSIS_PROMPT = `Analyze this roof image and provide a professional assessment including:
1. Roof Type & Material
2. Condition (Excellent/Good/Fair/Poor)
3. Visible Issues (list up to 5)
4. Estimated Age
5. Priority Recommendations (top 3)
Format as JSON.`

export async function POST(req: Request) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const image = formData.get('image') as File
    const address = formData.get('address') as string

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(image.type)) {
      return NextResponse.json(
        { error: 'Invalid image type. Please upload JPG, PNG, or WebP.' },
        { status: 400 }
      )
    }

    // Process and optimize image
    const buffer = Buffer.from(await image.arrayBuffer())
    
    // Resize and compress image for AI processing
    const optimizedBuffer = await sharp(buffer)
      .resize(1024, 1024, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        mozjpeg: true 
      })
      .toBuffer()

    // Check optimized size (max 4MB for AI services)
    if (optimizedBuffer.length > 4 * 1024 * 1024) {
      // Further compress if needed
      const recompressed = await sharp(optimizedBuffer)
        .jpeg({ quality: 70 })
        .toBuffer()
      
      if (recompressed.length > 4 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image too large even after compression. Please use a smaller image.' },
          { status: 400 }
        )
      }
      optimizedBuffer.set(recompressed)
    }

    const base64Image = optimizedBuffer.toString('base64')

    // Get Mapbox static image if address provided (smaller size)
    let mapImageUrl = null
    if (address && process.env.MAPBOX_TOKEN) {
      try {
        const geocodeResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${process.env.MAPBOX_TOKEN}`,
          { signal: AbortSignal.timeout(5000) } // 5s timeout
        )
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json()
          const [lng, lat] = geocodeData.features[0]?.center || []
          
          if (lng && lat) {
            // Smaller map image for faster loading
            mapImageUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},18,0/400x300@2x?access_token=${process.env.MAPBOX_TOKEN}`
          }
        }
      } catch (error) {
        console.error('Geocoding failed:', error)
        // Continue without map
      }
    }

    try {
      // Analyze image with AI
      const analysisText = await aiService.vision({
        imageBase64: base64Image,
        prompt: ROOF_ANALYSIS_PROMPT,
        maxTokens: 500
      })

      // Parse JSON response or fallback to text parsing
      let structuredAnalysis
      try {
        structuredAnalysis = JSON.parse(analysisText)
      } catch {
        // Fallback to text parsing if not JSON
        structuredAnalysis = parseTextAnalysis(analysisText)
      }

      // Store analysis with smaller thumbnail
      const thumbnailBuffer = await sharp(buffer)
        .resize(400, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer()

      const thumbnailBase64 = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`

      const { data: savedAnalysis, error: dbError } = await supabase
        .from('roof_analyses')
        .insert({
          user_id: user.id,
          address,
          analysis_data: structuredAnalysis,
          map_image_url: mapImageUrl,
          thumbnail_url: thumbnailBase64, // Store small thumbnail
          raw_analysis: analysisText
        })
        .select()
        .single()

      if (dbError) {
        console.error('Failed to save analysis:', dbError)
      }

      return NextResponse.json({
        success: true,
        analysis: structuredAnalysis,
        analysisId: savedAnalysis?.id,
        mapUrl: mapImageUrl
      })

    } catch (aiError) {
      console.error('AI analysis error:', aiError)
      
      return NextResponse.json({
        success: false,
        error: 'Analysis failed',
        details: 'Unable to analyze the image. Please ensure the image clearly shows the roof.',
        fallback: {
          roofType: 'Unable to determine',
          condition: 'Analysis pending',
          issues: ['Manual inspection recommended'],
          recommendations: ['Contact a professional for assessment']
        }
      }, { status: 422 })
    }

  } catch (error) {
    console.error('Roof analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

function parseTextAnalysis(text: string): any {
  // Simple text parsing fallback
  return {
    roofType: extractSection(text, /type.*?:(.*?)(?:\n|$)/i) || 'Unknown',
    condition: extractSection(text, /condition.*?:(.*?)(?:\n|$)/i) || 'Unknown',
    issues: extractList(text, /issues.*?:(.*?)(?:\n\n|$)/is),
    estimatedAge: extractSection(text, /age.*?:(.*?)(?:\n|$)/i) || 'Unknown',
    recommendations: extractList(text, /recommendations.*?:(.*?)(?:\n\n|$)/is)
  }
}

function extractSection(text: string, regex: RegExp): string | null {
  const match = text.match(regex)
  return match ? match[1].trim() : null
}

function extractList(text: string, regex: RegExp): string[] {
  const match = text.match(regex)
  if (!match) return []
  
  return match[1]
    .split('\n')
    .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
    .filter(line => line.length > 0)
    .slice(0, 5) // Limit items
}
```

### Task 4: Add Response Caching Headers
Create file: `app/lib/cache-headers.ts`

```typescript
export function setCacheHeaders(headers: Headers, options: {
  maxAge?: number
  sMaxAge?: number
  staleWhileRevalidate?: number
  private?: boolean
  noStore?: boolean
}) {
  const directives: string[] = []
  
  if (options.noStore) {
    directives.push('no-store')
  } else {
    if (options.private) {
      directives.push('private')
    } else {
      directives.push('public')
    }
    
    if (options.maxAge !== undefined) {
      directives.push(`max-age=${options.maxAge}`)
    }
    
    if (options.sMaxAge !== undefined) {
      directives.push(`s-maxage=${options.sMaxAge}`)
    }
    
    if (options.staleWhileRevalidate !== undefined) {
      directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`)
    }
  }
  
  headers.set('Cache-Control', directives.join(', '))
}

// Preset configurations
export const cachePresets = {
  // Static assets (images, fonts)
  static: { maxAge: 31536000, sMaxAge: 31536000 }, // 1 year
  
  // API responses that rarely change
  apiStatic: { maxAge: 3600, sMaxAge: 86400, staleWhileRevalidate: 86400 }, // 1hr client, 1d CDN
  
  // Dynamic API responses
  apiDynamic: { maxAge: 0, sMaxAge: 60, staleWhileRevalidate: 300 }, // No client cache, 1min CDN
  
  // User-specific data
  private: { private: true, maxAge: 0, noStore: true },
  
  // Real-time data
  realtime: { noStore: true }
}
```

### Task 5: Optimize Products Page
Update: `app/products/page.tsx`

```typescript
import { Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductFilters } from '@/components/products/ProductFilters'
import { getEnv } from '@/lib/env'
import { unstable_cache } from 'next/cache'

// Cache for 5 minutes
export const revalidate = 300

const getProducts = unstable_cache(
  async () => {
    const env = getEnv()
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        categories:product_categories(
          category:categories(id, name, slug)
        )
      `)
      .eq('is_active', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch products:', error)
      return []
    }

    return products || []
  },
  ['products'],
  { revalidate: 300, tags: ['products'] }
)

const getCategories = unstable_cache(
  async () => {
    const env = getEnv()
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Failed to fetch categories:', error)
      return []
    }

    return categories || []
  },
  ['categories'],
  { revalidate: 3600, tags: ['categories'] } // Cache for 1 hour
)

export default async function ProductsPage() {
  // Fetch data in parallel
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Products & Templates
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Professional tools and templates to streamline your roofing business
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64">
            <ProductFilters categories={categories} />
          </aside>
          
          <main className="flex-1">
            <Suspense fallback={<ProductGridSkeleton />}>
              <ProductGrid products={products} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-pulse">
          <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
          <div className="p-6 space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Task 6: Add Performance Monitoring
Update: `app/layout.tsx`

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

// Add to the body
<body>
  {children}
  <SpeedInsights />
  <Analytics />
</body>
```

Update: `package.json`
```json
{
  "dependencies": {
    "@vercel/analytics": "^1.1.1",
    "@vercel/speed-insights": "^1.0.2",
    "sharp": "^0.33.2"
  }
}
```

## Verification Steps for Codex

1. **Install dependencies**:
   ```bash
   npm install @vercel/analytics @vercel/speed-insights sharp
   ```

2. **Test parallel data loading**:
   - Check dashboard load time
   - Monitor network tab for parallel requests
   - Verify no sequential waterfalls

3. **Test caching**:
   - Load blog page twice - second load should be instant
   - Check response headers for Cache-Control
   - Verify products page caches properly

4. **Test image optimization**:
   - Upload large image for roof analysis
   - Verify it's compressed and resized
   - Check response time is reasonable

5. **Performance metrics**:
   - Use Lighthouse to test performance score
   - Verify Time to First Byte (TTFB) < 200ms
   - Check Largest Contentful Paint (LCP) < 2.5s
   - Ensure First Input Delay (FID) < 100ms

6. **Monitor in production**:
   - Check Vercel Analytics for real user metrics
   - Monitor Speed Insights for performance issues
   - Set up alerts for slow queries

## Notes for Next Sprint
Next, we'll improve code quality and implement best practices (Sprint 10), including fixing TypeScript issues and improving error handling.