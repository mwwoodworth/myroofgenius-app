# Multi-Tenant Onboarding Playbook

## Why This Matters

If you're a system administrator bringing MyRoofGenius into your organization, every configuration decision cascades through thousands of future estimates. This playbook ensures your tenant partition operates correctly from Day 1 — protecting data boundaries, enforcing proper access, and preventing the subtle misconfigurations that create problems six months later.

## What This Protects

- **Data sovereignty** — your measurements never mix with others
- **Access integrity** — right people, right permissions, right time
- **Operational continuity** — no surprises during critical estimates
- **Audit readiness** — every decision documented and traceable

## Pre-Flight Checklist

Before starting tenant configuration, gather:

- [ ] Organization legal name and DBA variations
- [ ] List of all users with roles and email addresses
- [ ] Existing system integrations requiring API access
- [ ] Data retention requirements per your contracts
- [ ] Compliance obligations (GDPR, CCPA, industry-specific)
- [ ] Approved IP ranges for administrator access

## Phase 1: Tenant Foundation (Day 1)

### 1.1 Initialize Tenant Partition

Navigate to the provisioning portal:
```
https://provision.myroofgenius.com/enterprise
```

Enter core tenant information:
```yaml
Organization:
  legal_name: "Premier Roofing Contractors LLC"
  dba_name: "Premier Roofing"
  tenant_identifier: "premier-roof"  # permanent, cannot change
  
Contact:
  primary_admin: "jadmin@premierroofing.com"
  billing_contact: "accounting@premierroofing.com"
  security_contact: "it@premierroofing.com"
  
Configuration:
  data_residency: "us-east-1"  # or "eu-central-1" for GDPR
  retention_years: 7
  time_zone: "America/Denver"
```

**Critical**: The `tenant_identifier` becomes part of all URLs and API calls. Choose carefully.

### 1.2 Verify Tenant Isolation

Run the isolation verification test:

1. Note your assigned `tenant_id` from the confirmation email
2. Access: `https://app.myroofgenius.com/tenant/{tenant_id}/verify`
3. Run all five verification tests:
   - Database isolation check
   - Storage partition verification
   - API scope enforcement
   - Audit trail separation
   - Backup segregation confirm

**Expected result**: All tests show "PASSED" with green indicators

### 1.3 Configure Data Governance

Set retention and deletion policies:

```yaml
Data Retention:
  measurements: 7 years
  estimates: 7 years
  audit_logs: 7 years
  api_logs: 90 days
  session_data: 30 days
  
Deletion Rules:
  soft_delete_period: 30 days
  hard_delete_requires: "admin_approval"
  
Encryption:
  kms_key_rotation: 90 days
  backup_encryption: "separate_keys"
```

**What to watch for**: Shorter retention may violate contract terms

## Phase 2: Access Architecture (Day 1-2)

### 2.1 Design Role Hierarchy

Map your organization structure to MyRoofGenius roles:

```
Organization Hierarchy:
├── Executive (org:admin)
│   ├── Operations Manager (estimate:admin)
│   └── IT Administrator (system:admin)
├── Senior Estimators (estimate:senior)
│   └── Can approve others' work
├── Estimators (estimate:creator)
│   └── Create and edit own estimates
├── Field Teams (measurement:viewer)
│   └── View measurements, no editing
└── External Partners (api:readonly)
    └── CRM integration, reporting only
```

### 2.2 Create Custom Roles

For specialized needs beyond standard roles:

```json
{
  "role_name": "regional_manager",
  "description": "Manages multiple branch locations",
  "permissions": [
    "estimate:view:all_branches",
    "estimate:approve:own_region",
    "report:generate:regional",
    "user:manage:own_region"
  ],
  "data_scope": "region_filtered",
  "approval_limit": 500000
}
```

### 2.3 Implement Approval Workflows

Configure multi-level approval for high-value estimates:

```yaml
Approval Rules:
  - range: "$0 - $50,000"
    approver: "estimate:creator"  # Self-approval
    
  - range: "$50,001 - $250,000"
    approver: "estimate:senior"
    sla_hours: 4
    
  - range: "$250,001+"
    approver: "org:admin"
    sla_hours: 2
    require_note: true
```

## Phase 3: User Provisioning (Day 2-3)

### 3.1 Bulk User Import

Prepare CSV with user details:
```csv
email,first_name,last_name,role,branch,start_date
jsmith@premier.com,John,Smith,estimate:creator,Denver,2025-07-01
mjones@premier.com,Mary,Jones,estimate:senior,Denver,2025-07-01
```

Upload via Settings → Users → Bulk Import

### 3.2 Configure Authentication

Set organization-wide security policies:

```yaml
Authentication:
  password_policy:
    min_length: 12
    require_complexity: true
    expire_days: 90  # 0 for no expiration
    history_count: 12
    
  mfa_policy:
    required_for_roles: ["*:admin", "estimate:senior"]
    enforcement_date: "2025-07-15"
    methods: ["authenticator_app", "sms_backup"]
    
  session_policy:
    timeout_minutes: 30
    concurrent_limit: 3
    remember_device_days: 30
```

