# Sprint 01: Fix Authentication & Session Handling

## Objective
Fix the critical authentication issue preventing logged-in users from accessing their dashboard by implementing proper server-side session handling with Supabase Auth Helpers.

## Critical Context for Codex
- **Current Issue**: Dashboard uses service-role client without user credentials, causing auth.getUser() to return null
- **Result**: All authenticated users are redirected to /login, making the dashboard inaccessible
- **Solution**: Implement Next.js Supabase Auth Helpers for proper cookie-based session management

## Implementation Tasks

### Task 1: Install Supabase Auth Helpers
```bash
npm install @supabase/auth-helpers-nextjs
```

### Task 2: Create Server Component Client Helper
Create file: `app/lib/supabase-server.ts`

```typescript
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export function createServerClient() {
  const cookieStore = cookies()
  
  return createServerComponentClient<Database>({
    cookies: () => cookieStore
  })
}
```

### Task 3: Update Dashboard Page Data Loader
Replace the entire content of: `app/dashboard/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { RecentOrders } from '@/components/dashboard/RecentOrders'
import { RecentAnalyses } from '@/components/dashboard/RecentAnalyses'
import { QuickStats } from '@/components/dashboard/QuickStats'
import { SupportTickets } from '@/components/dashboard/SupportTickets'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createServerClient()
  
  // Get authenticated user from cookie-based session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('Auth error in dashboard:', authError)
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  // Fetch user's orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      products (
        id,
        name,
        price,
        image_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (ordersError) {
    console.error('Error fetching orders:', ordersError)
  }

  // Fetch user's downloads
  const { data: downloads, error: downloadsError } = await supabase
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
    .limit(10)

  if (downloadsError) {
    console.error('Error fetching downloads:', downloadsError)
  }

  // Fetch user's roof analyses
  const { data: analyses, error: analysesError } = await supabase
    .from('roof_analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (analysesError) {
    console.error('Error fetching analyses:', analysesError)
  }

  // Fetch user's support tickets
  const { data: tickets, error: ticketsError } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (ticketsError) {
    console.error('Error fetching tickets:', ticketsError)
  }

  // Calculate quick stats
  const totalOrders = orders?.length || 0
  const totalDownloads = downloads?.length || 0
  const totalAnalyses = analyses?.length || 0
  const openTickets = tickets?.filter(t => t.status !== 'closed').length || 0

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

        <QuickStats
          totalOrders={totalOrders}
          totalDownloads={totalDownloads}
          totalAnalyses={totalAnalyses}
          openTickets={openTickets}
        />

        <div className="grid gap-8 md:grid-cols-2">
          <RecentOrders orders={orders || []} />
          <RecentAnalyses analyses={analyses || []} />
        </div>

        {tickets && tickets.length > 0 && (
          <SupportTickets tickets={tickets} />
        )}
      </div>
    </DashboardLayout>
  )
}
```

### Task 4: Update Admin Dashboard
Replace the entire content of: `app/admin/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = createServerClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('Auth error in admin:', authError)
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.is_admin) {
    console.error('Admin access denied:', profileError)
    redirect('/dashboard')
  }

  // Fetch all data for admin dashboard
  // Using service role is acceptable here since we've verified admin status
  const [
    { data: users },
    { data: orders },
    { data: products },
    { data: tickets },
    { data: analyses }
  ] = await Promise.all([
    supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('*, products(*), user_profiles(*)').order('created_at', { ascending: false }),
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('support_tickets').select('*, user_profiles(*)').order('created_at', { ascending: false }),
    supabase.from('roof_analyses').select('*, user_profiles(*)').order('created_at', { ascending: false })
  ])

  return (
    <AdminDashboard
      users={users || []}
      orders={orders || []}
      products={products || []}
      tickets={tickets || []}
      analyses={analyses || []}
    />
  )
}
```

### Task 5: Create Route Handler Client Helper
Create file: `app/lib/supabase-route-handler.ts`

```typescript
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

export function createRouteClient() {
  const cookieStore = cookies()
  
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore
  })
}
```

### Task 6: Update API Routes to Use Route Handler Client
Update any API routes that need user context. Example for a protected API route:

Create file: `app/api/user/profile/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase-route-handler'

export async function GET() {
  const supabase = createRouteClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }

  return NextResponse.json(profile)
}
```

### Task 7: Update Middleware for Auth
Update or create: `middleware.ts`

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
```

## Verification Steps for Codex

1. After implementing all changes, run:
   ```bash
   npm run build
   npm run dev
   ```

2. Test authentication flow:
   - Navigate to `/login`
   - Log in with test credentials
   - Verify you can access `/dashboard` without being redirected
   - Verify user data loads correctly

3. Check for TypeScript errors:
   ```bash
   npm run type-check
   ```

4. Verify the following:
   - [ ] Users can log in and stay logged in
   - [ ] Dashboard loads user-specific data
   - [ ] Admin dashboard only accessible to admin users
   - [ ] No TypeScript errors
   - [ ] No console errors about missing auth

## Notes for Next Sprint
After fixing authentication, we'll need to implement the Stripe webhook handler (Sprint 02) to enable order fulfillment.