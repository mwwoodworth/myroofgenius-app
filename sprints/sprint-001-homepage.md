# Sprint 001: Homepage Foundation

## Why This Matters
The homepage is your first line of defense against user confusion. It needs to immediately communicate that MyRoofGenius isn't another project management tool—it's a protective intelligence system for professionals who can't afford costly mistakes.

## What This Protects
- **Your credibility**: Clear positioning prevents misaligned expectations
- **User confidence**: Immediate recognition of value for their specific role
- **Conversion momentum**: Every element guides toward risk analysis

## Implementation Steps

### 1. Hero Section Architecture

**Component Structure:**
```jsx
<HeroSection>
  <AnimatedBackground /> // Subtle grid pattern suggesting protection
  <HeadlineBlock>
    <H1>Your AI-Powered Roofing Intelligence System</H1>
    <Subhead>Prevent costly mistakes. Protect your margins. Built for professionals who can't afford to guess.</Subhead>
  </HeadlineBlock>
  <CTAGroup>
    <PrimaryCTA>Start Free Risk Analysis</PrimaryCTA>
    <SecondaryCTA>See How It Works</SecondaryCTA>
  </CTAGroup>
  <TrustIndicators />
</HeroSection>
```

**Animation Specifications:**
- Grid pattern: 0.5s ease-in, opacity 0 to 0.1
- Headlines: 0.8s stagger, translateY(20px) to translateY(0)
- CTAs: 1.2s delay, scale(0.95) to scale(1)
- Respect `prefers-reduced-motion`

### 2. Problem Recognition Grid

**Copy Block 1: Hidden Cost Detection**
```
For Estimators:
"Our AI analyzes 47 risk factors in every project—catching the issues that kill margins before you bid. Built on patterns from 10,000+ commercial projects."

Trust Point: "Catches 89% of scope creep triggers"
```

**Copy Block 2: Margin Protection**
```
For Contractors:
"Real-time alerts when specifications drift from profitable zones. Know exactly when a project moves from green to yellow to red."

Trust Point: "Average margin improvement: 4.2%"
```

**Copy Block 3: Specification Accuracy**
```
For Architects:
"Generate bulletproof specs that prevent RFIs. Every detail verified against current manufacturer requirements and code compliance."

Trust Point: "73% reduction in specification-related RFIs"
```

### 3. Role-Specific Value Props

**Section Structure:**
```jsx
<RoleSelector>
  <RoleTab role="estimator">Commercial Estimator</RoleTab>
  <RoleTab role="architect">Architect/Specifier</RoleTab>
  <RoleTab role="owner">Building Owner</RoleTab>
</RoleSelector>

<RoleContent active={selectedRole}>
  // Dynamic content based on selection
</RoleContent>
```

**Estimator Content:**
```
"If you're reviewing bids at 11 PM, second-guessing your assumptions—you need a system that catches what tired eyes miss. MyRoofGenius runs 47 risk checks on every estimate, flagging the hidden costs that turn 18% margins into 3% nightmares."

[See Estimator Tools →]
```

**Architect Content:**
```
"When you're specifying roof systems on compressed schedules, one missed detail becomes everyone's emergency. MyRoofGenius validates every specification against current standards, preventing the callbacks that derail your next project."

[See Specification Tools →]
```

**Owner Content:**
```
"You're comparing quotes that range from $200K to $380K for the 'same' project. MyRoofGenius decodes what's really included, what's missing, and which bid protects your asset for the next 20 years."

[See Owner Resources →]
```

### 4. Social Proof Integration

**Testimonial Structure:**
```
Company: "Apex Commercial Roofing"
Role: "Senior Estimator"
Quote: "Caught $47K in hidden demolition costs on our last project. That's the difference between profit and explaining to ownership why we're underwater."
Metric: "312 projects protected"
```

### 5. Footer Architecture

**Resource Links:**
- Cost Driver Library
- Specification Checklists
- Margin Protection Guide
- Code Compliance Updates

**Trust Elements:**
- Security badges
- Industry certifications
- Update frequency indicator

## Design & UX Specifications

**Color System:**
- Primary: `#0A1628` (Authority Navy)
- Protective: `#3E92CC` (System Blue)  
- Alert: `#FF6B35` (Margin Warning)
- Success: `#2A9D8F` (Profit Green)
- Neutral: `#E5E5E5` (Field Gray)

**Typography:**
- Headers: Inter, -0.02em tracking, 1.1 line-height
- Body: Inter, 0 tracking, 1.6 line-height
- Data: JetBrains Mono, tabular nums

**Responsive Breakpoints:**
- Mobile: 320px - 768px
- Tablet: 769px - 1024px
- Desktop: 1025px+

**Accessibility Requirements:**
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Skip links for main content
- ARIA labels for icon buttons
- Focus indicators: 3px offset, brand blue

## Acceptance Criteria

### Functional Requirements
- [ ] Page load time < 3s on 3G connection
- [ ] All CTAs tracked in analytics with role attribution
- [ ] Form submissions integrate with CRM
- [ ] Error states for all interactive elements

### Content Requirements
- [ ] Copy reviewed against brand voice guide
- [ ] Role-specific content loads dynamically
- [ ] All metrics/claims backed by data source

### Technical Requirements
- [ ] Lighthouse score > 90 for Performance
- [ ] No layout shift (CLS < 0.1)
- [ ] Images optimized with next-gen formats
- [ ] Implements structured data for SEO

## Operator QA Checklist

### Visual Validation
1. Load homepage on Chrome, Firefox, Safari
2. Test all breakpoints: 320px, 768px, 1024px, 1440px
3. Verify animations trigger correctly
4. Check hover states on all interactive elements

### Functional Testing
1. Click all CTAs - verify analytics firing
2. Test role selector - confirm content updates
3. Submit test form - verify CRM integration
4. Test with keyboard only - verify full navigation

### Performance Testing
1. Run Lighthouse audit - verify scores
2. Test on throttled 3G - verify < 3s load
3. Check for console errors
4. Verify lazy loading for below-fold images

### Copy Validation
1. Read all copy aloud - verify voice consistency
2. Check for typos/grammar with Grammarly
3. Verify all claims have data attribution
4. Confirm CTAs use protective language

## Assigned AI

**Primary:** Codex - Implementation  
**Secondary:** Operator - QA validation  
**Review:** Claude - Copy consistency check