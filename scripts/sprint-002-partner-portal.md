# Sprint 002: Partner Portal & API Management

## Executive Context

**Why This Matters**: Partners (software vendors, material suppliers, industry associations) need programmatic access to MyRoofGenius's estimation capabilities to embed them into their own workflows. This sprint establishes a secure, scalable partner ecosystem that transforms MyRoofGenius from a standalone product into a platform powering the entire roofing industry.

**What This Protects**:
- API abuse through robust key management and rate limiting
- Revenue integrity with usage tracking and enforcement
- Partner data security with scoped permissions
- Platform stability with resource quotas per partner

## Implementation Steps

### 1. Partner Schema and Tables

```sql
-- Partner organizations table
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'software_vendor', 'material_supplier', 'association'
    status VARCHAR(50) DEFAULT 'pending',
    tier VARCHAR(50) DEFAULT 'starter', -- 'starter', 'professional', 'enterprise'
    contact_email VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    company_website VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(500),
    webhook_url VARCHAR(500),
    webhook_secret VARCHAR(255),
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(20) NOT NULL, -- First 8 chars for identification
    name VARCHAR(255) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    rate_limit_tier VARCHAR(50) DEFAULT 'standard',
    status VARCHAR(50) DEFAULT 'active',
    last_used_at TIMESTAMP WITH TIME ZONE,
    last_used_ip INET,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES users(id),
    revoked_reason TEXT
);

-- API usage tracking
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    ip_address INET,
    user_agent TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Webhook configurations
CREATE TABLE webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    events JSONB NOT NULL DEFAULT '[]',
    secret VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    headers JSONB DEFAULT '{}',
    retry_config JSONB DEFAULT '{"max_attempts": 3, "backoff_multiplier": 2}',
    last_success_at TIMESTAMP WITH TIME ZONE,
    last_failure_at TIMESTAMP WITH TIME ZONE,
    consecutive_failures INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Webhook delivery attempts
CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_id UUID NOT NULL,
    payload JSONB NOT NULL,
    attempt_number INTEGER DEFAULT 1,
    status VARCHAR(50) NOT NULL, -- 'pending', 'success', 'failed'
    status_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rate limit buckets
CREATE TABLE rate_limit_buckets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    bucket_key VARCHAR(255) NOT NULL,
    tokens INTEGER NOT NULL,
    last_refill_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(api_key_id, bucket_key)
);

-- Indexes for performance
CREATE INDEX idx_api_keys_partner_id ON api_keys(partner_id);
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_usage_partner_id ON api_usage(partner_id);
CREATE INDEX idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX idx_webhook_endpoints_partner_id ON webhook_endpoints(partner_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_next_retry ON webhook_deliveries(next_retry_at) WHERE status = 'pending';
CREATE INDEX idx_rate_limit_buckets_key ON rate_limit_buckets(api_key_id, bucket_key);
```

### 2. API Key Generation and Management

