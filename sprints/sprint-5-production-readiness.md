# Sprint 5: Production Readiness & Early Warning Systems

## Why This Matters

Silent failures are trust killers. When your checkout process breaks at 3 AM, when a database query starts timing out during peak hours, when AI responses fail without warning — these aren't just bugs. They're breaches in the protective layer your users depend on. This sprint builds the early warning systems that catch failures before users experience them.

## What This Protects

- Prevents silent API failures from breaking critical workflows
- Creates visibility into system health before users report issues
- Protects your ability to respond quickly when pressure peaks
- Builds an audit trail that turns incidents into improvements

## Sprint Objectives

### 🔴 Critical Implementation: Comprehensive Error Logging

**Current Issue**: Errors vanish into the void, leaving you blind during failures

**If you're a contractor** whose team relies on the estimator at dawn, system failures without alerts mean discovered disasters.

**Field-Ready Implementation**:
```typescript
// app/lib/monitoring.ts - Centralized error handling
import * as Sentry from '@sentry/nextjs'

export interface SystemError {
  context: 'api' | 'database' | 'payment' | 'ai' | 'email'
  severity: 'low' | 'medium' | 'high' | 'critical'
  user_id?: string
  metadata?: Record<string, any>
}

export async function captureError(
  error: Error,
  details: SystemError
) {
  // Log to console for development
  console.error(`[${details.context}] ${error.message}`, {
    ...details,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  })
  
  // Send to Sentry with context
  Sentry.captureException(error, {
    tags: {
      context: details.context,
      severity: details.severity,
    },
    user: details.user_id ? { id: details.user_id } : undefined,
    extra: details.metadata,
  })
  
  // Critical errors trigger immediate alerts
  if (details.severity === 'critical') {
    await sendOpsAlert({
      type: 'critical_error',
      context: details.context,
      message: error.message,
      timestamp: new Date().toISOString(),
    })
  }
  
  // Store in database for audit trail
  const supabase = createServiceRoleClient()
  await supabase.from('system_errors').insert({
    error_type: error.name,
    message: error.message,
    context: details.context,
    severity: details.severity,
    user_id: details.user_id,
    metadata: details.metadata,
    stack_trace: error.stack,
  })
}

// Usage in API routes
try {
  const session = await stripe.checkout.sessions.create(...)
} catch (error) {
  await captureError(error as Error, {
    context: 'payment',
    severity: 'critical',
    user_id: user.id,
    metadata: { price_id, product_id },
  })
  throw error // Re-throw after logging
}
```

### 🔴 Critical Implementation: Health Monitoring Dashboard

**Current Issue**: No visibility into system status until users complain

**If you're a project manager** coordinating a deadline-critical estimate, knowing system status prevents wasted hours.

**Enhance Existing Health Check**:
```typescript
// app/api/health/route.ts - Comprehensive health monitoring
export async function GET() {
  const healthChecks = {
    database: await checkDatabase(),
    storage: await checkStorage(),
    ai_providers: await checkAIProviders(),
    payment: await checkStripeConnection(),
    email: await checkEmailService(),
    cache: await checkRedisConnection(),
  }
  
  // Calculate overall health
  const criticalServices = ['database', 'payment']
  const allHealthy = Object.values(healthChecks).every(h => h.status === 'healthy')
  const criticalHealthy = criticalServices.every(
    service => healthChecks[service].status === 'healthy'
  )
  
  const overallStatus = allHealthy ? 'healthy' : 
    criticalHealthy ? 'degraded' : 'unhealthy'
  
  // Add performance metrics
  const metrics = await getSystemMetrics()
  
  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: healthChecks,
    metrics: {
      response_time_ms: metrics.avgResponseTime,
      active_users: metrics.activeUsers,
      queue_depth: metrics.queueDepth,
      error_rate: metrics.errorRate,
    },
    version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
  })
}

// Individual service checks
async function checkAIProviders() {
  const providers = ['openai', 'claude', 'gemini']
  const results = await Promise.allSettled(
    providers.map(async (provider) => {
      const start = Date.now()
      try {
        await testProviderConnection(provider)
        return {
          provider,
          status: 'healthy',
          latency: Date.now() - start,
        }
      } catch (error) {
        return {
          provider,
          status: 'unhealthy',
          error: error.message,
        }
      }
    })
  )
  
  return {
    status: results.some(r => r.value?.status === 'healthy') 
      ? 'healthy' 
      : 'unhealthy',
    providers: results.map(r => r.value),
  }
}
```

