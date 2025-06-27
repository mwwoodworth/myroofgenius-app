# Visual Design Collaboration Prompts

## Purpose
These prompts enable optional collaboration with Gemini or Perplexity for visual design enhancement. Each prompt is crafted to generate specific, implementable design improvements that reinforce MyRoofGenius as a protective intelligence system for professionals under pressure.

---

## Homepage Hero Animation Enhancement

### For Gemini:
```
Gemini, review this homepage hero section design for MyRoofGenius, a protective AI system for roofing professionals making high-stakes decisions.

Current implementation:
- Gradient background (slate-900 to blue-900)
- Animated cyan/blue orbs with blur effects
- Grid overlay pattern

Requirements:
- Must convey "protection" and "intelligence"
- Load fast on mobile (no heavy libraries)
- Work for stressed professionals at 2am

Please provide:
1. Enhanced background animation using only CSS/Framer Motion
2. Subtle particle or mesh effect that suggests "protective network"
3. React/Tailwind code for one unique motion element
4. Mobile performance optimization approach

Focus on subtle sophistication over flashy effects. Think "enterprise security dashboard" meets "modern SaaS."
```

### For Perplexity:
```
Perplexity, analyze the top 10 B2B SaaS platforms launched in 2024-2025 that serve high-stakes industries (construction tech, fintech, healthtech, cybersecurity).

Research focus:
1. Hero section animation techniques that convey trust
2. Color palettes for "protective" positioning
3. Typography choices for technical credibility
4. Mobile-first design patterns

Specific questions:
- What background animation styles are most effective?
- How do they handle visual hierarchy under cognitive load?
- What micro-interactions enhance perceived reliability?

Provide 3 specific visual patterns we should adopt and 2 we should avoid, with examples.
```

---

## Trust Indicators & Social Proof Design

### For Gemini:
```
Gemini, design a trust indicator system for MyRoofGenius that works for skeptical, time-constrained professionals.

Context:
- Users are estimators/contractors with bad software experiences
- They need immediate credibility signals
- Mobile-first, scannable design

Create:
1. Trust badge component with glassmorphism effect
2. Animated counter for "5,000+ professionals protected"
3. Security indicator that's subtle but present
4. Client logo carousel that doesn't feel "salesy"

Provide React components with Framer Motion animations. Use these colors:
- Primary: #0F172A (slate-900)
- Accent: #0EA5E9 (cyan-500)
- Glass effect: white/10 with backdrop-blur

Make it feel like security software, not marketing.
```

---

## Product Card Hover States

### For Gemini:
```
Gemini, enhance these marketplace product cards with sophisticated hover interactions.

Current state:
- Basic scale(1.02) on hover
- Border color change to cyan

Enhance with:
1. Glassmorphism reveal effect showing key features
2. Subtle parallax on mouse movement
3. Protection metrics that animate in
4. "Instant download" badge that pulses

Requirements:
- Performant on mobile (touch states too)
- Accessibility compliant
- Feels premium but not overwhelming

Provide CSS/Tailwind classes and any necessary JS. Think "Apple App Store" meets "enterprise software marketplace."
```

---

## Mobile Navigation Experience

### For Perplexity:
```
Perplexity, research mobile navigation patterns for professional B2B apps used in field conditions (construction sites, job sites, inspections).

Focus areas:
1. One-thumb navigation patterns
2. Glove-friendly touch targets
3. Offline-first visual indicators
4. Context-aware menu systems

What are the top 3 mobile nav patterns for professionals using phones in challenging conditions? Provide specific examples from apps like Procore, PlanGrid, or Fieldwire.
```

### For Gemini:
```
Gemini, create a mobile navigation system for MyRoofGenius that works for contractors on roof jobs.

Requirements:
- 44x44px minimum touch targets (glove-friendly)
- Bottom sheet pattern for easy thumb access
- Offline indicator for poor cell coverage
- Quick access to AI Copilot from any screen

Design:
1. Animated bottom nav with active state
2. Gesture-based shortcuts
3. Contextual actions based on current page
4. Emergency "Save locally" for poor connectivity

Provide React Native Web compatible components with iOS/Android considerations.
```

