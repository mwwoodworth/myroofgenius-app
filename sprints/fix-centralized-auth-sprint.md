# Sprint: Centralize Authentication & Authorization

**ID:** SPRINT-003  
**Priority:** Blocking  
**State:** To Do

## 1. Executive Summary

A single, robust authentication and authorization system protects all routes and data while maintaining a seamless user experience. This sprint consolidates scattered auth logic into middleware.ts, eliminating security gaps and simplifying maintenance. All protected routes will use consistent session validation and role-based access control through Supabase.

## 2. Acceptance Criteria

- [ ] All protected routes require authentication via middleware
- [ ] Admin routes (/admin, /api/admin/*) enforce admin role requirement
- [ ] API routes return standardized 401 JSON errors for unauthorized access
- [ ] Unauthenticated users redirect to /login from protected pages
- [ ] Non-admin authenticated users redirect to /dashboard from admin pages
- [ ] Post-login routing: admins → /admin, others → /dashboard
- [ ] All manual auth checks removed from individual API handlers
- [ ] Session cookies are HTTP-only and secure in production

## 3. Step-by-Step Implementation Guide

### Phase 1: Create Centralized Middleware

**File: middleware.ts**

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const { data: { session }, error } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // Define protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/admin') || 
                          pathname.startsWith('/api/admin') ||
                          pathname === '/api/copilot'

  const isAdminRoute = pathname.startsWith('/admin') || 
                      pathname.startsWith('/api/admin')

  const isApiRoute = pathname.startsWith('/api/')

  // Check authentication for protected routes
  if (isProtectedRoute && !session) {
    if (isApiRoute) {
      // Return 401 JSON error for API routes
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    // Redirect to login for pages
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check admin role for admin routes
  if (isAdminRoute && session) {
    // Fetch user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      if (isApiRoute) {
        // Return 401 JSON error for API routes
        return new NextResponse(
          JSON.stringify({ error: 'Admin privileges required' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      // Redirect non-admins to dashboard
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/copilot'
  ]
}
```

### Phase 2: Update Login Route Handler

**File: app/api/auth/login/route.ts**

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.json()
  const email = formData.email
  const password = formData.password
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    )
  }

  // Fetch user profile to determine redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  // Determine redirect URL based on role
  const redirectTo = profile?.role === 'admin' ? '/admin' : '/dashboard'

  return NextResponse.json(
    { 
      user: data.user,
      redirectTo 
    },
    { status: 200 }
  )
}
```

### Phase 3: Clean Up API Routes

**File: app/api/copilot/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    // Session already validated by middleware
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()
    
    const { messages, model = 'claude-3-opus-20240229', max_tokens = 1024 } = await request.json()

    const response = await anthropic.messages.create({
      model,
      max_tokens,
      messages,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Copilot API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**File: app/api/admin/users/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Auth already validated by middleware
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Auth already validated by middleware
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { userId, updates } = await request.json()

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ user: data })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
```

**File: app/api/admin/orders/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Auth already validated by middleware
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
```

### Phase 4: Update Dashboard Page

**File: app/dashboard/page.tsx**

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Session already validated by middleware
  const { data: { session } } = await supabase.auth.getSession()
  
  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session!.user.id)
    .single()

  return <DashboardClient user={session!.user} profile={profile} />
}
```

**File: app/dashboard/dashboard-client.tsx**

```typescript
'use client'

import { User } from '@supabase/supabase-js'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

interface DashboardClientProps {
  user: User
  profile: Profile | null
}

export default function DashboardClient({ user, profile }: DashboardClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      })
      
      if (response.ok) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={handleSignOut} disabled={isLoading}>
          Sign Out
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-sm text-gray-900">{profile?.full_name || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="text-sm text-gray-900 capitalize">{profile?.role || 'User'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Add more dashboard cards here based on role */}
      </div>
    </div>
  )
}
```

### Phase 5: Update Environment Configuration

**File: .env.local**

```bash
# Existing env vars...

# Ensure secure cookies in production
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://myroofgenius.com
```

### Phase 6: Create Auth Signout Route

**File: app/api/auth/signout/route.ts**

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  await supabase.auth.signOut()

  return NextResponse.json(
    { success: true },
    { status: 200 }
  )
}
```

## 4. Test Instructions

### Authentication Tests

1. **Unauthenticated Access Test**
   - Clear all cookies/local storage
   - Try accessing `/dashboard` → Should redirect to `/login`
   - Try accessing `/admin` → Should redirect to `/login`
   - Try POST to `/api/copilot` → Should return 401 JSON error

2. **Non-Admin User Test**
   - Create test user with role: `estimator`
   - Login with test user
   - Access `/dashboard` → Should load successfully
   - Try accessing `/admin` → Should redirect to `/dashboard`
   - Try GET `/api/admin/users` → Should return 401 JSON error

3. **Admin User Test**
   - Create test user with role: `admin`
   - Login with admin user
   - Access `/dashboard` → Should load successfully
   - Access `/admin` → Should load successfully
   - GET `/api/admin/users` → Should return user list

4. **Login Redirect Test**
   - Login as admin → Should redirect to `/admin`
   - Login as non-admin → Should redirect to `/dashboard`

### API Error Response Tests

```bash
# Test unauthenticated API access
curl -X POST http://localhost:3000/api/copilot \
  -H "Content-Type: application/json" \
  -d '{"messages": []}'
# Expected: {"error": "Authentication required"}

# Test non-admin accessing admin API
# (First login as non-admin, then use the session cookie)
curl -X GET http://localhost:3000/api/admin/users \
  -H "Cookie: [session-cookie]"
# Expected: {"error": "Admin privileges required"}
```

## 5. Post-Merge & Deploy Validation

- [ ] All tests pass in CI/CD pipeline
- [ ] Production deployment successful
- [ ] Verify middleware is active on all protected routes
- [ ] Confirm secure cookie settings in production
- [ ] Test live authentication flow with real users
- [ ] Monitor error logs for any auth-related issues
- [ ] Verify no manual auth checks remain in codebase

## 6. References

- **Sprint 1:** sprints/sprint-1-auth-session.md - Initial auth implementation
- **Sprint 2:** sprints/sprint-2-ai-security.md - AI security measures
- **Supabase Docs:** https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- **Next.js Middleware:** https://nextjs.org/docs/app/building-your-application/routing/middleware

---

## Security Notes

- All session cookies use HTTP-only and secure flags in production
- Role checks are performed server-side via Supabase RLS
- API errors return minimal information to prevent enumeration
- Middleware runs before any route handler, ensuring consistent protection
- Session refresh happens automatically on each request

## Performance Considerations

- Middleware caches user role for the request duration
- Database queries use indexed columns (id, role)
- Session validation is optimized by Supabase client
- No redundant auth checks in individual handlers