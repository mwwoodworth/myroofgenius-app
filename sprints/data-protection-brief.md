# How We Protect Your Data

## Why This Matters

If you're trusting MyRoofGenius with your measurements, estimates, and customer information, you need more than promises — you need a protective system that works even when you're not watching. This brief explains exactly how our architecture prevents data exposure, blocks unauthorized access, and maintains complete audit trails.

## What This Protects

- **Your competitive advantage** — pricing strategies stay yours alone
- **Your customer trust** — their data never leaks to competitors  
- **Your compliance standing** — automatic GDPR/CCPA readiness
- **Your operational continuity** — no single point of failure

## The Protection Layers

### Layer 1: Tenant Isolation at the Foundation

Every piece of data — from rough measurements to final contracts — lives within your tenant boundary:

```
Your Company (Tenant ABC)          Competitor (Tenant XYZ)
├── Projects                       ├── Projects
├── Measurements                   ├── Measurements  
├── Estimates                      ├── Estimates
└── [Complete isolation]           └── [Cannot access ABC data]
```

**How it works:**
- Database queries include `tenant_id` in every operation
- Attempting cross-tenant access triggers immediate rejection
- Even MyRoofGenius support cannot bypass tenant boundaries without documented approval

**What this prevents:** Accidental data mixing, competitor access, vendor conflicts

### Layer 2: Zero-Trust Verification

Every request — whether from your office, job site, or API integration — must prove its identity:

```
Request Flow:
1. User/System makes request
2. Identity verified against tenant registry
3. Permissions checked for specific action
4. Request logged with full context
5. Data returned only if all checks pass
```

**Built-in protections:**
- Sessions expire after 30 minutes of inactivity
- Location changes trigger re-authentication
- API keys scope to minimum required permissions

**What this prevents:** Credential theft impact, insider threats, integration vulnerabilities

### Layer 3: Encryption Everywhere

Your data is encrypted three times:

1. **In transit**: TLS 1.3 minimum for all connections
2. **At rest**: AES-256 encryption in database
3. **In backups**: Separate encryption keys per tenant

```
Measurement Data → TLS 1.3 → Encrypted Storage → Encrypted Backup
     (Clear)        (Secured)    (Protected)         (Isolated)
```

**Key rotation schedule:** Every 90 days automatically

**What this prevents:** Data breaches, backup exposure, man-in-the-middle attacks

### Layer 4: Audit Everything

Every action creates an immutable audit record:

```json
{
  "timestamp": "2025-06-27T10:30:00Z",
  "tenant_id": "tenant_abc",
  "user_id": "user_123",
  "action": "estimate.approved",
  "resource": "estimate_456",
  "ip_address": "192.168.1.100",
  "user_agent": "MyRoofGenius Mobile/2.1",
  "result": "success",
  "data_hash_before": "a3f5...",
  "data_hash_after": "b7c2..."
}
```

**Retention:** 7 years for compliance requirements

**What this prevents:** Unauthorized changes going unnoticed, compliance violations, dispute resolution delays

## Advanced Protections

### Rate Limiting and DDoS Defense

Your operations continue even under attack:

- **Per-tenant rate limits**: 300 requests/minute
- **Automatic scaling**: Traffic surges don't affect performance
- **Geographic distribution**: Multiple availability zones

**What this prevents:** Service disruption, resource exhaustion, neighbor impact

### Compliance Automation

Data protection regulations handled automatically:

- **GDPR exports**: One-click data package generation
- **CCPA deletion**: 7-day reversible grace period
- **Regional controls**: EU data stays in EU

**What this prevents:** Compliance penalties, manual process errors, cross-border violations

### Third-Party Integration Security

When you connect CRM, accounting, or project management systems:

```
Integration Security:
├── Unique API key per integration
├── Webhook signatures (HMAC-SHA256)
├── Scoped permissions (read-only default)
├── Automatic rate limiting
└── Full audit trail
```

**What this prevents:** Integration compromises affecting core data, runaway API costs

## How We Verify Protection

### Monthly Security Attestations

- Penetration testing by independent firms
- Vulnerability scanning (automated daily)
- Access reviews (who has access to what)
- Encryption key rotation verification

### Real-Time Monitoring

Our Security Operations Center watches for:
- Unusual access patterns
- Cross-tenant attempts
- Mass data exports
- Geographic anomalies

Alert response time: <15 minutes for critical events

### Compliance Certifications

**Current:**
- SOC 2 Type I (achieved)
- GDPR compliance framework
- CCPA registered data broker

**In Progress:**
- SOC 2 Type II (Q3 2025)
- ISO 27001 (Q4 2025)

## What This Means for You

### During Normal Operations

- Work without worrying about data security
- Share API access with confidence  
- Meet customer security questionnaires easily
- Focus on estimates, not encryption

### During Security Events

- Automatic containment of threats
- Clear communication within 1 hour
- Full incident report within 72 hours
- No finger-pointing — just resolution

### During Audits

- One-click compliance reports
- Complete audit trails ready
- No scrambling for documentation
- Pass security reviews faster

## Common Security Questions

**"Can MyRoofGenius employees see our data?"**
Only with documented approval for support issues, and all access is logged and reviewed.

**"What if someone steals an API key?"**
Keys are scoped to minimum permissions and can be revoked instantly. All usage is tracked.

**"How do you handle data breaches?"**
Automatic containment, customer notification within 72 hours, full forensic investigation, and credit monitoring if needed.

**"Can we bring our own encryption keys?"**
Enterprise customers can use AWS KMS with customer-managed keys.

## Your Security Checklist

- [ ] Enable two-factor authentication for all users
- [ ] Review API key permissions quarterly
- [ ] Set up security alert notifications
- [ ] Schedule annual security training
- [ ] Document your incident response team

## Next Steps

1. Access your security dashboard at `app.myroofgenius.com/security`
2. Download our full security whitepaper
3. Schedule a security architecture review
4. Join our quarterly security webinars

---

*Data protection isn't a feature — it's the foundation. Every line of code, every system design decision, every operational process protects what you've built.*