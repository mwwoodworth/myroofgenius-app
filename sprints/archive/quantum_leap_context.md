# MyRoofGenius Quantum Leap — BrainOps Master Context

## Mission & Outcome Standard

MyRoofGenius must instantly demonstrate **protective intelligence** to all users and stakeholders through:

- **True glassmorphism** with high-contrast design and fluid motion on every interface element
- **AI Copilot** as a persistent, protective agent — not just a chatbot
- **AR/3D visualization**, smart mapping, and real-time analytics accessible from any device
- **Claude-powered, AI-native UX** that prevents mistakes before they happen

### Completion Standard
No feature ships unless it:
- Is discoverable from main navigation
- Integrates fully with existing systems (no stubs/demos)
- Passes the "Would I trust this with a $1M project?" test
- Maintains type safety, accessibility compliance, and sub-3s load times
- Protects users from common implementation failures

## Design/UX Principles

### Visual Architecture
- **Glassmorphism Required**: All cards, panels, and CTAs use `backdrop-filter`, soft shadows, and animated glows
- **Persistent Navigation**: Fixed nav with smooth transitions and mobile-first responsiveness
- **Motion Design**: Framer Motion (or equivalent) for all page transitions and micro-interactions
- **Icon System**: Lucide-react with animated SVGs for key actions — no default icons
- **Loading States**: Every async component has skeleton screens and graceful fallbacks

### Performance Standards
- Lazy-load all AR/3D components with progressive enhancement
- Code-split routes for sub-100KB initial bundles
- Image optimization with next/image and responsive srcsets
- Service worker for offline capability on critical paths

### Feature Flag Philosophy
- Flags default to `true` in production
- Explicit documentation for each flag's purpose
- Granular control without code changes
- Rollback capability within 60 seconds

## ENV / Feature Flag Canon

| Flag/Env Var | Purpose | Default | Fallback Behavior |
|---|---|---|---|
| `AI_COPILOT_ENABLED` | Show AI Copilot interface | `true` | Hide copilot button |
| `NEXT_PUBLIC_MAP_ENABLED` | Enable Mapbox integration | `true` | Show static map image |
| `AR_MODE_ENABLED` | Activate 3D/AR roof viewer | `true` | Show 2D roof diagram |
| `NEXT_PUBLIC_ESTIMATOR_ENABLED` | AI Estimator access | `true` | Show contact form |
| `SALES_ENABLED` | Marketplace functionality | `true` | Show "coming soon" |
| `SENTRY_DSN` | Error reporting endpoint | Required | Console logging only |
| `MAPBOX_TOKEN` | Mapbox API access | Required | Static map fallback |
| `OPENAI_API_KEY` | AI model access | Required | Cached responses |
| `CLAUDE_API_KEY` | Claude integration | Required | OpenAI fallback |
| `NEXT_PUBLIC_POSTHOG_KEY` | Analytics tracking | Required | No analytics |

## Required Project Structure

```
/myroofgenius
├── /docs
│   ├── /quantum-leap-sprints
│   │   ├── sprint01-glassmorphism.md
│   │   ├── sprint02-ai-copilot.md
│   │   ├── sprint03-ar-viewer.md
│   │   └── ...
│   └── QUANTUM_LEAP_CONTEXT.md
├── /components
│   ├── /ui
│   │   ├── GlassPanel.tsx
│   │   ├── AIChat.tsx
│   │   └── ARViewer.tsx
│   └── /patterns
│       ├── EstimatorFlow.tsx
│       └── MarketplaceGrid.tsx
├── /lib
│   ├── /ai
│   ├── /ar
│   └── /analytics
└── /tests
    ├── /integration
    └── /e2e
```

### Import Convention
- Use absolute imports: `@/components/ui/GlassPanel`
- Group imports: React → Next → External → Internal → Types
- Explicit exports from index files

## Integration QA Criteria

### Pre-Integration Checklist
- [ ] Component isolated testing complete
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Performance budget maintained (<3s FCP)
- [ ] Error boundaries implemented
- [ ] Loading states designed
- [ ] Mobile responsiveness verified

### Integration Requirements
Every integrated feature must:
1. **Pass all checks**: `npm run lint`, `npm run build`, `npm test`, `npm run test:e2e`
2. **Include documentation**: Before/after code snippets in sprint file
3. **Have navigation entry**: Accessible from main nav or dashboard
4. **Monitor performance**: Sentry integration for error tracking
5. **Support rollback**: Feature flag for instant disable

### Definition of Done
Sprint complete only when:
- Merged to main branch
- Deployed and verified on production
- Metrics baseline established
- Team demo completed
- Documentation updated

## Implementation Safeguards

### Code Quality Gates
```bash
# Required before merge
npm run typecheck
npm run lint:fix
npm run test:coverage # >80%
npm run build
npm run lighthouse # >90 score
```

### Monitoring Requirements
- Sentry for runtime errors
- PostHog for user analytics
- Vercel Analytics for performance
- Custom alerts for business metrics

### Rollback Protocol
1. Feature flag disable (immediate)
2. Revert commit if needed (5 min)
3. Hotfix branch for critical issues
4. Post-mortem within 24 hours

## Sprint Execution Framework

### Sprint Structure
- **Duration**: 2-3 days per sprint
- **Scope**: Single feature or system
- **Output**: Production-ready, integrated code
- **Review**: Founder approval before merge

### Documentation Standard
Each sprint file must include:
1. Clear objective with user benefit
2. File targets with exact paths
3. Step-by-step implementation
4. Code examples (before/after)
5. QA checklist
6. AI execution instructions
7. Advanced enhancements

### Communication Protocol
- Daily progress in #quantum-leap channel
- Blockers raised immediately
- Demo video for each completion
- Metrics shared post-deployment

---

## Master Reference

This document is the source of truth for the Quantum Leap transformation. All sprint files reference this context. Updates require founder approval and version increment.

**Version**: 1.0.0  
**Last Updated**: [Date]  
**Owner**: MyRoofGenius Founder  
**Status**: Active