```typescript
// services/api-key.service.ts
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '../database';

export class ApiKeyService {
  private static readonly KEY_PREFIX = 'mrg_';
  private static readonly KEY_LENGTH = 32;
  
  static async generateApiKey(
    partnerId: string,
    name: string,
    permissions: string[] = []
  ): Promise<{ key: string; keyId: string }> {
    // Generate cryptographically secure random key
    const rawKey = crypto.randomBytes(this.KEY_LENGTH).toString('base64url');
    const fullKey = `${this.KEY_PREFIX}${rawKey}`;
    
    // Extract prefix for identification (first 12 chars)
    const keyPrefix = fullKey.substring(0, 12);
    
    // Hash the full key for storage
    const keyHash = await bcrypt.hash(fullKey, 12);
    
    // Store in database
    const result = await db.query(
      `INSERT INTO api_keys (
        partner_id, key_hash, key_prefix, name, permissions
      ) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [partnerId, keyHash, keyPrefix, name, JSON.stringify(permissions)]
    );
    
    return {
      key: fullKey,
      keyId: result.rows[0].id
    };
  }
  
  static async validateApiKey(
    apiKey: string
  ): Promise<{ valid: boolean; keyData?: any }> {
    if (!apiKey.startsWith(this.KEY_PREFIX)) {
      return { valid: false };
    }
    
    const keyPrefix = apiKey.substring(0, 12);
    
    // Find potential matches by prefix
    const candidates = await db.query(
      `SELECT id, partner_id, key_hash, permissions, status, rate_limit_tier
       FROM api_keys 
       WHERE key_prefix = $1 AND status = 'active'`,
      [keyPrefix]
    );
    
    // Verify against hash
    for (const candidate of candidates.rows) {
      const isValid = await bcrypt.compare(apiKey, candidate.key_hash);
      if (isValid) {
        // Update last used
        await db.query(
          `UPDATE api_keys 
           SET last_used_at = CURRENT_TIMESTAMP, 
               last_used_ip = $1 
           WHERE id = $2`,
          [/* request IP */, candidate.id]
        );
        
        return {
          valid: true,
          keyData: candidate
        };
      }
    }
    
    return { valid: false };
  }
  
  static async revokeApiKey(
    keyId: string,
    revokedBy: string,
    reason: string
  ): Promise<void> {
    await db.query(
      `UPDATE api_keys 
       SET status = 'revoked',
           revoked_at = CURRENT_TIMESTAMP,
           revoked_by = $1,
           revoked_reason = $2
       WHERE id = $3`,
      [revokedBy, reason, keyId]
    );
  }
  
  static async rotateApiKey(
    oldKeyId: string,
    partnerId: string
  ): Promise<{ key: string; keyId: string }> {
    // Get old key details
    const oldKey = await db.query(
      `SELECT name, permissions FROM api_keys WHERE id = $1`,
      [oldKeyId]
    );
    
    if (!oldKey.rows[0]) {
      throw new Error('API key not found');
    }
    
    // Generate new key
    const newKey = await this.generateApiKey(
      partnerId,
      `${oldKey.rows[0].name} (rotated)`,
      oldKey.rows[0].permissions
    );
    
    // Revoke old key
    await this.revokeApiKey(oldKeyId, 'system', 'Key rotation');
    
    return newKey;
  }
}
```

### 3. Partner Portal Frontend

```typescript
// pages/partners/dashboard.tsx
import React, { useState, useEffect } from 'react';
import { usePartner } from '../../hooks/usePartner';
import { ApiKeyManager } from '../../components/partners/ApiKeyManager';
import { WebhookConfig } from '../../components/partners/WebhookConfig';
import { UsageDashboard } from '../../components/partners/UsageDashboard';
import { DocumentationLinks } from '../../components/partners/DocumentationLinks';

export default function PartnerDashboard() {
  const { partner, loading } = usePartner();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) return <div>Loading...</div>;
  if (!partner) return <div>Access denied</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Partner Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {partner.name} - {partner.tier} tier
            </p>
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {['overview', 'api-keys', 'webhooks', 'usage', 'docs'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && <PartnerOverview partner={partner} />}
            {activeTab === 'api-keys' && <ApiKeyManager partnerId={partner.id} />}
            {activeTab === 'webhooks' && <WebhookConfig partnerId={partner.id} />}
            {activeTab === 'usage' && <UsageDashboard partnerId={partner.id} />}
            {activeTab === 'docs' && <DocumentationLinks />}
          </div>
        </div>
      </div>
    </div>
  );
}

