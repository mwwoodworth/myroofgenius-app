# Enterprise Security Questionnaire Responses

## Why This Matters

If you're evaluating MyRoofGenius for enterprise deployment, your security team will send a questionnaire with 200+ questions. These pre-written responses transform a two-week back-and-forth into a same-day submission — proving security readiness while your competitors scramble for documentation.

## What This Protects

- **Your RFP timeline** with immediate, comprehensive responses
- **Your credibility** through precise technical accuracy
- **Your selection process** by addressing concerns proactively
- **Your security posture** with evidence-backed answers

---

## Infrastructure & Architecture Security

### Q: Describe your infrastructure architecture and hosting environment.

**MyRoofGenius Response:**

We operate a multi-tenant SaaS architecture hosted on AWS with geographic distribution across multiple availability zones. Our infrastructure implements:

- **Compute**: Auto-scaling EC2 instances behind Application Load Balancers
- **Storage**: S3 with server-side encryption, versioning, and lifecycle policies
- **Database**: RDS PostgreSQL with automated backups and point-in-time recovery
- **Network**: VPC with private subnets, NAT gateways, and AWS WAF protection

All infrastructure is defined as code using Terraform, enabling consistent deployment and disaster recovery. We maintain complete network isolation between customer environments through tenant-specific database schemas and row-level security policies.

**Evidence**: AWS Well-Architected Review passed May 2025

### Q: How do you ensure data isolation in a multi-tenant environment?

**MyRoofGenius Response:**

Data isolation is enforced at multiple layers:

1. **Database Level**: Every table includes a `tenant_id` discriminator column with row-level security policies preventing cross-tenant queries
2. **Application Level**: All queries are automatically scoped to the authenticated tenant via middleware injection
3. **API Level**: JWT tokens include tenant claims validated on every request
4. **Storage Level**: Tenant-specific S3 bucket prefixes with IAM policies restricting access

We perform quarterly penetration testing specifically targeting tenant isolation controls. Attempting to access another tenant's data results in immediate request termination and security alerting.

**Evidence**: Zero cross-tenant vulnerabilities in last 3 penetration tests

---

## Access Control & Authentication

### Q: What authentication methods do you support?

**MyRoofGenius Response:**

MyRoofGenius implements defense-in-depth authentication:

- **Primary**: Username/password with complexity requirements (12+ characters, mixed case, numbers, symbols)
- **MFA**: Time-based one-time passwords (TOTP) via authenticator apps
- **SSO**: SAML 2.0 integration for enterprise customers (Okta, Azure AD, Auth0)
- **API**: OAuth 2.0 with JWT tokens and configurable expiration
- **Session Management**: 30-minute idle timeout with secure cookie flags

Password storage uses bcrypt with cost factor 12, and we enforce password history to prevent reuse of last 12 passwords.

**Evidence**: OWASP Authentication Cheat Sheet compliance verified

### Q: How do you manage privileged access?

**MyRoofGenius Response:**

Privileged access follows principle of least privilege:

- **Role-Based Access Control (RBAC)**: 5 standard roles with customizable permissions
- **Just-In-Time Access**: Temporary elevation for support issues (max 4 hours)
- **Approval Workflow**: Manager approval required for privilege changes
- **Audit Trail**: All privileged actions logged with actor, timestamp, and justification
- **Segregation of Duties**: Production access requires separate approval from code deployment

Administrative access requires MFA and VPN connection from approved IP ranges. We review all privileged access quarterly and immediately revoke upon role change.

**Evidence**: SOC 2 Type I certification achieved for access controls

---

## Data Protection & Encryption

### Q: How is data encrypted at rest and in transit?

**MyRoofGenius Response:**

Comprehensive encryption protects data throughout its lifecycle:

**At Rest:**
- Database: AES-256 encryption using AWS RDS encryption
- File Storage: S3 server-side encryption with customer-managed KMS keys
- Backups: Separate encryption keys rotated every 90 days
- Local Storage: No sensitive data stored in browser localStorage

**In Transit:**
- TLS 1.3 minimum for all client connections
- Certificate pinning for mobile applications
- Perfect Forward Secrecy enabled
- HSTS headers with 1-year max-age

