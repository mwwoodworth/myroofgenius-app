# Feature Flag Decision Framework

## Why This Matters

If you're a product owner or operations manager controlling MyRoofGenius feature rollouts, every flag decision affects thousands of estimates in progress. This framework transforms feature deployment from gut-feel releases into controlled, reversible decisions — protecting production stability while enabling rapid innovation.

## What This Protects

- **Production integrity** — new features can't break existing workflows
- **Customer trust** — beta features clearly marked, never forced
- **Team sanity** — instant rollback without code deployment
- **Compliance posture** — audit trail for every feature change

## How to Use This Framework

### Step 1: Classify Feature Risk Level

Every feature falls into one of four risk categories:

#### Low Risk (Green Path)
**Characteristics:**
- UI improvements, color changes, text updates
- No data model changes
- No integration impacts
- Easily reversible

**Flag Strategy:**
```yaml
rollout_type: "percentage"
initial_release: 10%
increment: 20% daily
monitoring_period: 48 hours
approval_required: no
```

**Example:** Updated estimate PDF layout

#### Medium Risk (Yellow Path)
**Characteristics:**
- New calculations or algorithms
- Minor workflow changes
- New third-party API calls
- Requires user adjustment

**Flag Strategy:**
```yaml
rollout_type: "opt-in"
initial_release: beta_users
increment: by_segment
monitoring_period: 1 week
approval_required: team_lead
```

**Example:** AI-powered material suggestions

#### High Risk (Orange Path)
**Characteristics:**
- Payment processing changes
- Data migration requirements
- Cross-system dependencies
- Compliance implications

**Flag Strategy:**
```yaml
rollout_type: "allowlist"
initial_release: internal_only
increment: named_accounts
monitoring_period: 2 weeks
approval_required: product_owner
audit_log: enhanced
```

**Example:** New payment gateway integration

#### Critical Risk (Red Path)
**Characteristics:**
- Security boundary changes
- Multi-tenant data access
- Regulatory compliance features
- Irreversible operations

**Flag Strategy:**
```yaml
rollout_type: "manual"
initial_release: test_tenant
increment: individual_approval
monitoring_period: 30 days
approval_required: cto
audit_log: full_capture
external_review: required
```

**Example:** GDPR deletion workflows

### Step 2: Define Success Metrics

Before enabling any flag, document success criteria:

```yaml
Feature: AI Measurement Enhancement
Success Metrics:
  - accuracy: ">92% match with manual"
  - performance: "<5 second processing"
  - adoption: ">40% of eligible users"
  - support_tickets: "<2% increase"
  - rollback_triggers:
    - error_rate: ">5%"
    - performance_degradation: ">20%"
    - user_complaints: ">10"
```

### Step 3: Configure Flag Parameters

In the Feature Flag Console:

```json
{
  "flag_name": "ai_measurement_v2",
  "description": "Enhanced AI measurement with shadow detection",
  "owner": "product_team",
  "risk_level": "medium",
  "targeting": {
    "beta_users": true,
    "enterprise_tier": false,
    "geo_regions": ["us-east", "us-west"],
    "excluded_tenants": ["gov_clients"]
  },
  "variants": {
    "control": "existing_algorithm",
    "treatment": "enhanced_ai_v2"
  },
  "monitoring": {
    "metrics": ["accuracy", "latency", "error_rate"],
    "alerts": {
      "error_spike": "pagerduty",
      "performance_drop": "slack"
    }
  }
}
```

### Step 4: Implement Progressive Rollout

Follow the deployment runway based on risk:

#### Week 1: Internal Validation
- [ ] Enable for MyRoofGenius test accounts
- [ ] Run automated test suites
- [ ] Verify audit logging
- [ ] Check performance baselines

#### Week 2: Beta Cohort
- [ ] Enable for opted-in beta users (typically 50-100)
- [ ] Monitor metrics dashboard hourly
- [ ] Collect qualitative feedback
- [ ] Document edge cases

#### Week 3: Controlled Expansion
- [ ] Expand to 10% of eligible users
- [ ] A/B test analysis comparing variants
- [ ] Support team briefing
- [ ] Rollback drill (test the kill switch)

#### Week 4: General Availability
- [ ] Expand to 50% of users
- [ ] Public changelog entry
- [ ] Documentation updates
- [ ] Monitor for 48 hours before 100%

### Step 5: Monitor and Respond

Real-time monitoring dashboard shows:

```
Feature: ai_measurement_v2
Status: ACTIVE (47% rollout)
Health: 🟢 Healthy

Metrics (Last 4 hours):
├── Accuracy: 94.2% ✓
├── Latency: 3.7s (P95) ✓
├── Error Rate: 0.3% ✓
├── Adoption: 67% ⚡
└── Rollbacks: 0

Alerts: None
Next Review: 2025-07-15 14:00 UTC
```

## Decision Trees for Common Scenarios

### Scenario 1: Performance Degradation

```
Performance drops >10%
├── Immediate: Reduce rollout percentage by 50%
├── Investigation: Check for resource constraints
├── If database related:
│   └── Rollback completely + optimize queries
└── If calculation related:
    └── Reduce batch sizes + monitor
```

### Scenario 2: User Complaints Spike

```
Support tickets increase >5%
├── Categorize complaints (bug vs preference)
├── If bug:
│   ├── Pause rollout
│   └── Fix + restart from beta
└── If preference:
    ├── Update documentation
    └── Consider UI adjustments
```

### Scenario 3: Compliance Question Raised

```
Legal/compliance flag raised
├── Immediate: Restrict to test accounts only
├── Document concern with legal team
├── If approved with modifications:
│   └── Implement changes + restart rollout
└── If rejected:
    └── Full rollback + feature redesign
```

## Feature Flag Governance

### Ownership Matrix

| Feature Type | Primary Owner | Approval Authority | Rollback Authority |
|--------------|---------------|-------------------|-------------------|
| UI/UX | Product Designer | Product Manager | On-call Engineer |
| Algorithm | Tech Lead | Engineering Manager | Tech Lead |
| Integration | Platform Team | CTO | Platform Lead |
| Compliance | Legal Liaison | CPO + Legal | CTO |

### Documentation Requirements

Every flag requires:

```markdown
# Feature Flag: [Name]

## Business Purpose
[Why this exists]

## Technical Changes
[What it modifies]

## Rollout Plan
[Phases and timeline]

## Rollback Plan
[How to disable safely]

## Success Metrics
[What indicates success]

## Dependencies
[Other systems affected]

## Contacts
- Owner: [Name] ([email])
- Approver: [Name] ([email])
- On-call: [Team] ([pager])
```

### Cleanup Protocol

Flags aren't permanent:

```yaml
Flag Lifecycle:
  created: 2025-06-01
  first_enabled: 2025-06-15
  full_rollout: 2025-07-01
  cleanup_deadline: 2025-08-01  # Remove flag code
  
Cleanup Actions:
  - Remove flag checks from code
  - Delete flag configuration
  - Archive documentation
  - Update integration tests
```

## Integration with Change Management

### Pre-Release Checklist

- [ ] Risk assessment complete
- [ ] Success metrics defined
- [ ] Rollback tested in staging
- [ ] Support team briefed
- [ ] Documentation updated
- [ ] Monitoring alerts configured

### Release Communication

```
To: product-updates@myroofgenius.com
Subject: Feature Flag Activation: AI Measurement V2

Team,

Starting progressive rollout of AI Measurement V2:
- Risk Level: Medium
- Initial Scope: 10% of beta users
- Monitoring: Dashboard at [link]
- Rollback: Use kill switch at [link]

Watch for:
- Processing times >5 seconds
- Accuracy complaints
- Integration timeouts

Questions: @product-team in Slack
```

### Post-Release Review

After full rollout, document:

1. Actual vs predicted metrics
2. Unexpected edge cases
3. Support ticket patterns
4. Performance impact
5. User adoption rate
6. Technical debt created

## What to Watch For

**Red flags requiring immediate action:**
- Error rate spike >5% above baseline
- P95 latency increase >50%
- Security scanner alerts
- Data inconsistency reports
- Compliance team escalation

**Yellow flags requiring investigation:**
- Adoption below 30% after 2 weeks
- Support tickets with common theme
- Performance degradation <20%
- Integration partner complaints
- Unusual geographic patterns

## Common Pitfalls to Avoid

1. **Flag Accumulation**: Leaving flags in code after full rollout
2. **Insufficient Monitoring**: Not watching the right metrics
3. **Rapid Rollout**: Moving too fast through risk gates
4. **Poor Communication**: Surprising support or customers
5. **No Rollback Plan**: Assuming forward-only deployment

## Next Steps

1. Review current feature backlog against risk matrix
2. Configure your first flag using this framework
3. Set up monitoring dashboard bookmarks
4. Schedule monthly flag cleanup reviews
5. Train team on rollback procedures

---

*This framework transforms feature deployment from binary launches into controlled experiments. Every flag protects production while enabling innovation at the speed of configuration, not code.*