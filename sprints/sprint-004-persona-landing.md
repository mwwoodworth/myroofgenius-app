# Sprint 004: Persona Landing Pages

## Why This Matters
Generic messaging loses deals. When an estimator lands on your site at 10 PM looking for margin protection, they need to see themselves—not vague promises about "revolutionizing roofing." Each persona landing page acts as a focused entry point that immediately validates their specific pressure points and guides them to relevant tools.

## What This Protects
- **Your conversion rate**: Targeted messaging converts 3x better than generic
- **User confidence**: They know within 5 seconds this was built for them
- **Your positioning**: Clear differentiation from generic PM tools

## Implementation Steps

### 1. URL Structure and Routing

```javascript
// Route configuration
const personaRoutes = {
  '/for/estimators': EstimatorLanding,
  '/for/architects': ArchitectLanding,
  '/for/building-owners': OwnerLanding,
  '/for/contractors': ContractorLanding,
  '/for/homeowners': HomeownerLanding
};

// SEO metadata per persona
const personaMeta = {
  estimators: {
    title: 'AI Estimation Protection for Commercial Roofing | MyRoofGenius',
    description: 'Catch hidden costs before they kill margins. Built for estimators managing million-dollar bids.',
    ogImage: '/meta/estimator-dashboard.png'
  },
  architects: {
    title: 'Specification Accuracy for Roof Systems | MyRoofGenius',
    description: 'Generate bulletproof specs that prevent RFIs. For architects on compressed schedules.',
    ogImage: '/meta/architect-specs.png'
  }
  // ... additional personas
};
```

### 2. Estimator Landing Page

**URL:** `/for/estimators`

**Above-Fold Copy:**
```
If you're reviewing bids at 11 PM, second-guessing your assumptions—
you need a system that catches what tired eyes miss.

MyRoofGenius runs 47 risk checks on every estimate, flagging the 
hidden costs that turn 18% margins into 3% nightmares.

Built by estimators who've been there.

[Start Free Risk Analysis] [See How It Works]
```

**Problem Recognition Section:**
```
## The Patterns You Know Too Well

☐ "Did I account for all the deck repairs?"
☐ "What if there's moisture we can't see?"
☐ "Is my contingency enough for this jurisdiction?"
☐ "Am I missing something obvious?"

These aren't just thoughts—they're expensive when wrong.
```

**Solution Mapping:**
```
## Your Estimation Safety Net

### Hidden Cost Detection
Our AI analyzes building age, location, previous repairs, and 44 other 
factors to identify cost drivers before they compound.
→ Average catch: $47K in overlooked costs per project

### Margin Protection Alerts
Real-time monitoring as specifications change. Know immediately when 
a "small revision" pushes you from profit to loss.
→ Prevents 73% of scope-creep related losses

### Historical Intelligence
Every estimate learns from thousands of similar projects. See what 
actually happened on comparable jobs—not just what was bid.
→ Confidence score: 87% prediction accuracy
```

**Trust Builders:**
```
## Built on Real Project Data

- 12,000+ commercial roofing projects analyzed
- $2.3B in estimates protected
- 89% of hidden costs caught before bid
- 4.2% average margin improvement

[Logo: Carlisle Approved]
[Logo: GAF Certified]
[Logo: NRCA Member]
```

**CTA Section:**
```
## Start Protecting Your Margins

No credit card. No software to install.
Just upload your estimate and see what you might be missing.

[Analyze Your Next Estimate →]

Questions? Text our estimation team: (555) 123-4567
Available 7 AM - 10 PM MST
```

### 3. Architect Landing Page

**URL:** `/for/architects`

**Above-Fold Copy:**
```
When you're specifying roof systems on compressed schedules,
one missed detail becomes everyone's emergency.

MyRoofGenius validates every specification against current codes,
manufacturer requirements, and compatibility matrices—before the RFI storm.

Built for architects who can't afford callbacks.

[Check Your Spec] [See Validation Process]
```

**Problem Recognition Section:**
```
## The Specification Pressure Points

☐ "Is this detail still compliant with updated codes?"
☐ "Will these components actually work together?"
☐ "Did I specify the right fastener pattern for this wind zone?"
☐ "Am I creating a maintenance nightmare?"

Every RFI is time you don't have.
```

**Solution Mapping:**
```
## Your Specification Guardian

### Code Compliance Engine
Automatic verification against current IBC, local amendments, and 
energy codes. Updated monthly with jurisdiction-specific requirements.
→ 94% reduction in code-related RFIs

### Compatibility Matrix
Every component checked against manufacturer data. Know immediately 
if that insulation works with that membrane—and which fasteners to specify.
→ Zero compatibility-related callbacks last quarter

### Detail Library
Pre-validated details for every condition. Each one verified by 
manufacturers and tested in the field.
→ Save 3 hours per specification package
```

**Technical Credibility:**
```
## Trusted by Technical Professionals

- All details verified by manufacturer technical teams
- Updated within 48 hours of code changes
- Compatible with Revit, AutoCAD, and SpecLink
- Meets AIA contract document standards

[FM Global Approved Assemblies]
[UL Certified Systems]
[ENERGY STAR Portfolio]
```