// components/partners/ApiKeyManager.tsx
export function ApiKeyManager({ partnerId }: { partnerId: string }) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyDetails, setNewKeyDetails] = useState<any>(null);

  useEffect(() => {
    loadApiKeys();
  }, [partnerId]);

  const loadApiKeys = async () => {
    const response = await api.get(`/partners/${partnerId}/api-keys`);
    setApiKeys(response.data);
  };

  const createApiKey = async (name: string, permissions: string[]) => {
    const response = await api.post(`/partners/${partnerId}/api-keys`, {
      name,
      permissions
    });
    
    setNewKeyDetails(response.data);
    await loadApiKeys();
  };

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    
    await api.delete(`/partners/${partnerId}/api-keys/${keyId}`);
    await loadApiKeys();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create API Key
        </button>
      </div>

      {newKeyDetails && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-yellow-800">
            New API Key Created
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            Save this key securely. It won't be shown again.
          </p>
          <div className="mt-2 p-2 bg-white rounded border border-yellow-300">
            <code className="text-sm font-mono">{newKeyDetails.key}</code>
          </div>
          <button
            onClick={() => setNewKeyDetails(null)}
            className="mt-3 text-sm text-yellow-800 hover:text-yellow-900"
          >
            I've saved the key
          </button>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {apiKeys.map((key) => (
            <li key={key.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {key.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {key.key_prefix}... • Last used: {key.last_used_at || 'Never'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => rotateApiKey(key.id)}
                    className="text-sm text-blue-600 hover:text-blue-900"
                  >
                    Rotate
                  </button>
                  <button
                    onClick={() => revokeApiKey(key.id)}
                    className="text-sm text-red-600 hover:text-red-900"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showCreateModal && (
        <CreateApiKeyModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createApiKey}
        />
      )}
    </div>
  );
}
```

### 4. API Authentication Middleware

```typescript
// middleware/api-auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../services/api-key.service';
import { RateLimiter } from '../services/rate-limiter.service';
import { ApiUsageTracker } from '../services/api-usage-tracker.service';

interface ApiRequest extends Request {
  apiKey?: any;
  partner?: any;
}

export class ApiAuthMiddleware {
  static async authenticate(
    req: ApiRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Extract API key from header
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        return res.status(401).json({
          error: 'API key required',
          code: 'MISSING_API_KEY'
        });
      }
      
      // Validate API key
      const { valid, keyData } = await ApiKeyService.validateApiKey(apiKey);
      
      if (!valid) {
        return res.status(401).json({
          error: 'Invalid API key',
          code: 'INVALID_API_KEY'
        });
      }
      
      // Check rate limits
      const rateLimitResult = await RateLimiter.checkLimit(
        keyData.id,
        keyData.rate_limit_tier
      );
      
      if (!rateLimitResult.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: rateLimitResult.retryAfter
        });
      }
      
      // Load partner details
      const partner = await db.query(
        'SELECT * FROM partners WHERE id = $1',
        [keyData.partner_id]
      );
      
      if (!partner.rows[0] || partner.rows[0].status !== 'active') {
        return res.status(403).json({
          error: 'Partner account inactive',
          code: 'PARTNER_INACTIVE'
        });
      }
      
      // Attach to request
      req.apiKey = keyData;
      req.partner = partner.rows[0];
      
      // Track usage after response
      res.on('finish', async () => {
        await ApiUsageTracker.track({
          apiKeyId: keyData.id,
          partnerId: keyData.partner_id,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseTimeMs: Date.now() - startTime,
          requestSizeBytes: req.headers['content-length'] || 0,
          responseSizeBytes: res.get('content-length') || 0,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
      });
      
      next();
    } catch (error) {
      console.error('API authentication error:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
  
  static checkPermission(permission: string) {
    return (req: ApiRequest, res: Response, next: NextFunction) => {
      if (!req.apiKey?.permissions?.includes(permission)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'FORBIDDEN',
          required: permission
        });
      }
      next();
    };
  }
}
```

### 5. Webhook System Implementation

```typescript
// services/webhook.service.ts
import crypto from 'crypto';
import axios from 'axios';
import { db } from '../database';
import { Queue } from 'bullmq';

export class WebhookService {
  private static webhookQueue = new Queue('webhooks', {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379')
    }
  });

  static async sendWebhook(
    partnerId: string,
    eventType: string,
    eventData: any
  ): Promise<void> {
    // Get active webhook endpoints for partner
    const endpoints = await db.query(
      `SELECT * FROM webhook_endpoints 
       WHERE partner_id = $1 
       AND status = 'active' 
       AND events @> $2`,
      [partnerId, JSON.stringify([eventType])]
    );

    // Queue webhook for each endpoint
    for (const endpoint of endpoints.rows) {
      await this.webhookQueue.add('send-webhook', {
        endpointId: endpoint.id,
        eventType,
        eventData,
        eventId: crypto.randomUUID()
      });
    }
  }

  static async processWebhook(job: any): Promise<void> {
    const { endpointId, eventType, eventData, eventId } = job.data;

    // Get endpoint details
    const endpoint = await db.query(
      'SELECT * FROM webhook_endpoints WHERE id = $1',
      [endpointId]
    );

    if (!endpoint.rows[0]) {
      throw new Error('Webhook endpoint not found');
    }

    const endpointData = endpoint.rows[0];
    
    // Create delivery record
    const delivery = await db.query(
      `INSERT INTO webhook_deliveries (
        webhook_endpoint_id, event_type, event_id, payload, status
      ) VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
      [endpointId, eventType, eventId, JSON.stringify(eventData)]
    );

    const deliveryId = delivery.rows[0].id;

    try {
      // Create signature
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = this.createSignature(
        endpointData.secret,
        timestamp,
        JSON.stringify(eventData)
      );

      // Send webhook
      const response = await axios.post(endpointData.url, eventData, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Id': eventId,
          'X-Webhook-Timestamp': timestamp,
          'X-Webhook-Signature': signature,
          ...endpointData.headers
        },
        timeout: 30000,
        validateStatus: () => true // Don't throw on any status
      });

      // Update delivery status
      await db.query(
        `UPDATE webhook_deliveries 
         SET status = $1, status_code = $2, response_body = $3, delivered_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [
          response.status >= 200 && response.status < 300 ? 'success' : 'failed',
          response.status,
          JSON.stringify(response.data),
          deliveryId
        ]
      );

      if (response.status >= 200 && response.status < 300) {
        // Reset failure counter
        await db.query(
          `UPDATE webhook_endpoints 
           SET consecutive_failures = 0, last_success_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [endpointId]
        );
      } else {
        throw new Error(`Webhook failed with status ${response.status}`);
      }
    } catch (error: any) {
      // Update delivery with error
      await db.query(
        `UPDATE webhook_deliveries 
         SET status = 'failed', error_message = $1
         WHERE id = $2`,
        [error.message, deliveryId]
      );

      // Increment failure counter
      const result = await db.query(
        `UPDATE webhook_endpoints 
         SET consecutive_failures = consecutive_failures + 1,
             last_failure_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING consecutive_failures, retry_config`,
        [endpointId]
      );

      const { consecutive_failures, retry_config } = result.rows[0];

      // Schedule retry if within limits
      if (consecutive_failures < retry_config.max_attempts) {
        const delay = Math.pow(
          retry_config.backoff_multiplier || 2,
          consecutive_failures
        ) * 1000;

        await this.webhookQueue.add(
          'send-webhook',
          {
            ...job.data,
            attemptNumber: consecutive_failures + 1
          },
          { delay }
        );

        await db.query(
          `UPDATE webhook_deliveries 
           SET next_retry_at = CURRENT_TIMESTAMP + INTERVAL '${delay} milliseconds'
           WHERE id = $1`,
          [deliveryId]
        );
      } else {
        // Disable endpoint after max failures
        await db.query(
          `UPDATE webhook_endpoints 
           SET status = 'disabled'
           WHERE id = $1`,
          [endpointId]
        );
      }

      throw error;
    }
  }

  private static createSignature(
    secret: string,
    timestamp: number,
    payload: string
  ): string {
    const message = `${timestamp}.${payload}`;
    return crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');
  }

  static verifyWebhookSignature(
    secret: string,
    signature: string,
    timestamp: string,
    payload: string
  ): boolean {
    const expectedSignature = this.createSignature(
      secret,
      parseInt(timestamp),
      payload
    );
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}
```

### 6. Rate Limiting Service

```typescript
// services/rate-limiter.service.ts
import { db } from '../database';
import Redis from 'ioredis';

interface RateLimitTier {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstSize: number;
}

export class RateLimiter {
  private static redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379')
  });

  private static tiers: Record<string, RateLimitTier> = {
    starter: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      burstSize: 10
    },
    professional: {
      requestsPerMinute: 300,
      requestsPerHour: 5000,
      requestsPerDay: 50000,
      burstSize: 50
    },
    enterprise: {
      requestsPerMinute: 1000,
      requestsPerHour: 20000,
      requestsPerDay: 200000,
      burstSize: 100
    }
  };

  static async checkLimit(
    apiKeyId: string,
    tier: string
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const limits = this.tiers[tier] || this.tiers.starter;
    
    // Check multiple time windows
    const checks = [
      { window: 60, limit: limits.requestsPerMinute, key: 'min' },
      { window: 3600, limit: limits.requestsPerHour, key: 'hour' },
      { window: 86400, limit: limits.requestsPerDay, key: 'day' }
    ];

    for (const check of checks) {
      const key = `rate_limit:${apiKeyId}:${check.key}`;
      const current = await this.redis.incr(key);
      
      if (current === 1) {
        await this.redis.expire(key, check.window);
      }
      
      if (current > check.limit) {
        const ttl = await this.redis.ttl(key);
        return {
          allowed: false,
          retryAfter: ttl
        };
      }
    }

    // Token bucket for burst control
    const bucketKey = `token_bucket:${apiKeyId}`;
    const now = Date.now();
    
    const bucket = await this.redis.get(bucketKey);
    let tokens = limits.burstSize;
    let lastRefill = now;
    
    if (bucket) {
      const parsed = JSON.parse(bucket);
      tokens = parsed.tokens;
      lastRefill = parsed.lastRefill;
      
      // Refill tokens
      const timePassed = (now - lastRefill) / 1000;
      const tokensToAdd = timePassed * (limits.requestsPerMinute / 60);
      tokens = Math.min(limits.burstSize, tokens + tokensToAdd);
    }
    
    if (tokens < 1) {
      return {
        allowed: false,
        retryAfter: Math.ceil((1 - tokens) * 60 / limits.requestsPerMinute)
      };
    }
    
    // Consume token
    tokens -= 1;
    await this.redis.set(
      bucketKey,
      JSON.stringify({ tokens, lastRefill: now }),
      'EX',
      3600
    );
    
    return { allowed: true };
  }

  static async getRateLimitHeaders(
    apiKeyId: string,
    tier: string
  ): Promise<Record<string, string>> {
    const limits = this.tiers[tier] || this.tiers.starter;
    
    const hourKey = `rate_limit:${apiKeyId}:hour`;
    const current = parseInt(await this.redis.get(hourKey) || '0');
    
    return {
      'X-RateLimit-Limit': limits.requestsPerHour.toString(),
      'X-RateLimit-Remaining': Math.max(0, limits.requestsPerHour - current).toString(),
      'X-RateLimit-Reset': new Date(Date.now() + 3600000).toISOString()
    };
  }
}
```

### 7. Partner Portal API Routes

```typescript
// routes/partner.routes.ts
import { Router } from 'express';
import { PartnerController } from '../controllers/partner.controller';
import { ApiAuthMiddleware } from '../middleware/api-auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body, param } from 'express-validator';

const router = Router();

// Public routes
router.post('/partners/register',
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('type').isIn(['software_vendor', 'material_supplier', 'association']),
  validateRequest,
  PartnerController.register
);

// Partner portal routes (require partner auth)
router.use('/partners/:partnerId', PartnerAuthMiddleware.authenticate);

router.get('/partners/:partnerId/api-keys',
  param('partnerId').isUUID(),
  validateRequest,
  PartnerController.listApiKeys
);

router.post('/partners/:partnerId/api-keys',
  param('partnerId').isUUID(),
  body('name').notEmpty().trim(),
  body('permissions').isArray(),
  validateRequest,
  PartnerController.createApiKey
);

router.delete('/partners/:partnerId/api-keys/:keyId',
  param('partnerId').isUUID(),
  param('keyId').isUUID(),
  validateRequest,
  PartnerController.revokeApiKey
);

router.post('/partners/:partnerId/api-keys/:keyId/rotate',
  param('partnerId').isUUID(),
  param('keyId').isUUID(),
  validateRequest,
  PartnerController.rotateApiKey
);

router.get('/partners/:partnerId/webhooks',
  param('partnerId').isUUID(),
  validateRequest,
  PartnerController.listWebhooks
);

router.post('/partners/:partnerId/webhooks',
  param('partnerId').isUUID(),
  body('url').isURL(),
  body('events').isArray(),
  validateRequest,
  PartnerController.createWebhook
);

router.put('/partners/:partnerId/webhooks/:webhookId',
  param('partnerId').isUUID(),
  param('webhookId').isUUID(),
  validateRequest,
  PartnerController.updateWebhook
);

router.get('/partners/:partnerId/usage',
  param('partnerId').isUUID(),
  validateRequest,
  PartnerController.getUsageStats
);

// API routes (require API key auth)
router.use('/api/v1', ApiAuthMiddleware.authenticate);

router.post('/api/v1/estimates',
  ApiAuthMiddleware.checkPermission('estimates.create'),
  body('projectData').isObject(),
  validateRequest,
  ApiController.createEstimate
);

router.get('/api/v1/estimates/:id',
  ApiAuthMiddleware.checkPermission('estimates.read'),
  param('id').isUUID(),
  validateRequest,
  ApiController.getEstimate
);

export default router;
```

## Test Procedures

### Unit Tests

```typescript
// tests/unit/api-key-service.test.ts
import { ApiKeyService } from '../../services/api-key.service';

describe('ApiKeyService', () => {
  describe('generateApiKey', () => {
    it('should generate unique API keys', async () => {
      const key1 = await ApiKeyService.generateApiKey('partner1', 'Test Key 1');
      const key2 = await ApiKeyService.generateApiKey('partner1', 'Test Key 2');
      
      expect(key1.key).not.toBe(key2.key);
      expect(key1.key).toMatch(/^mrg_[A-Za-z0-9_-]{43}$/);
    });

    it('should store hashed keys in database', async () => {
      const { key, keyId } = await ApiKeyService.generateApiKey(
        'partner1',
        'Test Key'
      );
      
      // Try to find raw key in database (should fail)
      const result = await db.query(
        'SELECT key_hash FROM api_keys WHERE id = $1',
        [keyId]
      );
      
      expect(result.rows[0].key_hash).not.toBe(key);
      expect(result.rows[0].key_hash).toMatch(/^\$2[aby]\$/);
    });
  });

  describe('validateApiKey', () => {
    it('should validate correct API keys', async () => {
      const { key } = await ApiKeyService.generateApiKey('partner1', 'Test');
      const result = await ApiKeyService.validateApiKey(key);
      
      expect(result.valid).toBe(true);
      expect(result.keyData.partner_id).toBe('partner1');
    });

    it('should reject invalid API keys', async () => {
      const result = await ApiKeyService.validateApiKey('mrg_invalid_key');
      expect(result.valid).toBe(false);
    });

    it('should reject revoked keys', async () => {
      const { key, keyId } = await ApiKeyService.generateApiKey('partner1', 'Test');
      await ApiKeyService.revokeApiKey(keyId, 'user1', 'Test revocation');
      
      const result = await ApiKeyService.validateApiKey(key);
      expect(result.valid).toBe(false);
    });
  });
});
```

### Integration Tests

```typescript
// tests/integration/partner-api.test.ts
import request from 'supertest';
import { app } from '../../app';

describe('Partner API Integration', () => {
  let partnerId: string;
  let apiKey: string;
  let webhookEndpoint: string;

  beforeAll(async () => {
    // Create test partner
    const partnerRes = await request(app)
      .post('/partners/register')
      .send({
        name: 'Test Partner',
        email: 'test@partner.com',
        type: 'software_vendor'
      });
    
    partnerId = partnerRes.body.id;
    
    // Create API key
    const keyRes = await request(app)
      .post(`/partners/${partnerId}/api-keys`)
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({
        name: 'Test Key',
        permissions: ['estimates.create', 'estimates.read']
      });
    
    apiKey = keyRes.body.key;
  });

  describe('API Key Authentication', () => {
    it('should authenticate valid API keys', async () => {
      await request(app)
        .get('/api/v1/health')
        .set('X-API-Key', apiKey)
        .expect(200);
    });

    it('should reject requests without API key', async () => {
      await request(app)
        .get('/api/v1/health')
        .expect(401)
        .expect(res => {
          expect(res.body.code).toBe('MISSING_API_KEY');
        });
    });

    it('should enforce permissions', async () => {
      await request(app)
        .delete('/api/v1/estimates/123')
        .set('X-API-Key', apiKey)
        .expect(403)
        .expect(res => {
          expect(res.body.code).toBe('FORBIDDEN');
          expect(res.body.required).toBe('estimates.delete');
        });
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make requests up to limit
      const promises = [];
      for (let i = 0; i < 65; i++) {
        promises.push(
          request(app)
            .get('/api/v1/health')
            .set('X-API-Key', apiKey)
        );
      }
      
      const results = await Promise.all(promises);
      const rateLimited = results.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
      expect(rateLimited[0].body.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should include rate limit headers', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .set('X-API-Key', apiKey);
      
      expect(res.headers['x-ratelimit-limit']).toBeDefined();
      expect(res.headers['x-ratelimit-remaining']).toBeDefined();
      expect(res.headers['x-ratelimit-reset']).toBeDefined();
    });
  });

  describe('Webhooks', () => {
    beforeAll(async () => {
      // Create webhook endpoint
      const res = await request(app)
        .post(`/partners/${partnerId}/webhooks`)
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({
          url: 'https://example.com/webhook',
          events: ['estimate.created', 'estimate.updated']
        });
      
      webhookEndpoint = res.body.id;
    });

    it('should trigger webhooks on events', async (done) => {
      // Mock webhook receiver
      nock('https://example.com')
        .post('/webhook')
        .reply(200, (uri, requestBody) => {
          expect(requestBody.event).toBe('estimate.created');
          expect(requestBody.data.id).toBeDefined();
          done();
        });

      // Create estimate via API
      await request(app)
        .post('/api/v1/estimates')
        .set('X-API-Key', apiKey)
        .send({
          projectData: { name: 'Test Project' }
        })
        .expect(201);
    });

    it('should verify webhook signatures', () => {
      const secret = 'webhook_secret';
      const timestamp = Math.floor(Date.now() / 1000);
      const payload = JSON.stringify({ test: 'data' });
      
      const signature = WebhookService.createSignature(secret, timestamp, payload);
      
      const isValid = WebhookService.verifyWebhookSignature(
        secret,
        signature,
        timestamp.toString(),
        payload
      );
      
      expect(isValid).toBe(true);
    });
  });
});
```

### Security Tests

```typescript
// tests/security/api-security.test.ts
describe('API Security', () => {
  it('should prevent API key enumeration', async () => {
    const attempts = [];
    
    // Try multiple invalid keys
    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await request(app)
        .get('/api/v1/health')
        .set('X-API-Key', `mrg_invalid_${i}`)
        .expect(401);
      const duration = Date.now() - start;
      attempts.push(duration);
    }
    
    // All attempts should take similar time (constant time comparison)
    const avgDuration = attempts.reduce((a, b) => a + b) / attempts.length;
    const variance = attempts.map(d => Math.abs(d - avgDuration));
    
    expect(Math.max(...variance)).toBeLessThan(50); // Max 50ms variance
  });

  it('should sanitize webhook URLs', async () => {
    // Try to create webhook with internal URL
    await request(app)
      .post(`/partners/${partnerId}/webhooks`)
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({
        url: 'http://localhost:3000/internal',
        events: ['estimate.created']
      })
      .expect(400)
      .expect(res => {
        expect(res.body.error).toContain('Invalid webhook URL');
      });
  });

  it('should prevent webhook SSRF attacks', async () => {
    // Try various SSRF payloads
    const ssrfUrls = [
      'http://169.254.169.254/',
      'http://metadata.google.internal',
      'file:///etc/passwd',
      'http://[::1]/',
      'http://127.0.0.1:22'
    ];
    
    for (const url of ssrfUrls) {
      await request(app)
        .post(`/partners/${partnerId}/webhooks`)
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({ url, events: ['test'] })
        .expect(400);
    }
  });
});
```

## Rollback Procedures

```bash
#!/bin/bash
# rollback-partner-portal.sh

echo "Starting partner portal rollback..."

# 1. Disable partner API endpoints
kubectl set env deployment/api PARTNER_API_ENABLED=false

# 2. Revoke all active API keys
psql $DATABASE_URL << EOF
UPDATE api_keys 
SET status = 'revoked', 
    revoked_at = CURRENT_TIMESTAMP,
    revoked_reason = 'System rollback'
WHERE status = 'active';
EOF

# 3. Stop webhook processing
kubectl scale deployment/webhook-worker --replicas=0

# 4. Deploy previous version without partner features
kubectl set image deployment/api api=myroofgenius/api:pre-partner-portal

# 5. Clear webhook queues
redis-cli -h $REDIS_HOST FLUSHDB

echo "Rollback completed. Partner features disabled."
```

## Commit Messages

```
feat(partner): implement partner portal and API management

- Add partner registration and onboarding flow
- Implement secure API key generation with bcrypt hashing
- Create webhook system with retry logic and signatures
- Add multi-tier rate limiting with Redis
- Build partner dashboard for key and webhook management
- Implement API usage tracking and analytics
- Add comprehensive security measures (SSRF protection, timing attacks)
- Include full test coverage for security edge cases

BREAKING CHANGE: New API authentication required for all v1 endpoints
```

## Completion Checklist

- [ ] Partner and API key database schemas created
- [ ] API key generation with secure hashing implemented
- [ ] Partner portal frontend completed
- [ ] API authentication middleware working
- [ ] Webhook system with retries operational
- [ ] Rate limiting with multiple tiers active
- [ ] Usage tracking and analytics functional
- [ ] Security measures (SSRF, timing) implemented
- [ ] Unit tests passing with 90%+ coverage
- [ ] Integration tests verify end-to-end flows
- [ ] Security tests pass all OWASP API checks
- [ ] Performance: <50ms auth overhead
- [ ] Webhook delivery success rate >99%
- [ ] Documentation for partners complete
- [ ] Rollback procedure tested

## Post-Sprint Acceptance Criteria

1. **Security**: All API keys hashed, webhook signatures verified, SSRF protected
2. **Performance**: API auth adds <50ms latency, webhooks delivered in <5s
3. **Reliability**: Webhook retry logic handles failures, 99.9% delivery rate
4. **Scalability**: System handles 10,000+ partners, 1M+ API calls/day
5. **Developer Experience**: Clear docs, SDKs in 3+ languages, <5min integration
6. **Monitoring**: Real-time usage dashboards, alerts for anomalies
7. **Compliance**: Full audit trail, GDPR-compliant data handling