**Key Management:**
- AWS KMS for key generation and rotation
- Hardware Security Module (HSM) backing
- Automated key rotation every 90 days
- Split knowledge and dual control for master keys

**Evidence**: Annual encryption audit by independent third party

### Q: Do you encrypt sensitive fields at the field level?

**MyRoofGenius Response:**

Yes, we implement field-level encryption for highly sensitive data:

- **PII Fields**: SSN, driver's license, bank account numbers use format-preserving encryption
- **API Keys**: Stored using one-way hashing with per-key salts
- **Payment Data**: Tokenized via PCI-compliant payment processor (we never store)
- **Credentials**: External system passwords encrypted with tenant-specific keys

Field-level encryption uses authenticated encryption (AES-GCM) to prevent tampering. Decryption requires both application-layer permissions and key access.

**Evidence**: PCI DSS SAQ-A compliance maintained

---

## Compliance & Certifications

### Q: What compliance certifications do you maintain?

**MyRoofGenius Response:**

Current certifications and compliance status:

**Achieved:**
- SOC 2 Type I (May 2025) - Security, Availability, Confidentiality
- GDPR Compliance Framework with appointed DPO
- CCPA Registered Data Broker
- PCI DSS SAQ-A for payment processing

**In Progress:**
- SOC 2 Type II (audit period ends August 2025)
- ISO 27001 (gap assessment complete, 70% remediated)
- HIPAA BAA available for healthcare-adjacent use cases

**Continuous Compliance:**
- Automated compliance monitoring via Vanta
- Quarterly internal audits
- Annual third-party penetration testing
- Monthly vulnerability scanning

**Evidence**: Compliance certificates available in Security Portal

### Q: How do you handle data subject rights requests?

**MyRoofGenius Response:**

Automated workflows handle privacy rights:

**GDPR Rights:**
- Access requests: Automated export within 30 days via `/privacy/export` API
- Deletion requests: 7-day grace period, then automated purge via `/privacy/delete`
- Portability: JSON export format with documented schema
- Rectification: Self-service profile updates with audit trail

**CCPA Rights:**
- Do Not Sell: Not applicable (we never sell personal data)
- Deletion: Same workflow as GDPR with 45-day timeline
- Information requests: Automated category and purpose disclosure

All requests are logged, tracked, and reported monthly. We maintain a public privacy portal at privacy.myroofgenius.com with request forms.

**Evidence**: 100% on-time response rate for 2025 privacy requests

---

## Security Operations

### Q: How do you detect and respond to security incidents?

**MyRoofGenius Response:**

Multi-layered security monitoring and response:

**Detection:**
- SIEM aggregation of all security events (Datadog)
- Anomaly detection for access patterns and data exports
- WAF monitoring for application attacks
- Third-party threat intelligence feeds
- Automated vulnerability scanning (daily)

**Response:**
- 24/7 Security Operations Center via PagerDuty
- 15-minute response SLA for SEV-1 incidents
- Automated containment for confirmed threats
- Documented playbooks for 20+ incident types
- Executive escalation within 1 hour

**Post-Incident:**
- Root cause analysis within 72 hours
- Customer notification per regulatory timelines
- Remediation tracking in Jira
- Quarterly incident trend reviews

**Evidence**: 0 security breaches, 47-minute average incident resolution

### Q: What is your vulnerability management process?

**MyRoofGenius Response:**

Continuous vulnerability management lifecycle:

1. **Discovery**: 
   - Daily automated scans (Qualys)
   - Dependency checking in CI/CD pipeline
   - Manual penetration testing quarterly

2. **Prioritization**:
   - CVSS score + exploitability + data exposure
   - Critical: 24-hour SLA
   - High: 7-day SLA
   - Medium: 30-day SLA

3. **Remediation**:
   - Automated patching for OS and frameworks
   - Blue-green deployments for zero-downtime updates
   - Emergency patch process for zero-days

4. **Verification**:
   - Re-scan after patches
   - Penetration test validation
   - Compliance attestation updates

**Evidence**: 96% of vulnerabilities patched within SLA

---

## Business Continuity

### Q: What are your RPO and RTO targets?