### ⚠️ Enhancement: Automated Performance Monitoring

**Build the audit loop** that turns metrics into protection:

```typescript
// scripts/monitor-performance.ts - Run via cron
async function checkPerformanceThresholds() {
  const supabase = createServiceRoleClient()
  
  // Check slow queries
  const { data: slowQueries } = await supabase
    .from('system_metrics')
    .select('*')
    .eq('type', 'database_query')
    .gt('duration_ms', 1000) // Queries over 1 second
    .gte('created_at', new Date(Date.now() - 3600000).toISOString())
    
  if (slowQueries.length > 5) {
    await sendOpsAlert({
      type: 'performance_degradation',
      message: `${slowQueries.length} slow queries in last hour`,
      queries: slowQueries.map(q => ({
        query: q.query_text,
        duration: q.duration_ms,
        table: q.table_name,
      })),
    })
  }
  
  // Check error rates
  const { count: errorCount } = await supabase
    .from('system_errors')
    .select('*', { count: 'exact' })
    .gte('created_at', new Date(Date.now() - 300000).toISOString()) // Last 5 mins
    
  if (errorCount > 10) {
    await sendOpsAlert({
      type: 'high_error_rate',
      message: `${errorCount} errors in last 5 minutes`,
      threshold: 10,
    })
  }
}
```

## Sprint Deliverables Checklist

### Monitoring Infrastructure
- [ ] Implement centralized error capture system
- [ ] Create system_errors table with proper indexes
- [ ] Enhance health check endpoint with all services
- [ ] Add performance metrics collection
- [ ] Set up critical error alerting

### Database Migrations
```sql
-- Migration: create_monitoring_tables.sql
CREATE TABLE system_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  context TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  stack_trace TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_system_errors_severity_created ON system_errors(severity, created_at DESC);
CREATE INDEX idx_system_metrics_type_created ON system_metrics(type, created_at DESC);
```

### Integration Points
- [ ] Add error handling to all API routes
- [ ] Instrument database queries for timing
- [ ] Add monitoring to AI provider calls
- [ ] Track Stripe webhook processing times
- [ ] Monitor email delivery success rates

### Alerting Setup
- [ ] Configure Sentry alerts for critical errors
- [ ] Set up Make.com webhook for ops notifications
- [ ] Create Slack integration for urgent alerts
- [ ] Document escalation procedures

## What to Watch For

**During Implementation**:
- Don't log sensitive data (passwords, full credit cards)
- Ensure error logging doesn't create infinite loops
- Test alert throttling to prevent notification floods

**Post-Deployment**:
- Monitor the monitoring (meta-monitoring for failures)
- Watch for performance impact of logging
- Review error patterns weekly for improvements
- Track mean time to detection (MTTD)

## Operational Runbook

Create these standard responses:
1. **High Error Rate**: Check recent deployments, rollback if needed
2. **Database Slowdown**: Review slow query log, check connections
3. **AI Provider Failure**: Automatic fallback to alternate provider
4. **Payment Processing Issues**: Pause new transactions, investigate

## Next Sprint Preview

Sprint 6 optimizes performance for scale — ensuring your protective systems maintain their speed even under peak load.

---

**Sprint Duration**: 3-4 days  
**Risk Level**: Medium (Operational visibility critical for trust)  
**Dependencies**: Requires production environment access