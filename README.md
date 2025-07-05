# MyRoofGenius

> AI-powered roofing intelligence system that protects margins and prevents costly mistakes.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## 📁 Project Structure

```
myroofgenius/
├── app/               # Next.js app directory
├── components/        # Reusable UI components
├── features/          # Feature-specific modules
├── hooks/             # Custom React hooks
├── services/          # API and external services
├── utils/             # Helper functions
├── public/            # Static assets
├── docs/              # Documentation
├── scripts/           # Build and maintenance scripts
└── sprints/           # Sprint documentation
    └── v1/            # Current sprint docs
```

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript (Next.js)
- **Styling**: Tailwind CSS
- **State**: React Context + useReducer
- **Data**: Supabase (PostgreSQL)
- **Testing**: Jest, Playwright
- **Build**: Next.js

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for all new components
- Follow ESLint configuration
- Write tests for critical paths
- Document complex logic

### Git Workflow
1. Create feature branch from `main`
2. Prefix commits: `feat:`, `fix:`, `docs:`, `refactor:`
3. Open PR with description and screenshots
4. Require approval before merge

### Testing Strategy
- Unit tests for utilities and hooks
- Integration tests for features
- E2E tests for critical user paths
- Minimum 80% coverage for new code

## 📊 Performance Targets
- Initial load: < 3s on 3G
- Time to interactive: < 5s
- Lighthouse score: > 90
- Bundle size: < 300KB gzipped

## 🚨 Troubleshooting

### Common Issues

**Build fails with memory error**
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

**WebSocket connection issues**
- Check `.env.local` for correct WS_URL
- Ensure backend is running
- Check browser console for errors

**Test suite hanging**
```bash
npm run test -- --detectOpenHandles
```

## 📝 License

Proprietary - MyRoofGenius © 2025

---
Legacy sprint docs can be archived by running `scripts/archive-preV1.sh`.

## Critical Launch Tasks (Sprint Archive)

- [x] [Future Sprint Template.md](sprints\/archive\/Future Sprint Template.md)
- [x] [Master Sprint Index.md](sprints\/archive\/Master Sprint Index.md)
- [x] [MyRoofGenius_App_Sprints.md](sprints\/archive\/MyRoofGenius_App_Sprints.md)
- [x] [Sprint 06 — Marketplace_AI Recommendat.md](sprints\/archive\/Sprint 06 — Marketplace_AI Recommendat.md)
- [x] [Sprint 07 — Field Apps Integration.md](sprints\/archive\/Sprint 07 — Field Apps Integration.md)
- [x] [Sprint 08 — Claude Tools Integration.md](sprints\/archive\/Sprint 08 — Claude Tools Integration.md)
- [x] [Sprint 09 — Navigation & Documentation.md](sprints\/archive\/Sprint 09 — Navigation & Documentation.md)
- [x] [Sprint 10 — Error Tracking_Monitoring.md](sprints\/archive\/Sprint 10 — Error Tracking_Monitoring.md)
- [x] [Sprint 11 — Performance_Analytics.md](sprints\/archive\/Sprint 11 — Performance_Analytics.md)
- [x] [configure-feature-flags.md](sprints\/archive\/configure-feature-flags.md)
- [x] [content-documentation.md](sprints\/archive\/content-documentation.md)
- [x] [fix-homepage-tagline-test.md](sprints\/archive\/fix-homepage-tagline-test.md)
- [x] [future-roadmap.md](sprints\/archive\/future-roadmap.md)
- [x] [implement-admin-route.md](sprints\/archive\/implement-admin-route.md)
- [x] [implement-auth-ui.md](sprints\/archive\/implement-auth-ui.md)
- [x] [implement-stripe-webhook.md](sprints\/archive\/implement-stripe-webhook.md)
- [x] [implementation-summary.md](sprints\/archive\/implementation-summary.md)
- [x] [master-sprint-plan.md](sprints\/archive\/master-sprint-plan.md)
- [x] [project-context.md](sprints\/archive\/project-context.md)
- [x] [quantum_leap_context.md](sprints\/archive\/quantum_leap_context.md)
- [x] [remove-legacy-redirects.md](sprints\/archive\/remove-legacy-redirects.md)
- [x] [session-state.md](sprints\/archive\/session-state.md)
- [x] [sprint-001-homepage.md](sprints\/archive\/sprint-001-homepage.md)
- [x] [sprint-002-estimation.md](sprints\/archive\/sprint-002-estimation.md)
- [x] [sprint-003-cost-driver.md](sprints\/archive\/sprint-003-cost-driver.md)
- [x] [sprint-004-persona-landing.md](sprints\/archive\/sprint-004-persona-landing.md)
- [x] [sprint-005-dashboard-mvp.md](sprints\/archive\/sprint-005-dashboard-mvp.md)
- [x] [sprint-006-checklist-generator.md](sprints\/archive\/sprint-006-checklist-generator.md)
- [x] [sprint-007-auth-onboarding.md](sprints\/archive\/sprint-007-auth-onboarding.md)
- [x] [sprint-008-data-persistence.md](sprints\/archive\/sprint-008-data-persistence.md)
- [x] [sprint-009-repo-hygiene.md](sprints\/archive\/sprint-009-repo-hygiene.md)
- [x] [sprint-ai-copilot.md](sprints\/archive\/sprint-ai-copilot.md)
- [x] [sprint-homepage.md](sprints\/archive\/sprint-homepage.md)
- [x] [sprint-marketplace.md](sprints\/archive\/sprint-marketplace.md)
- [x] [sprint-operator-logistics.md](sprints\/archive\/sprint-operator-logistics.md)
- [x] [sprint01_glassmorphism.md](sprints\/archive\/sprint01_glassmorphism.md)
- [x] [sprint02_ai_copilot.md](sprints\/archive\/sprint02_ai_copilot.md)
- [x] [sprint03_ar_viewer.md](sprints\/archive\/sprint03_ar_viewer.md)
- [x] [sprint04_smart_maps.md](sprints\/archive\/sprint04_smart_maps.md)
- [x] [sprint05_ai_estimator.md](sprints\/archive\/sprint05_ai_estimator.md)
- [x] [verify-environment-variables.md](sprints\/archive\/verify-environment-variables.md)
- [x] [visual-design-prompts.md](sprints\/archive\/visual-design-prompts.md)

## Launch Process Documentation
- [Deployment Checklist](docs/launch/production-deployment-checklist.md)
- [QA Smoke Test Guide](docs/launch/production-qa-smoke-test.md)
- [Launch Checklist](docs/launch/launch-checklist.md)
- [Developer Portal Guide](docs/DEVELOPER_PORTAL.md)
