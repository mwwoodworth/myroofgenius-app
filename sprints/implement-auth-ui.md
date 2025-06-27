# Sprint Task: Implement Authentication UI

## Why This Matters
Without login/signup UI, users cannot access purchased products, view order history, or save preferences. The infrastructure exists—we need the interface to unlock it.

## What This Protects
- Customer account access
- Purchase history tracking
- Personalized dashboards
- Return customer experience

## Implementation

### 1. Create Login Page

Create new file: `app/login/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Failed to log in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/90"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="rounded-b-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="rounded-t-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary/90"
            >
              Forgot your password?
            </Link>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### 2. Create Signup Page

Create new file: `app/signup/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setSuccess(true)
    } catch (error: any) {
      setError(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <Alert>
            <AlertDescription>
              Check your email to confirm your account. Once confirmed, you can log in.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/90"
            >
              sign in to existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
                minLength={6}
              />
              <p className="mt-1 text-sm text-gray-500">
                Minimum 6 characters
              </p>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### 3. Create Auth Callback Handler

Create new file: `app/auth/callback/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard after successful auth
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
```

### 4. Update Navbar with Auth Links

Update `components/Navbar.tsx`:

```tsx
// Add these imports
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import { User } from '@supabase/auth-helpers-nextjs'

// Inside Navbar component, add:
const [user, setUser] = useState<User | null>(null)
const supabase = createClientComponentClient()

useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }
  
  getUser()

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null)
  })

  return () => subscription.unsubscribe()
}, [supabase])

const handleSignOut = async () => {
  await supabase.auth.signOut()
  router.push('/')
  router.refresh()
}

// Replace "Start Free Trial" button with:
{user ? (
  <div className="flex items-center gap-4">
    <Link
      href="/dashboard"
      className="text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      Dashboard
    </Link>
    <Button
      onClick={handleSignOut}
      variant="outline"
      size="sm"
    >
      Sign Out
    </Button>
  </div>
) : (
  <div className="flex items-center gap-4">
    <Link
      href="/login"
      className="text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      Sign In
    </Link>
    <Button asChild size="sm">
      <Link href="/signup">
        Start Free Trial
      </Link>
    </Button>
  </div>
)}
```

### 5. Update Homepage CTAs

In `components/HeroSection.tsx`, update the CTA buttons:

```tsx
// Change from:
<Link href="/get-started">Start Your System</Link>

// To:
<Link href="/signup">Start Your System</Link>

// This ensures the main CTA leads to signup
```

## Testing Steps

1. Run development server: `npm run dev`
2. Test signup flow:
   - Navigate to `/signup`
   - Create new account
   - Check email for confirmation
   - Confirm email and verify redirect to dashboard
3. Test login flow:
   - Navigate to `/login`
   - Enter credentials
   - Verify redirect to dashboard
4. Test navbar auth state:
   - When logged out: Shows "Sign In" and "Start Free Trial"
   - When logged in: Shows "Dashboard" and "Sign Out"
5. Test protected routes:
   - Access `/dashboard` when logged out → redirects to `/login`
   - Access `/dashboard` when logged in → shows dashboard

## Success Criteria
- [ ] Users can create new accounts
- [ ] Email confirmation flow works
- [ ] Users can log in with credentials
- [ ] Navbar reflects auth state correctly
- [ ] Protected routes enforce authentication
- [ ] Sign out clears session properly