### 3.3 Set Up SSO (If Required)

For SAML integration:

1. Navigate to Settings → Authentication → SSO
2. Select your identity provider (Okta, Azure AD, etc.)
3. Download MyRoofGenius metadata XML
4. Configure in your IdP with:
   - Entity ID: `https://auth.myroofgenius.com/saml/{tenant_id}`
   - ACS URL: `https://auth.myroofgenius.com/saml/callback`
   - Attribute mapping:
     - Email → email
     - First Name → given_name
     - Last Name → family_name
     - Groups → memberOf

## Phase 4: Integration Setup (Day 3-4)

### 4.1 Generate API Credentials

For each system integration:

```bash
Integration: CRM Sync
Purpose: Bi-directional customer and estimate sync
Permissions: 
  - read:customers
  - write:customers
  - read:estimates
  - write:estimates
IP Restrictions: 192.168.1.0/24
Rate Limit: 100 req/min
```

Store credentials securely — they're shown only once.

### 4.2 Configure Webhooks

Set up event notifications:

```json
{
  "endpoint_url": "https://your-system.com/webhooks/myroofgenius",
  "events": [
    "estimate.created",
    "estimate.approved",
    "measurement.completed",
    "user.login_failed"
  ],
  "security": {
    "signing_algorithm": "HMAC-SHA256",
    "retry_policy": "exponential_backoff",
    "max_retries": 5
  }
}
```

### 4.3 Test Integration Flows

Run through critical workflows:

- [ ] Create test customer via API
- [ ] Trigger measurement request
- [ ] Receive webhook notification
- [ ] Update estimate status
- [ ] Verify audit trail capture

## Phase 5: Operational Configuration (Day 4-5)

### 5.1 Set Business Rules

Configure estimate defaults and constraints:

```yaml
Estimate Configuration:
  defaults:
    markup_percentage: 35
    contingency_percentage: 10
    warranty_years: 10
    payment_terms: "Net 30"
    
  constraints:
    min_project_value: 5000
    max_roof_area_sqft: 100000
    require_photos: true
    require_measurements: true
    
  templates:
    - "Commercial TPO Standard"
    - "Commercial Modified Bitumen"
    - "Metal Roof Restoration"
```

### 5.2 Configure Notifications

Set up operational alerts:

```yaml
Notifications:
  high_value_estimates:
    threshold: 100000
    recipients: ["ops-manager@premier.com"]
    
  failed_measurements:
    recipients: ["support@premier.com"]
    include_diagnostic: true
    
  unusual_activity:
    types: ["mass_export", "permission_change", "api_spike"]
    recipients: ["security@premier.com"]
```

### 5.3 Regional Settings

For multi-location operations:

```yaml
Branches:
  - name: "Denver Metro"
    address: "123 Main St, Denver, CO 80202"
    tax_rate: 8.31
    license_number: "DEN-ROOF-001"
    
  - name: "Fort Collins"
    address: "456 College Ave, Fort Collins, CO 80521"
    tax_rate: 7.5
    license_number: "FC-ROOF-001"
    
Default_Materials:
  supplier: "Beacon Building Products"
  price_list: "2025-Q3-Commercial"
  delivery_zone: "Colorado-Front-Range"
```

## Phase 6: Quality Assurance (Day 5)

### 6.1 Security Verification

Run the security checklist:

- [ ] All admin accounts have MFA enabled
- [ ] API keys are properly scoped
- [ ] Webhook endpoints use HTTPS
- [ ] IP restrictions are active
- [ ] Audit logging captures all actions

### 6.2 Operational Testing

Have a power user run through:

- [ ] Create measurement request
- [ ] Generate estimate from measurement
- [ ] Apply markup and adjustments
- [ ] Route for approval
- [ ] Export to PDF
- [ ] Send to customer
- [ ] Track acceptance

### 6.3 Integration Validation

Verify with your integrated systems:

- [ ] Data flows correctly both directions
- [ ] No duplicate records created
- [ ] Audit trail maintains integrity
- [ ] Error handling works properly
- [ ] Performance meets expectations

## Go-Live Checklist

Before opening to all users:

- [ ] All test data removed or marked
- [ ] Production webhooks verified
- [ ] Backup schedule confirmed
- [ ] Support contacts updated
- [ ] Training materials distributed
- [ ] Escalation process documented
- [ ] First-week support scheduled

## What to Watch For

**Week 1 Issues:**
- Password reset requests (normal, have process ready)
- Permission questions ("I can't see X")
- Integration timing mismatches
- Mobile app login issues

**Month 1 Patterns:**
- Audit trail gaps (adjust logging)
- Slow adoption areas (target training)
- Workflow bottlenecks (refine permissions)
- Integration edge cases

## Next Steps

1. Schedule Day 7 review with MyRoofGenius success team
2. Plan 30-day optimization based on usage patterns
3. Set quarterly access review calendar
4. Document any custom configurations
5. Register for admin certification program

---

*This playbook transforms tenant setup from a risky IT project into a controlled deployment. Every step protects your operational integrity while building toward long-term success.*