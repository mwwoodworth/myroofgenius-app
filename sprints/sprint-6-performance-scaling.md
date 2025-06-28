# Sprint 6: Performance Optimization & Scaling Preparation

## Why This Matters

Speed is trust. When your dashboard takes 8 seconds to load during a critical bid review, when AI responses lag during a live client meeting, when searches timeout while verifying a submittal — these aren't just performance issues. They're cracks in the foundation of reliability your users stand on. This sprint ensures your protective systems maintain their responsiveness even as your user base grows tenfold.

## What This Protects

- Prevents database queries from slowing as data accumulates
- Ensures AI responses remain snappy under concurrent load
- Protects page load times from degrading with scale
- Maintains system responsiveness during traffic spikes

## Sprint Objectives

### 🔴 Critical Implementation: Database Performance Foundation

**Current Issue**: Unindexed queries that work fine with 100 records will crawl with 100,000

**If you're an estimator** pulling historical project data during a deadline crunch, every second of lag compounds pressure.

**Field-Ready Index Strategy**:
```sql
-- Migration: add_performance_indexes.sql

-- User-specific queries (Dashboard, Orders, Downloads)
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX idx_downloads_user_id ON downloads(user_id);
CREATE INDEX idx_roof_analyses_user_created ON roof_analyses(user_id, created_at DESC);
CREATE INDEX idx_support_tickets_user_status ON support_tickets(user_id, status);

-- Product queries (frequently joined)
CREATE INDEX idx_products_price_id ON products(price_id);
CREATE INDEX idx_product_files_product_id ON product_files(product_id);

-- AI Session queries
CREATE INDEX idx_copilot_messages_session_created ON copilot_messages(session_id, created_at);
CREATE INDEX idx_copilot_sessions_session_id ON copilot_sessions(session_id);

-- Admin queries (full table scans)
CREATE INDEX idx_user_profiles_admin ON user_profiles(is_admin) WHERE is_admin = true;
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);

-- Monitoring queries
CREATE INDEX idx_system_errors_context_severity ON system_errors(context, severity, created_at DESC);
CREATE INDEX idx_system_metrics_type_created ON system_metrics(type, created_at DESC);

-- Analyze tables for query planner
ANALYZE orders;
ANALYZE products;
ANALYZE user_profiles;
```

**Query Optimization Examples**:
```typescript
// app/dashboard/page.tsx - Optimize dashboard queries
async function getDashboardData(userId: string) {
  // BEFORE: Multiple separate queries
  // AFTER: Single optimized query with selective loading
  
  const { data } = await supabase
    .from('orders')
    .select(`
      id,
      amount,
      created_at,
      product:products!inner(name, category)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10) // Only recent orders for dashboard
    
  // Use database aggregation instead of JavaScript
  const { data: stats } = await supabase
    .rpc('get_user_dashboard_stats', { user_id: userId })
    
  return { recentOrders: data, stats }
}

// Create the RPC function for efficient aggregation
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'total_spent', (
      SELECT COALESCE(SUM(amount), 0) 
      FROM orders 
      WHERE orders.user_id = $1 AND status = 'completed'
    ),
    'total_orders', (
      SELECT COUNT(*) 
      FROM orders 
      WHERE orders.user_id = $1
    ),
    'active_analyses', (
      SELECT COUNT(*) 
      FROM roof_analyses 
      WHERE roof_analyses.user_id = $1 AND status != 'completed'
    )
  );
END;
$$ LANGUAGE plpgsql STABLE;
```

### 🔴 Critical Implementation: AI Response Optimization

**Current Issue**: Unbounded conversation history slows responses and increases costs

**If you're a project manager** using AI to analyze change orders, waiting 15 seconds for each response breaks your flow.

**Implement Sliding Context Window**:
```typescript
// app/api/copilot/route.ts - Optimize context management
const MAX_CONTEXT_MESSAGES = 20 // Keep last 10 exchanges
const MAX_CONTEXT_TOKENS = 3000 // Token budget for history

