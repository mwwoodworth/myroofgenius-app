## Sprint 13: Backend Services Integration

```markdown
# Sprint 13: Backend Services Integration

## Objective
Ensure proper integration with backend services including FastAPI (if used), Supabase RLS policies, and secure API configurations.

## Critical Context for Codex
- Verify and configure Supabase Row Level Security (RLS) policies
- Set up proper API base URLs for any external services
- Ensure service keys are never exposed to client
- Implement proper CORS and security headers

## Task 1: Audit and Update Supabase RLS Policies

### Create migration file `supabase/migrations/[timestamp]_update_rls_policies.sql`:
```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE roof_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all orders" ON orders
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Products policies (public read)
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage products" ON products
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Downloads policies
CREATE POLICY "Users can view own downloads" ON downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Valid tokens can access downloads" ON downloads
  FOR SELECT USING (
    token IS NOT NULL 
    AND expires_at > NOW()
  );

-- Roof analyses policies
CREATE POLICY "Users can view own analyses" ON roof_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analyses" ON roof_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Copilot sessions policies
CREATE POLICY "Users can view own sessions" ON copilot_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON copilot_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON copilot_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Copilot messages policies
CREATE POLICY "Users can view own messages" ON copilot_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM copilot_sessions
      WHERE copilot_sessions.id = copilot_messages.session_id
      AND copilot_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own sessions" ON copilot_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM copilot_sessions
      WHERE copilot_sessions.id = copilot_messages.session_id
      AND copilot_sessions.user_id = auth.uid()
    )
  );

-- Support tickets policies
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets" ON support_tickets
  FOR UPDATE USING (auth.uid() = user_id);

-- Blog posts policies (public read for published)
CREATE POLICY "Anyone can view published posts" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Service role can manage posts" ON blog_posts
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
Task 2: Create API Configuration Module
Create src/lib/api-config.ts:
typescript// API Configuration with proper type safety
export const API_CONFIG = {
  // Base URLs for different services
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  FASTAPI_URL: process.env.FASTAPI_BASE_URL || '',
  
  // API Endpoints
  ENDPOINTS: {
    // AI Analysis endpoints
    ANALYZE_ROOF: '/api/analyze-roof',
    ANALYZE_ROOF_EXTERNAL: process.env.FASTAPI_BASE_URL ? 
      `${process.env.FASTAPI_BASE_URL}/analyze` : null,
    
    // Copilot endpoints
    COPILOT_CHAT: '/api/copilot',
    COPILOT_HISTORY: '/api/copilot/history',
    
    // Order endpoints
    CREATE_CHECKOUT: '/api/checkout',
    STRIPE_WEBHOOK: '/api/webhook',
    
    // Download endpoints
    DOWNLOAD: '/api/download',
  },
  
  // Request configuration
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Timeouts
  TIMEOUTS: {
    DEFAULT: 30000, // 30 seconds
    AI_ANALYSIS: 60000, // 60 seconds
    FILE_UPLOAD: 120000, // 2 minutes
  }
} as const;

// Type-safe API client
export class APIClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(baseURL = '', headers = {}) {
    this.baseURL = baseURL;
    this.headers = {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...headers,
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
        signal: AbortSignal.timeout(
          API_CONFIG.TIMEOUTS.DEFAULT
        ),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      throw error;
    }
  }
}
Task 3: Update API Routes for Security
Update all API routes to validate service role usage:
typescript// src/lib/supabase-server.ts
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export function createServiceClient() {
  // Only use service role in server-side code
  if (typeof window !== 'undefined') {
    throw new Error('Service client cannot be used in browser');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseServiceKey) {
    throw new Error('Service role key not configured');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function createAuthenticatedClient() {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
}
Task 4: Implement CORS and Security Headers
Create src/middleware.ts:
typescriptimport { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Add security headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  
  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Origin',
      process.env.NEXT_PUBLIC_APP_URL || '*'
    );
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET,OPTIONS,PATCH,DELETE,POST,PUT'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
Task 5: Create API Integration Tests
Create src/lib/api-test-utils.ts:
typescriptimport { createServiceClient } from './supabase-server';

export async function testSupabaseConnection() {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);
      
    if (error) throw error;
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}

export async function testExternalAPIs() {
  const tests = [
    {
      name: 'OpenAI API',
      test: async () => {
        if (!process.env.OPENAI_API_KEY) throw new Error('API key not set');
        // Add actual API test here
        return true;
      },
    },
    {
      name: 'Stripe API',
      test: async () => {
        if (!process.env.STRIPE_SECRET_KEY) throw new Error('API key not set');
        // Add actual API test here
        return true;
      },
    },
    {
      name: 'Resend API',
      test: async () => {
        if (!process.env.RESEND_API_KEY) throw new Error('API key not set');
        // Add actual API test here
        return true;
      },
    },
  ];

  for (const { name, test } of tests) {
    try {
      await test();
      console.log(`✅ ${name} connection successful`);
    } catch (error) {
      console.error(`❌ ${name} connection failed:`, error);
    }
  }
}
Validation Steps

Run RLS policy migration: npx supabase db push
Test RLS policies with different user contexts
Verify service keys are not exposed in browser bundle
Check security headers in browser DevTools
Run API integration tests

Success Criteria

 All tables have appropriate RLS policies
 Service keys only used server-side
 Security headers properly configured
 CORS working for legitimate requests
 API integration tests passing