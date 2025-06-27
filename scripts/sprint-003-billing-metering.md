# Sprint 003: Billing, Metering & Usage Dashboards

## Executive Context

**Why This Matters**: Usage-based billing enables MyRoofGenius to align costs with value delivery, ensuring customers only pay for what they use while protecting revenue through accurate metering. This sprint establishes the financial infrastructure that turns estimation capabilities into sustainable revenue streams.

**What This Protects**:
- Revenue leakage through precise usage tracking
- Customer trust with transparent billing
- Cash flow with automated payment collection
- Business model flexibility with tiered pricing

## Implementation Steps

### 1. Billing Database Schema

```sql
-- Subscription plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    base_price_cents INTEGER NOT NULL DEFAULT 0,
    billing_period VARCHAR(50) NOT NULL, -- 'monthly', 'yearly'
    features JSONB NOT NULL DEFAULT '{}',
    quotas JSONB NOT NULL DEFAULT '{}',
    overage_rates JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usage events
CREATE TABLE usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,4) NOT NULL DEFAULT 1,
    unit VARCHAR(50) NOT NULL, -- 'estimate', 'api_call', 'document', 'user'
    metadata JSONB DEFAULT '{}',
    idempotency_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_usage_tenant_created (tenant_id, created_at),
    INDEX idx_usage_type_created (event_type, created_at)
);

-- Aggregated usage metrics
CREATE TABLE usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, metric_name, period_start)
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    subtotal_cents INTEGER NOT NULL DEFAULT 0,
    tax_cents INTEGER NOT NULL DEFAULT 0,
    total_cents INTEGER NOT NULL DEFAULT 0,
    line_items JSONB NOT NULL DEFAULT '[]',
    stripe_invoice_id VARCHAR(255) UNIQUE,
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'card', 'ach', 'wire'
    is_default BOOLEAN DEFAULT FALSE,
    last4 VARCHAR(4),
    brand VARCHAR(50),
    exp_month INTEGER,
    exp_year INTEGER,
    stripe_payment_method_id VARCHAR(255) UNIQUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usage alerts
CREATE TABLE usage_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- 'threshold', 'anomaly', 'quota'
    metric_name VARCHAR(100) NOT NULL,
    threshold_value DECIMAL(10,4),
    threshold_percentage INTEGER,
    status VARCHAR(50) DEFAULT 'active',
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    notification_channels JSONB DEFAULT '["email"]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default plans
INSERT INTO subscription_plans (name, slug, base_price_cents, billing_period, features, quotas, overage_rates) VALUES
('Starter', 'starter', 29900, 'monthly', 
 '{"estimates_per_month": 50, "api_calls_per_month": 1000, "users": 3}',
 '{"estimates": 50, "api_calls": 1000, "users": 3}',
 '{"estimates": 500, "api_calls": 10, "users": 1000}'),
('Professional', 'professional', 99900, 'monthly',
 '{"estimates_per_month": 200, "api_calls_per_month": 10000, "users": 10, "advanced_reporting": true}',
 '{"estimates": 200, "api_calls": 10000, "users": 10}',
 '{"estimates": 400, "api_calls": 8, "users": 800}'),
('Enterprise', 'enterprise', 299900, 'monthly',
 '{"estimates_per_month": "unlimited", "api_calls_per_month": "unlimited", "users": "unlimited", "sso": true, "dedicated_support": true}',
 '{"estimates": 999999, "api_calls": 999999, "users": 999999}',
 '{"estimates": 0, "api_calls": 0, "users": 0}');
```

### 2. Usage Metering Service