async function prepareContext(sessionId: string): Promise<Message[]> {
  const { data: messages } = await supabase
    .from('copilot_messages')
    .select('role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(MAX_CONTEXT_MESSAGES)
    
  // Reverse to chronological order
  const chronological = messages?.reverse() || []
  
  // Implement sliding window with token counting
  let tokenCount = 0
  const contextMessages: Message[] = []
  
  // Always include system prompt
  contextMessages.push({
    role: 'system',
    content: getSystemPrompt(),
  })
  
  // Add messages from most recent, respecting token limit
  for (let i = chronological.length - 1; i >= 0; i--) {
    const msg = chronological[i]
    const estimatedTokens = Math.ceil(msg.content.length / 4)
    
    if (tokenCount + estimatedTokens > MAX_CONTEXT_TOKENS) {
      break
    }
    
    contextMessages.unshift(msg)
    tokenCount += estimatedTokens
  }
  
  return contextMessages
}

// Cache frequently used prompts
const promptCache = new Map<string, string>()

function getSystemPrompt(role?: UserRole): string {
  const cacheKey = `system_${role || 'default'}`
  
  if (!promptCache.has(cacheKey)) {
    // Load from database once
    const prompt = loadSystemPromptFromDB(role)
    promptCache.set(cacheKey, prompt)
  }
  
  return promptCache.get(cacheKey)!
}
```

### ⚠️ Enhancement: Implement Response Caching

**Build protection against redundant computations**:

```typescript
// app/lib/cache.ts - Smart caching layer
interface CacheEntry {
  key: string
  value: any
  expiry: number
  hits: number
}

class PerformanceCache {
  private cache = new Map<string, CacheEntry>()
  private readonly maxSize = 1000
  
  async get<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const existing = this.cache.get(key)
    
    if (existing && existing.expiry > Date.now()) {
      existing.hits++
      return existing.value as T
    }
    
    // Compute and cache
    const value = await factory()
    
    // LRU eviction if needed
    if (this.cache.size >= this.maxSize) {
      const lru = Array.from(this.cache.entries())
        .sort((a, b) => a[1].hits - b[1].hits)[0]
      this.cache.delete(lru[0])
    }
    
    this.cache.set(key, {
      key,
      value,
      expiry: Date.now() + (ttlSeconds * 1000),
      hits: 0,
    })
    
    return value
  }
}

// Usage in product listing
const cache = new PerformanceCache()

export async function getProducts(category?: string) {
  const cacheKey = `products_${category || 'all'}`
  
  return cache.get(cacheKey, async () => {
    const query = supabase
      .from('products')
      .select('*, files:product_files(*)')
      .eq('active', true)
      
    if (category) {
      query.eq('category', category)
    }
    
    const { data } = await query.order('sort_order')
    return data
  }, 600) // Cache for 10 minutes
}
```

### 🛡️ Rate Limiting Implementation

**Protect system resources from overload**:

```typescript
// middleware.ts - Add rate limiting
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
})

export async function middleware(request: NextRequest) {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1'
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)
    
    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
        },
      })
    }
  }
  
  // Continue with existing middleware...
}
```

## Sprint Deliverables Checklist

### Database Optimization
- [ ] Apply all performance indexes
- [ ] Create dashboard stats RPC function
- [ ] Implement query result limits
- [ ] Add database connection pooling config
- [ ] Set up slow query monitoring

### AI Performance
- [ ] Implement sliding context window
- [ ] Add prompt caching system
- [ ] Create token counting utilities
- [ ] Set up response time monitoring
- [ ] Test concurrent AI requests

### Caching Layer
- [ ] Implement performance cache class
- [ ] Add caching to product queries
- [ ] Cache user dashboard data
- [ ] Set up cache invalidation logic
- [ ] Monitor cache hit rates

### Rate Limiting
- [ ] Configure Redis connection
- [ ] Implement middleware rate limiting
- [ ] Add per-user AI rate limits
- [ ] Create rate limit headers
- [ ] Test under load conditions

### Load Testing
- [ ] Test dashboard with 10K+ orders
- [ ] Simulate 100 concurrent AI sessions
- [ ] Stress test payment webhook
- [ ] Verify index effectiveness
- [ ] Document performance baselines

## What to Watch For

**During Implementation**:
- Index creation can lock tables briefly - run during low traffic
- Cache invalidation bugs can serve stale data
- Over-aggressive rate limiting frustrates power users
- Monitor memory usage with caching enabled

**Post-Deployment**:
- Track 95th percentile response times (not just average)
- Monitor database connection pool exhaustion
- Watch for cache memory growth
- Check if indexes are actually being used (EXPLAIN ANALYZE)

## Performance Benchmarks

Establish these baselines:
- Dashboard load: < 2 seconds (with full data)
- AI response first token: < 1 second
- Product page load: < 1 second
- Order checkout: < 3 seconds end-to-end
- Health check: < 100ms

## Long-Term Scaling Preparation

This sprint establishes the foundation for:
- 10,000+ active users
- 1M+ orders in the database
- 1,000+ daily AI conversations
- 100+ concurrent dashboard sessions

The optimizations implemented here create headroom for 10-20x growth before requiring architectural changes.

---

**Sprint Duration**: 4-5 days  
**Risk Level**: Medium (Performance issues erode trust gradually)  
**Dependencies**: Requires production-like data volumes for testing

## Sprint Completion Milestone

Your system is production-ready when:
- All critical errors are resolved
- Early warning systems are operational
- Performance benchmarks are met
- The audit loop catches issues before users do

The protective foundation is complete. Your users can trust the system to perform under pressure.