# Incident Response Runbook

## Why This Matters

If you're the on-call engineer or incident commander when MyRoofGenius systems show stress, every minute of downtime affects active estimates worth millions. This runbook transforms panic into process — giving you exact steps, clear escalation paths, and proven recovery procedures that work under pressure.

## What This Protects

- **Customer operations** — estimates continue despite system stress
- **Data integrity** — no measurement or pricing data lost
- **Team effectiveness** — clear roles prevent confusion
- **Business reputation** — professional response maintains trust

## SEV-1 Critical Incident Response (0-15 Minutes)

### Minute 0-1: Detection & Initial Assessment

**Alert received via:**
- PagerDuty (primary)
- Datadog monitor
- Customer report
- Engineering observation

**Immediate actions:**
```bash
# Verify incident is real (not false alarm)
1. Check primary dashboard: https://status.myroofgenius.com/internal
2. Confirm customer impact: https://app.myroofgenius.com/health
3. Note error patterns in #incidents Slack channel

# If confirmed, declare incident:
@here SEV-1 DECLARED: [Brief description]
Runbook: https://runbook.myroofgenius.com/sev1
IC: Taking IC role
```

### Minute 1-5: Establish Command Structure

**Incident Commander (IC) Tasks:**
```yaml
Responsibilities:
  - Overall incident coordination
  - External communication decisions
  - Resource allocation
  - "Make the call" authority

First Actions:
  1. Post in #incidents: "I am IC"
  2. Start incident doc from template
  3. Assign Communication Lead
  4. Assign Technical Lead
  5. Set 10-minute sync interval
```

**Communication Lead Tasks:**
```yaml
Responsibilities:
  - Customer notifications
  - Internal updates
  - Status page updates
  - Executive briefings

First Actions:
  1. Draft initial customer message
  2. Update status page to "Investigating"
  3. Notify VIP customers directly
  4. Prepare executive brief
```

**Technical Lead Tasks:**
```yaml
Responsibilities:
  - Root cause investigation
  - Technical remediation
  - System recovery
  - Post-incident analysis

First Actions:
  1. Check recent deployments
  2. Review system metrics
  3. Identify affected components
  4. Begin mitigation attempts
```

### Minute 5-10: Rapid Diagnosis

Run the diagnostic checklist:

```bash
Infrastructure Check:
□ AWS Health Dashboard: https://status.aws.amazon.com
□ Database connections: `SELECT 1` on all shards
□ API Gateway status: curl health endpoints
□ Redis connectivity: redis-cli ping
□ S3 bucket access: aws s3 ls

Application Check:
□ Recent deployments (last 4 hours)
□ Feature flag changes
□ Configuration updates
□ Traffic patterns (DDoS?)
□ Integration partner status

Data Flow Check:
□ Measurement queue depth
□ Webhook delivery status
□ Background job failures
□ Tenant isolation intact
```

### Minute 10-15: Initial Mitigation

Based on diagnosis, execute ONE of these plays:

#### Play 1: Performance Degradation
```bash
# Scale horizontally
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name prod-api \
  --desired-capacity 20

# Shed non-critical load
Enable feature flag: emergency_mode
- Disables PDF generation
- Queues webhook deliveries
- Caches aggressive mode
```

#### Play 2: Database Issues
```bash
# Failover to replica
aws rds failover-db-cluster \
  --db-cluster-identifier prod-cluster

# Enable read-only mode
UPDATE system_config 
SET read_only_mode = true
WHERE tenant_id = 'GLOBAL';
```

#### Play 3: External Dependency
```bash
# Circuit breaker activation
Set flag: disable_[service_name]
- Routes to fallback
- Returns cached data
- Queues for retry
```

#### Play 4: Unknown/Complex
```bash
# Emergency isolation mode
1. Redirect traffic to holding page
2. Preserve all inflight transactions
3. Begin systematic component testing
4. Page additional engineers
```

### Minute 15: Status Communication

**Customer Communication Template:**
```
Subject: MyRoofGenius Service Issue - Update 1

We're currently investigating an issue affecting [service].

Impact: [Specific functions affected]
Started: [Time] [Timezone]
Status: Engineers actively working on resolution

Your data is safe and no estimates have been lost.

Updates every 15 minutes at: status.myroofgenius.com

— MyRoofGenius Operations Team
```

## Incident Severity Definitions

### SEV-1: Critical Business Impact
- Complete platform outage
- Data loss or corruption risk
- Security breach suspected
- Payment processing failure
- **Response**: 15-minute SLA, all hands

### SEV-2: Major Degradation
- Partial outage (>20% users affected)
- Significant performance issues
- Core feature unavailable
- Integration partner down
- **Response**: 30-minute SLA, standard team

### SEV-3: Minor Impact
- Isolated feature issues
- Performance <20% degraded
- Non-critical integration failure
- Cosmetic/UI problems
- **Response**: 2-hour SLA, single engineer