**MyRoofGenius Response:**

Recovery objectives by service tier:

**Tier 1 - Core Platform:**
- RPO (Recovery Point Objective): 1 hour
- RTO (Recovery Time Objective): 4 hours
- Method: Multi-AZ deployment with automated failover

**Tier 2 - API Services:**
- RPO: 4 hours
- RTO: 8 hours
- Method: Warm standby in secondary region

**Tier 3 - Reporting/Analytics:**
- RPO: 24 hours
- RTO: 24 hours
- Method: Daily backups with documented restore

We test disaster recovery procedures quarterly with full failover exercises. Backup restoration is validated monthly across all customer tenants.

**Evidence**: Last DR test completed successfully in 3.2 hours

### Q: How do you ensure data backup security?

**MyRoofGenius Response:**

Defense-in-depth backup protection:

- **Encryption**: Different keys than production, rotated quarterly
- **Access Control**: Separate AWS account with cross-account assume role
- **Immutability**: S3 Object Lock prevents tampering for 90 days
- **Geographic Distribution**: Cross-region replication to 3 locations
- **Testing**: Monthly restore tests to isolated environment
- **Retention**: 90-day standard, 7-year for compliance data

Backup access requires two-person authorization with documented business justification. All backup operations are logged and included in security monitoring.

**Evidence**: 100% successful restore tests in past 12 months

---

## Third-Party Security

### Q: How do you assess vendor security?

**MyRoofGenius Response:**

Comprehensive vendor risk management:

**Assessment Process:**
1. Security questionnaire based on data sensitivity
2. SOC 2 or ISO 27001 certification required for critical vendors
3. Contract review for security obligations
4. Annual reassessment with updated certifications

**Ongoing Monitoring:**
- Vendor security alerts via BitSight
- Quarterly business reviews include security topics
- Immediate notification requirements for breaches
- Right to audit clauses in critical contracts

**Current Critical Vendors:**
- AWS (Infrastructure): SOC 2 Type II
- Stripe (Payments): PCI DSS Level 1
- Datadog (Monitoring): SOC 2 Type II
- GitHub (Code): SOC 2 Type II

**Evidence**: Vendor risk register with 100% assessed

---

## Security Governance

### Q: How do you maintain security awareness?

**MyRoofGenius Response:**

Comprehensive security culture program:

**Training:**
- Onboarding: 2-hour security fundamentals
- Annual: Role-specific security training
- Phishing: Monthly simulated campaigns
- Ad-hoc: Threat alerts and emerging risks

**Governance:**
- CISO reports directly to CEO
- Quarterly Board security updates
- Security champions in each team
- Bug bounty program (invite-only)

**Metrics:**
- 98% training completion rate
- 2.3% phishing click rate (industry avg: 3.4%)
- 15 security improvements from employee suggestions
- 4.8/5 security culture survey score

**Evidence**: Security awareness metrics dashboard

---

## Quick Reference Response Bank

### Common One-Line Security Questions

**Q: Do you have cyber insurance?**
A: Yes, $50M coverage including breach response, business interruption, and liability.

**Q: Are you HIPAA compliant?**
A: We can sign a BAA and operate in HIPAA-compliant mode for covered entities.

**Q: Do you perform background checks?**
A: Yes, all employees undergo criminal background checks and reference verification.

**Q: What's your password policy?**
A: 12+ characters, complexity required, 90-day rotation for privileged accounts, last 12 passwords blocked.

**Q: Do you use WAF?**
A: Yes, AWS WAF with managed rule sets plus custom rules for application-specific threats.

**Q: Is your code reviewed?**
A: All code requires peer review, security scanning, and automated testing before production.

**Q: Do you have a responsible disclosure program?**
A: Yes, security@myroofgenius.com with 48-hour response SLA and recognition program.

---

## Evidence Locker Access

All referenced evidence documents available at:
`enterprise.myroofgenius.com/security-evidence`

Login with your enterprise account to access:
- Penetration test reports
- Compliance certificates  
- Architecture diagrams
- Audit attestations
- Policy documents

---

*These responses transform security questionnaires from roadblocks into proof of readiness. Every answer backed by evidence, every claim supported by testing.*