---

## Loading States & Skeletons

### For Gemini:
```
Gemini, design loading states that reassure rather than frustrate professionals under deadline pressure.

Context:
- User might be loading an estimate at 2am before bid deadline
- Every second of perceived delay increases stress
- Need to convey "working" not "waiting"

Create:
1. Skeleton screens that show exact content structure
2. Micro-copy that explains what's happening
3. Progress indicators for multi-step processes
4. Subtle animations that suggest intelligence at work

Avoid:
- Spinning circles
- Generic progress bars
- Bouncing dots
- Anything that feels "stuck"

Provide Tailwind/Framer Motion components that feel fast even when they're not.
```

---

## Data Visualization for Protection Metrics

### For Gemini:
```
Gemini, design data visualizations for MyRoofGenius that instantly communicate protection value.

Visualize:
1. "Mistakes prevented" over time
2. "Money saved" through caught errors  
3. "Risk score" for current estimate
4. "Protection coverage" for different project areas

Requirements:
- Scannable in 2 seconds
- Works on mobile
- Colorblind accessible
- Feels like financial/security software

Use D3.js or Recharts. Focus on clarity over complexity. Think "Bloomberg Terminal" meets "modern SaaS dashboard."
```

---

## Error States That Protect Confidence

### For Perplexity:
```
Perplexity, research error message design in high-stakes software (trading platforms, medical systems, aviation).

Questions:
1. How do they communicate errors without inducing panic?
2. What language patterns reduce user stress?
3. How do they maintain trust during system failures?

Provide 5 error message templates that work for stressed professionals who can't afford system failures.
```

### For Gemini:
```
Gemini, design error states for MyRoofGenius that maintain user confidence.

Scenarios:
1. AI Copilot temporary unavailability
2. Network error during estimate save
3. Payment processing failure
4. PDF upload corruption

For each, create:
- Icon (not scary red X)
- Headline (protective, not alarming)
- Message (specific next action)
- Visual treatment (subtle, not jarring)

Provide React components with appropriate animations. Remember: users are already stressed—don't add to it.
```

---

## Field-Ready Typography System

### For Gemini:
```
Gemini, develop a typography system for MyRoofGenius optimized for field conditions.

Considerations:
- Bright sunlight readability
- Dirty screen clarity
- One-handed portrait use
- Mixed indoor/outdoor lighting
- Reading while walking

Create:
1. Type scale with maximum legibility
2. Contrast ratios for outdoor use
3. Touch target sizing for text links
4. Hierarchy that works at arm's length

Base fonts: Inter, system-ui
Provide CSS variables and Tailwind config.
```

---

## Conversion-Focused CTA Design

### For Perplexity:
```
Perplexity, analyze CTA button design in B2B SaaS with high-value transactions ($10K+ deals).

Research:
1. Button copy that converts skeptical buyers
2. Visual hierarchy for primary vs secondary CTAs
3. Micro-interactions that build confidence
4. Placement patterns for maximum conversion

Focus on enterprise software and professional tools. What makes expensive software feel worth the investment at the moment of click?
```

---

## Performance-First Animation Strategy

### For Gemini:
```
Gemini, create an animation strategy for MyRoofGenius that enhances perception of speed.

Constraints:
- Must work on 3G connections
- No animation over 200ms
- Every animation must have purpose
- Mobile performance is critical

Design:
1. Page transition system (no white flashes)
2. Optimistic UI updates
3. Stagger animations for perceived speed
4. Skeleton to content reveals

Provide Framer Motion variants and performance guidelines. Think "instant" even when it's not.
```

---

## Usage Instructions

1. **Select relevant prompts** based on current design needs
2. **Customize context** with specific component details
3. **Run through Gemini/Perplexity** in separate sessions
4. **Integrate responses** into sprint documentation
5. **Test implementations** with performance metrics
6. **Document what works** in SESSION_STATE.md

Remember: Every visual decision should reduce cognitive load for professionals under pressure. If it doesn't make their job easier, it doesn't belong in the design.