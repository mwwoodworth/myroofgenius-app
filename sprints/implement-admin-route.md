# Sprint Task: Implement Admin Page Route

## Why This Matters
The admin dashboard component exists but isn't accessible. Without this route, administrators cannot access critical business metrics, order management, or system configuration—even with proper authentication.

## What This Protects
- Business visibility
- Operational control
- Revenue tracking
- System administration

## Implementation

### 1. Create Admin Page Route

Create new file: `app/admin/page.tsx`

```tsx
import { Metadata } from 'next'
import AdminDashboard from '@/components/AdminDashboard'

export const metadata: Metadata = {
  title: 'Admin Dashboard | MyRoofGenius',
  description: 'System administration and business metrics',
}

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return <AdminDashboard />
}
```

### 2. Add Admin Navigation Link (Optional)

In `components/Navbar.tsx`, add conditional admin link:

```tsx
// Add this import at the top
import { useAuth } from '@/hooks/useAuth' // or your auth context

// Inside the Navbar component, add to navigation items:
{user?.role === 'admin' && (
  <Link
    href="/admin"
    className="text-sm font-medium text-gray-700 hover:text-gray-900"
  >
    Admin
  </Link>
)}
```

### 3. Secure the Route

The `AdminDashboard` component already handles authorization by redirecting non-admins. However, for added security, create middleware if not already present:

Create `middleware.ts` in project root (if it doesn't exist):

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
}
```

## Testing Steps

1. Run development server: `npm run dev`
2. Navigate to `/admin` as a non-admin user → Should redirect to `/dashboard`
3. Log in as admin user and navigate to `/admin` → Should see admin dashboard
4. Verify all admin tabs load correctly:
   - Overview (with stats)
   - Orders
   - Products
   - Users
   - Analytics
   - Settings

## Success Criteria
- [ ] /admin route loads AdminDashboard component
- [ ] Non-admin users are redirected away
- [ ] Admin users can access all dashboard functionality
- [ ] Navigation link appears only for admin users
- [ ] No console errors on page load