### 4. Building Owner Landing Page

**URL:** `/for/building-owners`

**Above-Fold Copy:**
```
You're comparing quotes that range from $200K to $380K
for the "same" project. The difference isn't markup—
it's what they're not telling you.

MyRoofGenius decodes contractor quotes, revealing what's included,
what's missing, and which bid actually protects your asset.

Built for owners who measure ROI in decades, not quarters.

[Analyze Quotes] [Download Comparison Guide]
```

**Decision Framework Section:**
```
## See Through the Numbers

### Quote Decoder
Upload multiple bids and see them normalized. Understand why 
one contractor is 40% higher—and why that might save you money.
→ Typical finding: $180K in hidden lifecycle costs

### Risk Assessment
Which quote accounts for your building's actual condition? 
See probability scores for each potential issue.
→ Avoid the change order avalanche

### 20-Year Cost Model
Your roof is a 20-year investment. See total cost of ownership,
not just installation price.
→ Best value often isn't lowest bid
```

### 5. Implementation Components

**Shared Navigation Component:**
```jsx
<PersonaNav currentPersona={persona}>
  <PersonaSelector>
    <Option href="/for/estimators">Estimators</Option>
    <Option href="/for/architects">Architects</Option>
    <Option href="/for/building-owners">Building Owners</Option>
    <Option href="/for/contractors">Contractors</Option>
  </PersonaSelector>
  <BackToMain href="/">All Solutions</BackToMain>
</PersonaNav>
```

**Conversion Tracking:**
```javascript
// Track persona-specific conversions
analytics.track('Persona Page View', {
  persona: 'estimator',
  entryPoint: document.referrer,
  timeOnPage: 0
});

// Track tool engagement
analytics.track('Tool Started', {
  tool: 'risk_analysis',
  persona: 'estimator',
  projectValue: formData.projectValue
});
```

**Dynamic Content Loading:**
```javascript
// Load persona-specific case studies
const caseStudies = {
  estimator: [
    {
      title: 'Caught $247K in Hidden Demolition Costs',
      company: 'Alpine Commercial Roofing',
      metric: '14.2% margin preserved'
    }
  ],
  architect: [
    {
      title: 'Zero RFIs on 450,000 SF Project',
      company: 'Stanton Architecture Group',
      metric: '3 weeks saved on approvals'
    }
  ]
};
```

## Design & UX Specifications

**Visual Hierarchy Per Persona:**

```css
/* Estimator - Focus on data density */
.estimator-landing {
  --primary-color: #2C5282; /* Trust blue */
  --alert-color: #E53E3E;   /* Margin warning */
  --success-color: #38A169; /* Profit green */
}

/* Architect - Clean and technical */
.architect-landing {
  --primary-color: #2D3748; /* Technical gray */
  --accent-color: #4299E1;  /* Specification blue */
  --grid-color: #E2E8F0;    /* Drawing grid */
}

/* Owner - Executive and decisive */
.owner-landing {
  --primary-color: #1A365D; /* Executive navy */
  --value-color: #48BB78;   /* ROI green */
  --chart-color: #805AD5;   /* Analytics purple */
}
```

**Responsive Behavior:**
- Desktop: Full testimonials and case studies visible
- Tablet: Stacked layout with preserved data tables
- Mobile: Focused on primary CTA with expandable sections

## Acceptance Criteria

### Content Requirements
- [ ] Each persona page addresses specific pain points
- [ ] Copy reviewed by actual persona representatives
- [ ] All claims backed by data or testimonials
- [ ] CTAs use protective, outcome-focused language

### Technical Requirements
- [ ] Unique URL for each persona
- [ ] Proper SEO metadata per page
- [ ] Analytics tracking for persona paths
- [ ] A/B test framework implemented

### Conversion Elements
- [ ] Primary CTA above fold
- [ ] Trust indicators relevant to persona
- [ ] Clear next step in user journey
- [ ] Mobile-optimized forms

### Performance
- [ ] Page load < 2s
- [ ] Images optimized for persona context
- [ ] Smooth scroll to sections
- [ ] Accessibility compliant

## Operator QA Checklist

### Content Validation
1. Read each page as target persona - verify voice
2. Check all statistics have sources
3. Verify CTAs lead to appropriate tools
4. Test all internal links
5. Review mobile readability

### Persona Journey Testing
1. Search "roofing estimation software" - land on estimator page
2. Navigate between personas - verify smooth transition
3. Complete primary CTA - verify appropriate next step
4. Test form submissions for each persona
5. Verify confirmation messaging matches persona

### Technical Testing
1. Check SEO metadata in view source
2. Verify Open Graph images display correctly
3. Test page speed on all persona pages
4. Check analytics firing for all events
5. Test on various devices/browsers

### Conversion Testing
1. Set up A/B test for primary headlines
2. Verify conversion tracking per persona
3. Test multi-step forms on mobile
4. Check error states and messaging
5. Verify thank you pages load correctly

## Assigned AI

**Primary:** Codex - Implementation and routing  
**Secondary:** Claude - Copy refinement and persona voice  
**Review:** Operator - Cross-persona testing and validation