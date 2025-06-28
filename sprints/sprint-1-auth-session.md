# Sprint 1: Critical Authentication & Session Management Fixes

## Why This Matters

Your dashboard is currently blocking all users from accessing their data — even authenticated ones. This sprint fixes the authentication flow that's preventing your system from serving its primary function: protecting professionals with real-time project intelligence.

## What This Protects

- Prevents legitimate users from being locked out of their dashboards
- Ensures session persistence across server and client contexts  
- Eliminates authentication loops that erode user trust
- Protects against session data loss in production environments

## Sprint Objectives

### 🔴 Critical Fix 1: Dashboard Authentication Context

**Current Issue**: Dashboard uses service role but can't identify logged-in users server-side, redirecting everyone to `/login`

**Implementation**:
```typescript
// app/dashboard/page.tsx - REPLACE getDashboardData function
async function getDashboardData(userId: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  })
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Continue with existing data fetching logic...
}
```

**Verification Steps**:
- [ ] Test authenticated user can access dashboard
- [ ] Verify data loads correctly with user context
- [ ] Confirm unauthenticated users redirect to login
- [ ] Check session persistence after page refresh

### 🔴 Critical Fix 2: AI Copilot Session Storage

**Current Issue**: In-memory session storage breaks in serverless/multi-instance deployments

**Implementation Plan**:
1. Create Supabase tables for session persistence:
```sql
-- Migration: create_copilot_sessions.sql
CREATE TABLE copilot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE copilot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES copilot_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX idx_copilot_sessions_user_id ON copilot_sessions(user_id);
CREATE INDEX idx_copilot_messages_session_id ON copilot_messages(session_id);
```

2. Update API to use persistent storage:
```typescript
// app/api/copilot/route.ts
async function getOrCreateSession(sessionId: string, userId?: string) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Check existing session
  const { data: session } = await supabase
    .from('copilot_sessions')
    .select('*, messages:copilot_messages(*)')
    .eq('session_id', sessionId)
    .single()
    
  if (session) {
    return session
  }
  
  // Create new session
  const { data: newSession } = await supabase
    .from('copilot_sessions')
    .insert({ session_id: sessionId, user_id: userId })
    .select()
    .single()
    
  return { ...newSession, messages: [] }
}
```

**Verification Steps**:
- [ ] Test session persistence across server restarts
- [ ] Verify multi-tab session consistency
- [ ] Confirm session history loads after deployment
- [ ] Test session cleanup for old conversations

### ⚠️ Enhancement: Auth State Synchronization

**Current Issue**: Admin role stored in two places causing consistency issues

**Quick Fix** (for this sprint):
```typescript
// middleware.ts - Add sync check
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ request, response })
  const { data: { user } } = await supabase.auth.getUser()
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check both sources, prefer database as source of truth
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', user?.id)
      .single()
      
    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
}
```

## Sprint Deliverables Checklist

### Database Migrations
- [ ] Create copilot session tables migration
- [ ] Add RLS policies for session tables
- [ ] Test migration rollback procedure

### Code Changes
- [ ] Update Dashboard auth to use server component client
- [ ] Implement persistent Copilot session storage
- [ ] Add middleware admin check against database
- [ ] Update error handling for auth failures

### Testing Requirements
- [ ] Manual test: User login → Dashboard access flow
- [ ] Manual test: Copilot conversation persistence
- [ ] Manual test: Admin role toggle → immediate access
- [ ] Load test: Multiple concurrent Copilot sessions

### Documentation Updates
- [ ] Update deployment guide with new migrations
- [ ] Document session storage architecture
- [ ] Add troubleshooting guide for auth issues

## What to Watch For

- **Session Token Expiry**: Monitor for JWT expiration causing mid-session logouts
- **Database Performance**: Watch query times on copilot_messages table as it grows
- **Memory Leaks**: Ensure old session data is properly cleaned up
- **Edge Cases**: Test behavior when database is temporarily unavailable

## Next Sprint Preview

Sprint 2 will focus on securing the AI endpoints and fixing the GPT-4 model configuration to ensure reliable, protected AI functionality.

---

**Sprint Duration**: 3-4 days  
**Risk Level**: Critical (System currently non-functional for users)  
**Dependencies**: Supabase migrations must run before code deployment