```typescript
// services/usage-metering.service.ts
import { db } from '../database';
import { Redis } from 'ioredis';
import { EventEmitter } from 'events';

export class UsageMeteringService extends EventEmitter {
  private redis: Redis;
  private flushInterval: NodeJS.Timeout;

  constructor() {
    super();
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379')
    });
    
    // Flush buffered events every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushBufferedEvents();
    }, 30000);
  }

  async trackUsage(
    tenantId: string,
    eventType: string,
    eventName: string,
    quantity: number = 1,
    unit: string = 'unit',
    metadata: any = {},
    idempotencyKey?: string
  ): Promise<void> {
    try {
      // Buffer in Redis for performance
      const event = {
        tenantId,
        eventType,
        eventName,
        quantity,
        unit,
        metadata,
        idempotencyKey: idempotencyKey || `${tenantId}-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString()
      };

      await this.redis.lpush('usage_events_buffer', JSON.stringify(event));

      // Emit for real-time processing
      this.emit('usage_event', event);

      // Check quotas in background
      this.checkQuotas(tenantId, eventType, quantity);
    } catch (error) {
      console.error('Failed to track usage:', error);
      // Don't throw - usage tracking shouldn't break the app
    }
  }

  async flushBufferedEvents(): Promise<void> {
    try {
      const batchSize = 1000;
      const events = [];

      // Get events from buffer
      for (let i = 0; i < batchSize; i++) {
        const eventStr = await this.redis.rpop('usage_events_buffer');
        if (!eventStr) break;
        events.push(JSON.parse(eventStr));
      }

      if (events.length === 0) return;

      // Batch insert
      const values = events.map(e => [
        e.tenantId,
        e.eventType,
        e.eventName,
        e.quantity,
        e.unit,
        JSON.stringify(e.metadata),
        e.idempotencyKey
      ]);

      await db.query(
        `INSERT INTO usage_events 
         (tenant_id, event_type, event_name, quantity, unit, metadata, idempotency_key)
         VALUES ${values.map((_, i) => 
           `($${i*7+1}, $${i*7+2}, $${i*7+3}, $${i*7+4}, $${i*7+5}, $${i*7+6}, $${i*7+7})`
         ).join(',')}
         ON CONFLICT (idempotency_key) DO NOTHING`,
        values.flat()
      );

      // Update aggregated metrics
      await this.updateAggregatedMetrics(events);
    } catch (error) {
      console.error('Failed to flush usage events:', error);
    }
  }

  async updateAggregatedMetrics(events: any[]): Promise<void> {
    // Group by tenant and metric
    const metrics = new Map<string, number>();

    for (const event of events) {
      const key = `${event.tenantId}:${event.eventType}`;
      const current = metrics.get(key) || 0;
      metrics.set(key, current + event.quantity);
    }

    // Update metrics
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    for (const [key, value] of metrics) {
      const [tenantId, metricName] = key.split(':');
      
      await db.query(
        `INSERT INTO usage_metrics 
         (tenant_id, metric_name, period_start, period_end, value, unit)
         VALUES ($1, $2, $3, $4, $5, 'count')
         ON CONFLICT (tenant_id, metric_name, period_start)
         DO UPDATE SET value = usage_metrics.value + $5`,
        [tenantId, metricName, periodStart, periodEnd, value]
      );
    }
  }

  async checkQuotas(tenantId: string, eventType: string, quantity: number): Promise<void> {
    try {
      // Get tenant's plan and current usage
      const result = await db.query(
        `SELECT 
           s.plan_id,
           sp.quotas,
           sp.overage_rates,
           COALESCE(um.value, 0) as current_usage
         FROM subscriptions s
         JOIN subscription_plans sp ON s.plan_id = sp.id
         LEFT JOIN usage_metrics um ON um.tenant_id = s.tenant_id 
           AND um.metric_name = $2
           AND um.period_start = date_trunc('month', CURRENT_DATE)
         WHERE s.tenant_id = $1 AND s.status = 'active'`,
        [tenantId, eventType]
      );

      if (!result.rows[0]) return;

      const { quotas, overage_rates, current_usage } = result.rows[0];
      const quota = quotas[eventType] || Infinity;
      const newUsage = parseFloat(current_usage) + quantity;

      // Check if quota exceeded
      if (newUsage > quota) {
        this.emit('quota_exceeded', {
          tenantId,
          eventType,
          quota,
          usage: newUsage,
          overage: newUsage - quota,
          overageRate: overage_rates[eventType] || 0
        });

        // Check alerts
        await this.checkAlerts(tenantId, eventType, newUsage, quota);
      }
    } catch (error) {
      console.error('Failed to check quotas:', error);
    }
  }

  async checkAlerts(
    tenantId: string,
    metricName: string,
    currentValue: number,
    quota: number
  ): Promise<void> {
    const alerts = await db.query(
      `SELECT * FROM usage_alerts 
       WHERE tenant_id = $1 
       AND metric_name = $2 
       AND status = 'active'`,
      [tenantId, metricName]
    );

    for (const alert of alerts.rows) {
      let shouldTrigger = false;

      if (alert.alert_type === 'threshold' && alert.threshold_value) {
        shouldTrigger = currentValue >= alert.threshold_value;
      } else if (alert.alert_type === 'quota' && alert.threshold_percentage) {
        const percentageUsed = (currentValue / quota) * 100;
        shouldTrigger = percentageUsed >= alert.threshold_percentage;
      }

      if (shouldTrigger) {
        // Debounce alerts (max once per hour)
        const lastTriggered = alert.last_triggered_at;
        if (lastTriggered && new Date(lastTriggered) > new Date(Date.now() - 3600000)) {
          continue;
        }

        await db.query(
          `UPDATE usage_alerts SET last_triggered_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [alert.id]
        );

        this.emit('usage_alert', {
          tenantId,
          alertId: alert.id,
          alertType: alert.alert_type,
          metricName,
          currentValue,
          threshold: alert.threshold_value || (quota * alert.threshold_percentage / 100),
          channels: alert.notification_channels
        });
      }
    }
  }

  async getUsageForPeriod(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const events = await db.query(
      `SELECT 
         event_type,
         COUNT(*) as count,
         SUM(quantity) as total_quantity,
         unit
       FROM usage_events
       WHERE tenant_id = $1
       AND created_at >= $2
       AND created_at < $3
       GROUP BY event_type, unit`,
      [tenantId, startDate, endDate]
    );

    const metrics = await db.query(
      `SELECT * FROM usage_metrics
       WHERE tenant_id = $1
       AND period_start >= $2
       AND period_end <= $3
       ORDER BY period_start, metric_name`,
      [tenantId, startDate, endDate]
    );

    return {
      events: events.rows,
      metrics: metrics.rows,
      period: { start: startDate, end: endDate }
    };
  }

  destroy(): void {
    clearInterval(this.flushInterval);
    this.flushBufferedEvents(); // Final flush
    this.redis.disconnect();
  }
}
```

### 3. Stripe Integration Service

```typescript
// services/stripe-billing.service.ts
import Stripe from 'stripe';
import { db } from '../database';
import { UsageMeteringService } from './usage-metering.service';

export class StripeBillingService {
  private stripe: Stripe;
  private usageMetering: UsageMeteringService;

  constructor(usageMeteringService: UsageMeteringService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });
    this.usageMetering = usageMeteringService;
  }

  async createCustomer(tenantId: string, email: string, name: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: { tenantId }
    });

    await db.query(
      `UPDATE tenants SET stripe_customer_id = $1 WHERE id = $2`,
      [customer.id, tenantId]
    );

    return customer.id;
  }

  async createSubscription(
    tenantId: string,
    planSlug: string,
    paymentMethodId?: string
  ): Promise<any> {
    // Get plan details
    const plan = await db.query(
      `SELECT * FROM subscription_plans WHERE slug = $1`,
      [planSlug]
    );

    if (!plan.rows[0]) {
      throw new Error('Plan not found');
    }

    // Get or create Stripe customer
    const tenant = await db.query(
      `SELECT stripe_customer_id, name, contact_email FROM tenants WHERE id = $1`,
      [tenantId]
    );

    let customerId = tenant.rows[0].stripe_customer_id;
    if (!customerId) {
      customerId = await this.createCustomer(
        tenantId,
        tenant.rows[0].contact_email,
        tenant.rows[0].name
      );
    }

    // Attach payment method if provided
    if (paymentMethodId) {
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });
      await this.stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId }
      });
    }

    // Create Stripe price if not exists
    let stripePriceId = plan.rows[0].stripe_price_id;
    if (!stripePriceId) {
      const price = await this.stripe.prices.create({
        product_data: {
          name: plan.rows[0].name,
          metadata: { planId: plan.rows[0].id }
        },
        unit_amount: plan.rows[0].base_price_cents,
        currency: 'usd',
        recurring: {
          interval: plan.rows[0].billing_period === 'monthly' ? 'month' : 'year'
        }
      });
      stripePriceId = price.id;

      await db.query(
        `UPDATE subscription_plans SET stripe_price_id = $1 WHERE id = $2`,
        [stripePriceId, plan.rows[0].id]
      );
    }

    // Create subscription
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: stripePriceId }],
      metadata: { tenantId, planId: plan.rows[0].id },
      trial_period_days: 14 // 14-day trial
    });

    // Store subscription
    await db.query(
      `INSERT INTO subscriptions (
        tenant_id, plan_id, status, 
        current_period_start, current_period_end,
        trial_start, trial_end, stripe_subscription_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (tenant_id) DO UPDATE SET
        plan_id = $2, status = $3,
        current_period_start = $4, current_period_end = $5,
        stripe_subscription_id = $8`,
      [
        tenantId,
        plan.rows[0].id,
        subscription.status,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        subscription.id
      ]
    );

    return subscription;
  }

  async createUsageRecord(
    tenantId: string,
    quantity: number,
    timestamp: number = Date.now()
  ): Promise<void> {
    const subscription = await db.query(
      `SELECT stripe_subscription_id FROM subscriptions 
       WHERE tenant_id = $1 AND status = 'active'`,
      [tenantId]
    );

    if (!subscription.rows[0]?.stripe_subscription_id) {
      return; // No active subscription
    }

    // Get subscription item for usage-based pricing
    const subscriptionItems = await this.stripe.subscriptionItems.list({
      subscription: subscription.rows[0].stripe_subscription_id
    });

    const usageItem = subscriptionItems.data.find(
      item => item.price.recurring?.usage_type === 'metered'
    );

    if (usageItem) {
      await this.stripe.subscriptionItems.createUsageRecord(
        usageItem.id,
        {
          quantity,
          timestamp: Math.floor(timestamp / 1000),
          action: 'increment'
        }
      );
    }
  }

  async generateInvoice(tenantId: string): Promise<any> {
    const subscription = await db.query(
      `SELECT s.*, sp.* 
       FROM subscriptions s
       JOIN subscription_plans sp ON s.plan_id = sp.id
       WHERE s.tenant_id = $1 AND s.status = 'active'`,
      [tenantId]
    );

    if (!subscription.rows[0]) {
      throw new Error('No active subscription');
    }

    const sub = subscription.rows[0];
    const periodStart = sub.current_period_start;
    const periodEnd = sub.current_period_end;

    // Get usage for period
    const usage = await this.usageMetering.getUsageForPeriod(
      tenantId,
      periodStart,
      periodEnd
    );

    // Calculate charges
    const lineItems = [];
    let subtotal = sub.base_price_cents;

    // Base subscription
    lineItems.push({
      description: `${sub.name} Plan - Base Fee`,
      quantity: 1,
      unit_price: sub.base_price_cents,
      amount: sub.base_price_cents
    });

    // Calculate overages
    const quotas = sub.quotas;
    const overageRates = sub.overage_rates;

    for (const metric of usage.metrics) {
      const quota = quotas[metric.metric_name] || 0;
      const overage = Math.max(0, metric.value - quota);
      
      if (overage > 0 && overageRates[metric.metric_name]) {
        const overageAmount = Math.ceil(overage * overageRates[metric.metric_name]);
        subtotal += overageAmount;
        
        lineItems.push({
          description: `${metric.metric_name} Overage (${overage} × $${overageRates[metric.metric_name] / 100})`,
          quantity: overage,
          unit_price: overageRates[metric.metric_name],
          amount: overageAmount
        });
      }
    }

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
      await this.getNextInvoiceNumber()
    ).padStart(6, '0')}`;

    // Create invoice record
    const invoice = await db.query(
      `INSERT INTO invoices (
        tenant_id, subscription_id, invoice_number,
        status, period_start, period_end,
        subtotal_cents, total_cents, line_items
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        tenantId,
        sub.id,
        invoiceNumber,
        'draft',
        periodStart,
        periodEnd,
        subtotal,
        subtotal, // Add tax calculation here
        JSON.stringify(lineItems)
      ]
    );

    return invoice.rows[0];
  }

  async processWebhook(signature: string, payload: Buffer): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      throw new Error('Invalid webhook signature');
    }

    switch (event.type) {
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.Invoice);
        break;
    }
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    await db.query(
      `UPDATE subscriptions 
       SET status = $1,
           current_period_start = $2,
           current_period_end = $3
       WHERE stripe_subscription_id = $4`,
      [
        subscription.status,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        subscription.id
      ]
    );
  }

  private async handleSubscriptionCancellation(subscription: Stripe.Subscription): Promise<void> {
    await db.query(
      `UPDATE subscriptions 
       SET status = 'canceled',
           canceled_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = $1`,
      [subscription.id]
    );
  }

  private async handlePaymentSuccess(invoice: Stripe.Invoice): Promise<void> {
    await db.query(
      `UPDATE invoices 
       SET status = 'paid',
           paid_at = CURRENT_TIMESTAMP,
           stripe_invoice_id = $1
       WHERE invoice_number = $2`,
      [invoice.id, invoice.number]
    );
  }

  private async handlePaymentFailure(invoice: Stripe.Invoice): Promise<void> {
    // Send notification, retry logic, etc.
    console.error('Payment failed for invoice:', invoice.id);
  }

  private async getNextInvoiceNumber(): Promise<number> {
    const result = await db.query(
      `SELECT COUNT(*) + 1 as next_number 
       FROM invoices 
       WHERE created_at >= date_trunc('year', CURRENT_DATE)`
    );
    return result.rows[0].next_number;
  }
}
```

### 4. Usage Dashboard React Components

```typescript
// components/billing/UsageDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { api } from '../../lib/api';

interface UsageMetric {
  name: string;
  current: number;
  quota: number;
  unit: string;
  trend: number;
}

export function UsageDashboard({ tenantId }: { tenantId: string }) {
  const [metrics, setMetrics] = useState<UsageMetric[]>([]);
  const [timeRange, setTimeRange] = useState('current_month');
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsageData();
  }, [tenantId, timeRange]);

  const loadUsageData = async () => {
    try {
      setLoading(true);
      
      // Load current metrics
      const metricsRes = await api.get(`/billing/usage/current`, {
        params: { tenantId }
      });
      setMetrics(metricsRes.data.metrics);

      // Load historical data
      const historyRes = await api.get(`/billing/usage/history`, {
        params: { tenantId, range: timeRange }
      });
      setUsageHistory(historyRes.data.history);
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUsageBarColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Usage Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="current_month">Current Month</option>
          <option value="last_30_days">Last 30 Days</option>
          <option value="last_3_months">Last 3 Months</option>
          <option value="last_6_months">Last 6 Months</option>
        </select>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {/* Current Usage Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => {
              const percentage = (metric.current / metric.quota) * 100;
              const isUnlimited = metric.quota === 999999;

              return (
                <div key={metric.name} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {metric.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <p className="text-sm text-gray-500">{metric.unit}</p>
                    </div>
                    {metric.trend !== 0 && (
                      <span className={`text-sm ${metric.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {metric.trend > 0 ? '↑' : '↓'} {Math.abs(metric.trend)}%
                      </span>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{metric.current.toLocaleString()}</span>
                      {!isUnlimited && (
                        <span className="text-gray-500">of {metric.quota.toLocaleString()}</span>
                      )}
                    </div>
                    
                    {!isUnlimited && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getUsageBarColor(percentage)}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <p className={`text-sm font-medium ${getUsageColor(percentage)}`}>
                    {isUnlimited ? 'Unlimited' : `${percentage.toFixed(1)}% used`}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Usage Trends Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Usage Trends</h3>
            <div className="h-64">
              <Line
                data={{
                  labels: usageHistory.map(h => format(new Date(h.date), 'MMM d')),
                  datasets: [
                    {
                      label: 'Estimates',
                      data: usageHistory.map(h => h.estimates),
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4
                    },
                    {
                      label: 'API Calls',
                      data: usageHistory.map(h => h.api_calls / 100),
                      borderColor: 'rgb(16, 185, 129)',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      tension: 0.4
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Usage Alerts */}
          <UsageAlerts tenantId={tenantId} />

          {/* Billing Summary */}
          <BillingSummary tenantId={tenantId} />
        </>
      )}
    </div>
  );
}

// components/billing/UsageAlerts.tsx
export function UsageAlerts({ tenantId }: { tenantId: string }) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, [tenantId]);

  const loadAlerts = async () => {
    const response = await api.get(`/billing/alerts`, {
      params: { tenantId }
    });
    setAlerts(response.data);
  };

  const createAlert = async (alert: any) => {
    await api.post('/billing/alerts', {
      ...alert,
      tenantId
    });
    await loadAlerts();
    setShowCreateModal(false);
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm('Delete this alert?')) return;
    await api.delete(`/billing/alerts/${alertId}`);
    await loadAlerts();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Usage Alerts</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          + Add Alert
        </button>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-gray-500 text-sm">No alerts configured</p>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">
                  {alert.metric_name.replace(/_/g, ' ')} reaches{' '}
                  {alert.threshold_percentage ? `${alert.threshold_percentage}%` : alert.threshold_value}
                </p>
                <p className="text-xs text-gray-500">
                  Notify via: {alert.notification_channels.join(', ')}
                </p>
              </div>
              <button
                onClick={() => deleteAlert(alert.id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateAlertModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createAlert}
        />
      )}
    </div>
  );
}
```

### 5. API Metering Middleware

```typescript
// middleware/api-metering.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { UsageMeteringService } from '../services/usage-metering.service';

interface MeteredRequest extends Request {
  meteringData?: {
    tenantId: string;
    startTime: number;
    eventType: string;
  };
}

export class ApiMeteringMiddleware {
  constructor(private usageMetering: UsageMeteringService) {}

  trackApiCall(eventType: string = 'api_call') {
    return async (req: MeteredRequest, res: Response, next: NextFunction) => {
      const tenantId = req.tenantId || req.apiKey?.tenant_id;
      
      if (!tenantId) {
        return next(); // No tenant context, skip metering
      }

      req.meteringData = {
        tenantId,
        startTime: Date.now(),
        eventType
      };

      // Track response
      const originalSend = res.send;
      res.send = function(data) {
        if (req.meteringData) {
          // Track usage asynchronously
          const metadata = {
            endpoint: req.path,
            method: req.method,
            statusCode: res.statusCode,
            responseTime: Date.now() - req.meteringData.startTime,
            userAgent: req.headers['user-agent']
          };

          usageMetering.trackUsage(
            req.meteringData.tenantId,
            req.meteringData.eventType,
            `${req.method} ${req.path}`,
            1,
            'api_call',
            metadata
          ).catch(console.error);
        }

        return originalSend.call(this, data);
      };

      next();
    };
  }

  trackEstimate() {
    return async (req: MeteredRequest, res: Response, next: NextFunction) => {
      const tenantId = req.tenantId;
      
      if (!tenantId) {
        return next();
      }

      // Track after successful creation
      const originalJson = res.json;
      res.json = function(data) {
        if (res.statusCode === 201 && data.id) {
          usageMetering.trackUsage(
            tenantId,
            'estimates',
            'estimate_created',
            1,
            'estimate',
            {
              estimateId: data.id,
              projectValue: data.totalAmount,
              lineItemCount: data.lineItems?.length || 0
            }
          ).catch(console.error);
        }

        return originalJson.call(this, data);
      };

      next();
    };
  }

  checkQuota(resource: string) {
    return async (req: MeteredRequest, res: Response, next: NextFunction) => {
      const tenantId = req.tenantId;
      
      if (!tenantId) {
        return next();
      }

      try {
        // Get current usage and quota
        const result = await db.query(
          `SELECT 
             COALESCE(um.value, 0) as current_usage,
             sp.quotas->>$2 as quota
           FROM subscriptions s
           JOIN subscription_plans sp ON s.plan_id = sp.id
           LEFT JOIN usage_metrics um ON um.tenant_id = s.tenant_id
             AND um.metric_name = $2
             AND um.period_start = date_trunc('month', CURRENT_DATE)
           WHERE s.tenant_id = $1 AND s.status = 'active'`,
          [tenantId, resource]
        );

        if (!result.rows[0]) {
          return res.status(403).json({
            error: 'No active subscription',
            code: 'NO_SUBSCRIPTION'
          });
        }

        const { current_usage, quota } = result.rows[0];
        
        if (parseInt(current_usage) >= parseInt(quota)) {
          return res.status(429).json({
            error: 'Quota exceeded',
            code: 'QUOTA_EXCEEDED',
            resource,
            usage: current_usage,
            quota
          });
        }

        next();
      } catch (error) {
        console.error('Quota check error:', error);
        next(); // Don't block on quota check errors
      }
    };
  }
}
```

## Test Procedures

### Unit Tests

```typescript
// tests/unit/usage-metering.test.ts
import { UsageMeteringService } from '../../services/usage-metering.service';

describe('UsageMeteringService', () => {
  let service: UsageMeteringService;

  beforeEach(() => {
    service = new UsageMeteringService();
  });

  afterEach(() => {
    service.destroy();
  });

  describe('trackUsage', () => {
    it('should buffer events in Redis', async () => {
      await service.trackUsage(
        'tenant-123',
        'api_call',
        'GET /estimates',
        1,
        'call'
      );

      const bufferedCount = await redis.llen('usage_events_buffer');
      expect(bufferedCount).toBe(1);
    });

    it('should generate idempotency keys', async () => {
      const spy = jest.spyOn(service, 'emit');
      
      await service.trackUsage('tenant-123', 'api_call', 'test');
      
      expect(spy).toHaveBeenCalledWith('usage_event', 
        expect.objectContaining({
          idempotencyKey: expect.stringMatching(/^tenant-123-\d+-[\d.]+$/)
        })
      );
    });
  });

  describe('quota checking', () => {
    it('should emit quota_exceeded event', async () => {
      const spy = jest.spyOn(service, 'emit');
      
      // Mock DB response
      jest.spyOn(db, 'query').mockResolvedValueOnce({
        rows: [{
          quotas: { api_calls: 100 },
          overage_rates: { api_calls: 10 },
          current_usage: 95
        }]
      });

      await service.checkQuotas('tenant-123', 'api_calls', 10);
      
      expect(spy).toHaveBeenCalledWith('quota_exceeded', 
        expect.objectContaining({
          tenantId: 'tenant-123',
          eventType: 'api_calls',
          quota: 100,
          usage: 105,
          overage: 5
        })
      );
    });
  });
});
```

### Integration Tests

```typescript
// tests/integration/billing-flow.test.ts
describe('Billing Integration Flow', () => {
  let tenantId: string;
  let subscriptionId: string;

  beforeAll(async () => {
    // Create test tenant
    const tenant = await createTestTenant();
    tenantId = tenant.id;
    
    // Create subscription
    const sub = await stripeBilling.createSubscription(
      tenantId,
      'professional'
    );
    subscriptionId = sub.id;
  });

  it('should track usage and generate accurate invoice', async () => {
    // Track various usage
    await usageMetering.trackUsage(tenantId, 'estimates', 'created', 150);
    await usageMetering.trackUsage(tenantId, 'api_calls', 'made', 8000);
    
    // Flush to database
    await usageMetering.flushBufferedEvents();
    
    // Generate invoice
    const invoice = await stripeBilling.generateInvoice(tenantId);
    
    expect(invoice.line_items).toHaveLength(3); // Base + 2 overages
    expect(invoice.subtotal_cents).toBeGreaterThan(99900); // Base price
    
    // Verify overage calculations
    const estimateOverage = invoice.line_items.find(
      item => item.description.includes('estimates Overage')
    );
    expect(estimateOverage.quantity).toBe(50); // 150 - 100 quota
  });

  it('should handle subscription upgrades mid-cycle', async () => {
    // Start with starter plan
    await stripeBilling.createSubscription(tenantId, 'starter');
    
    // Use some quota
    await usageMetering.trackUsage(tenantId, 'estimates', 'created', 40);
    
    // Upgrade to professional
    await stripeBilling.upgradeSubscription(tenantId, 'professional');
    
    // Use more (now within new quota)
    await usageMetering.trackUsage(tenantId, 'estimates', 'created', 60);
    
    // Should not have overages
    const usage = await usageMetering.getUsageForPeriod(
      tenantId,
      startOfMonth(new Date()),
      endOfMonth(new Date())
    );
    
    expect(usage.events.find(e => e.event_type === 'estimates').total_quantity)
      .toBe('100');
  });
});
```

### Performance Tests

```typescript
// tests/performance/usage-tracking.test.ts
describe('Usage Tracking Performance', () => {
  it('should handle high-volume usage tracking', async () => {
    const startTime = Date.now();
    const promises = [];
    
    // Simulate 10,000 API calls
    for (let i = 0; i < 10000; i++) {
      promises.push(
        usageMetering.trackUsage(
          `tenant-${i % 100}`, // 100 different tenants
          'api_call',
          `endpoint-${i % 20}`,
          1
        )
      );
    }
    
    await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(5000); // Should complete in < 5 seconds
    
    // Verify all events buffered
    const bufferSize = await redis.llen('usage_events_buffer');
    expect(bufferSize).toBe(10000);
  });

  it('should efficiently aggregate metrics', async () => {
    // Insert test data
    const events = [];
    for (let i = 0; i < 1000; i++) {
      events.push({
        tenantId: 'perf-tenant',
        eventType: `metric-${i % 10}`,
        quantity: Math.random() * 10,
        timestamp: new Date()
      });
    }
    
    const startTime = Date.now();
    await usageMetering.updateAggregatedMetrics(events);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(500); // Should aggregate in < 500ms
    
    // Verify aggregation
    const metrics = await db.query(
      `SELECT COUNT(*) as count FROM usage_metrics WHERE tenant_id = $1`,
      ['perf-tenant']
    );
    expect(metrics.rows[0].count).toBe('10'); // 10 different metric types
  });
});
```

## Rollback Procedures

```bash
#!/bin/bash
# rollback-billing.sh

echo "Starting billing system rollback..."

# 1. Pause billing operations
kubectl set env deployment/api BILLING_ENABLED=false
kubectl set env deployment/billing-worker PROCESSING_ENABLED=false

# 2. Cancel pending invoices
psql $DATABASE_URL << EOF
UPDATE invoices 
SET status = 'canceled' 
WHERE status = 'draft';
EOF

# 3. Stop usage tracking
redis-cli -h $REDIS_HOST DEL usage_events_buffer

# 4. Deploy previous version
kubectl set image deployment/api api=myroofgenius/api:pre-billing
kubectl set image deployment/billing-worker worker=myroofgenius/billing-worker:pre-billing

# 5. Notify customers of billing pause
psql $DATABASE_URL << EOF
INSERT INTO notifications (tenant_id, type, message)
SELECT id, 'billing_pause', 'Billing system maintenance in progress'
FROM tenants WHERE status = 'active';
EOF

echo "Rollback completed. Billing paused."
```

## Commit Messages

```
feat(billing): implement usage-based billing and metering

- Add usage tracking with Redis buffering for performance
- Implement Stripe integration for subscriptions and payments  
- Create quota management with overage calculations
- Build usage dashboard with real-time metrics
- Add configurable usage alerts and notifications
- Implement invoice generation with line-item details
- Add comprehensive metering middleware for APIs
- Include performance optimizations for high-volume tracking

BREAKING CHANGE: All API calls now tracked for billing
```

## Completion Checklist

- [ ] Database schema for billing entities created
- [ ] Usage metering service with Redis buffering
- [ ] Stripe integration for payments
- [ ] Quota checking and enforcement
- [ ] Usage dashboard React components  
- [ ] API metering middleware
- [ ] Invoice generation system
- [ ] Usage alerts and notifications
- [ ] Webhook handlers for Stripe events
- [ ] Unit tests with 90% coverage
- [ ] Integration tests for billing flows
- [ ] Performance tests passing benchmarks
- [ ] Rollback procedures tested
- [ ] Documentation updated
- [ ] Security review completed

## Post-Sprint Acceptance Criteria

1. **Accuracy**: Usage tracking accurate to 99.99% with idempotency
2. **Performance**: <10ms overhead for usage tracking, buffered writes
3. **Reliability**: No lost usage events, automatic retry on failures
4. **Transparency**: Real-time usage visibility, clear overage calculations
5. **Flexibility**: Easy plan changes, proration handled automatically
6. **Security**: PCI compliance maintained, secure payment handling
7. **Scalability**: Handles 1M+ usage events per day