## Recovery Procedures by Component

### API Gateway Recovery
```bash
Symptoms: 500 errors, timeouts, connection refused

Recovery Steps:
1. Check ALB target health
2. Verify security groups
3. Restart unhealthy instances
4. Scale horizontally if needed
5. Check WAF rules for blocks

Validation:
curl -w "%{time_total}" \
  https://api.myroofgenius.com/v1/health
```

### Database Recovery
```bash
Symptoms: Connection pool exhausted, slow queries, locks

Recovery Steps:
1. Kill long-running queries
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'active'
   AND query_start < now() - interval '5 minutes';

2. Boost connection limits temporarily
3. Analyze query plans for problems
4. Consider read replica promotion
5. Enable query result caching

Validation:
Check connection count < 80% of max
```

### Measurement Engine Recovery
```bash
Symptoms: Queue backup, processing timeouts, accuracy errors

Recovery Steps:
1. Pause incoming requests
2. Clear corrupt messages
3. Reset ML model cache
4. Restart worker pool
5. Resume with rate limiting

Validation:
Queue depth < 1000 messages
Processing time < 5 seconds
```

### Tenant Isolation Breach Recovery
```bash
Symptoms: Cross-tenant data visible, audit anomalies

CRITICAL - IMMEDIATE ACTIONS:
1. Enable global read-only mode
2. Revoke all active sessions
3. Page Security Lead + Legal
4. Snapshot all systems
5. Begin forensic analysis

DO NOT:
- Delete any logs
- Modify any data
- Communicate externally without Legal
```

## Communication Scripts

### For Support Team
```
When customers call:

"We're aware of [issue] affecting [component].
Your estimates and data are secure.
Our engineering team is actively working on this.
Current ETA is [time].
Latest updates at status.myroofgenius.com."

If pressed for details:
"I can escalate to our incident team.
They'll provide technical details within 30 minutes."
```

### For Executives
```
Brief for C-Level:

Situation: [Component] experiencing [issue]
Impact: [X]% of customers, approximately $[Y] in delayed estimates
Response: Full incident team engaged, following SEV-1 protocol
Recovery: ETA [time] based on [approach]
Communications: Customers notified, status page updated
Risk: [Low/Medium/High] for data loss or extended outage
```

### For Major Customers
```
VIP Customer Script:

"[Name], this is [IC] from MyRoofGenius operations.
We're experiencing [issue] that may affect your team.
Your data is secure and we're preserving all work.
I'll personally update you every 30 minutes.
Do you have critical estimates in progress?
We can prioritize your tenant's recovery."
```

## Post-Incident Procedures

### Immediate (Within 2 Hours)
- [ ] Confirm system stability
- [ ] Send all-clear to customers
- [ ] Document timeline in incident log
- [ ] Schedule post-mortem meeting
- [ ] Thank response team

### Next Day
- [ ] Conduct blameless post-mortem
- [ ] Identify root cause(s)
- [ ] Create remediation tickets
- [ ] Update runbook if needed
- [ ] Share learnings with team

### Within 72 Hours
- [ ] Publish post-mortem summary
- [ ] Update monitoring for detection
- [ ] Implement quick fixes
- [ ] Plan long-term improvements
- [ ] Review with customers if needed

## What to Watch For

**Signs of cascade failure:**
- Multiple alerts firing simultaneously
- Rapid queue growth
- Connection pool exhaustion
- Memory/CPU spikes across fleet

**Signs of security incident:**
- Unusual access patterns
- Privilege escalation attempts
- Data export spikes
- Geographic anomalies

**Signs of data corruption:**
- Checksum mismatches
- Referential integrity violations
- Audit log gaps
- Customer data complaints

## Pre-Incident Preparation

### Weekly Drills
- Test failover procedures
- Verify on-call schedule
- Update contact information
- Review recent changes
- Practice communication templates

### Monthly Reviews
- Analyze near-misses
- Update runbook procedures
- Refresh team training
- Test backup restoration
- Validate monitoring coverage

### Quarterly Exercises
- Full incident simulation
- Cross-team coordination
- Executive communication
- Customer notification
- Post-mortem practice

## Emergency Contacts

```yaml
Escalation Chain:
  L1_OnCall: pagerduty-primary
  L2_Secondary: pagerduty-secondary
  L3_Manager: eng-manager@myroofgenius
  L4_Director: eng-director@myroofgenius
  L5_CTO: cto@myroofgenius

External:
  AWS_Support: [TAM phone number]
  Datadog: support.datadog.com
  Security: security-team@myroofgenius
  Legal: legal@myroofgenius
  PR: communications@myroofgenius
```

---

*This runbook protects customer operations during our worst moments. Every procedure tested, every escalation verified, every recovery path proven. When systems fail, process prevails.*