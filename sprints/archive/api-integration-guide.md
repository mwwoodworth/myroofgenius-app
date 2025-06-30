# API Integration Guide for MyRoofGenius

## Why This Matters

If you're connecting your existing systems to MyRoofGenius, you need confidence that every webhook, every API call, and every data sync operates within a protective framework. This guide ensures your integration works the first time and continues working under pressure.

## What This Protects

- **Your customer data** through tenant-isolated connections
- **Your system availability** with built-in rate limiting (300 req/min)
- **Your integration investment** with versioned, stable endpoints
- **Your compliance posture** through automatic audit logging

## How to Use This Guide

### Step 1: Obtain Your API Credentials

1. Log into MyRoofGenius with admin privileges
2. Navigate to **Settings → Developer Tools → API Keys**
3. Click **Generate New Key**
4. Select appropriate scopes:
   - `read:measurements` - Access measurement data
   - `write:estimates` - Create and modify estimates
   - `manage:webhooks` - Configure webhook endpoints
   - `audit:logs` - Access compliance logs
5. Store your credentials securely (keys are shown only once)

### Step 2: Set Up Authentication

Every API request requires a signed JWT containing your tenant scope:

```typescript
// Authentication header format
headers: {
  'Authorization': `Bearer ${your_jwt_token}`,
  'X-Tenant-ID': 'your_tenant_id',
  'X-Request-ID': 'unique_request_identifier'
}
```

**Protection built-in**: Invalid tokens fail immediately. No cross-tenant data exposure possible.

### Step 3: Configure Webhook Security

All webhooks require HMAC-SHA256 signatures:

```javascript
// Webhook validation example
const crypto = require('crypto');

function validateWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

**Timestamp tolerance**: 5 minutes. Older requests auto-reject.

### Step 4: Implement Rate Limit Handling

Your integration must respect rate limits:

```javascript
// Rate limit response handling
if (response.status === 429) {
  const retryAfter = response.headers['X-RateLimit-Reset'];
  // Wait and retry after the specified time
  await delay(retryAfter * 1000);
  return retry(request);
}
```

**Current limits**:
- 300 requests/minute per tenant
- 50 concurrent connections
- 10MB max payload size

### Step 5: Handle Tenant Partitioning

Every object includes `tenant_id`:

```json
{
  "measurement": {
    "id": "meas_123",
    "tenant_id": "tenant_abc",
    "project_id": "proj_456",
    "data": {...},
    "created_at": "2025-06-27T10:30:00Z"
  }
}
```

**Never attempt** to access resources without matching tenant scope.

## Core Endpoints

### Measurements API
```
GET  /api/v1/measurements/{id}
POST /api/v1/measurements
PUT  /api/v1/measurements/{id}
```

### Estimates API
```
GET  /api/v1/estimates/{id}
POST /api/v1/estimates
POST /api/v1/estimates/{id}/approve
```

### Webhook Management
```
GET  /api/v1/webhooks
POST /api/v1/webhooks
PUT  /api/v1/webhooks/{id}
DELETE /api/v1/webhooks/{id}
```

## Error Handling

Standard error response format:

```json
{
  "error": {
    "code": "INVALID_MEASUREMENT",
    "message": "Measurement boundaries exceed property limits",
    "details": {
      "field": "roof_area",
      "constraint": "max_area_exceeded"
    },
    "request_id": "req_xyz789"
  }
}
```

## What to Watch For

- **Token expiration**: Refresh tokens 15 minutes before expiry
- **Webhook failures**: Implement exponential backoff with max 5 retries
- **Version deprecation**: Monitor `X-API-Version` headers for warnings
- **Compliance flags**: Check `X-Compliance-Region` for data residency

## Integration Testing Checklist

- [ ] Authentication flow completes successfully
- [ ] Webhook signatures validate correctly
- [ ] Rate limiting responds appropriately
- [ ] Error handling covers all status codes
- [ ] Tenant isolation verified (attempt cross-tenant access fails)
- [ ] Audit logs capture all operations
- [ ] Regional compliance flags respected

## Next Steps

1. Review our [Postman collection](https://postman.myroofgenius.com) for example requests
2. Join our Developer Slack for implementation support
3. Schedule architectural review for enterprise integrations

---

*This guide protects your integration from common failure modes. For advanced scenarios, contact our integration team.*