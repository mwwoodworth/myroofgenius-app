# MyRoofGenius Project Context & Memory

## Current Project Status

**Last Updated:** Sprint Planning Session  
**Version:** V1 Architecture Complete  
**Phase:** Ready for Development  
**Next Action:** Begin Sprint 001 Implementation

## Project Overview

MyRoofGenius is an AI-powered roofing intelligence system designed to protect contractors, architects, and building owners from costly mistakes. The platform analyzes risk factors, validates specifications, and provides margin protection through predictive analytics.

### Core Value Proposition
- **For Estimators**: Catch hidden costs before they compound (47-point risk analysis)
- **For Architects**: Prevent RFIs through specification validation
- **For Building Owners**: Decode quotes and understand true project costs

## Technical Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for utility-first design
- **State Management**: React Context + useReducer
- **Build Tool**: Vite for fast development
- **Testing**: Jest + React Testing Library

### Backend Requirements
- **Database**: PostgreSQL with JSONB for flexible data
- **Real-time**: WebSocket connections for live updates
- **API**: RESTful endpoints with JWT authentication
- **File Storage**: S3-compatible for documents/images

### Key Integrations
- **Authentication**: Auth0 or similar for SSO
- **Payments**: Stripe for subscriptions
- **Analytics**: Mixpanel for user behavior
- **Monitoring**: Sentry for error tracking

## Sprint Structure

### Completed Planning
1. ✅ Sprint 001: Homepage Foundation
2. ✅ Sprint 002: Estimation Engine Core  
3. ✅ Sprint 003: Cost Driver Analyzer
4. ✅ Sprint 004: Persona Landing Pages
5. ✅ Sprint 005: Dashboard MVP
6. ✅ Sprint 006: Checklist Generator
7. ✅ Sprint 007: Auth and Onboarding
8. ✅ Sprint 008: Data Persistence
9. ✅ Sprint 009: Repo Hygiene

### Sprint Implementation Order
Recommended sequence for V1:
1. **Foundation** (Sprints 009, 001, 007) - Repo setup, homepage, auth
2. **Core Engine** (Sprints 002, 003, 008) - Estimation, analysis, data
3. **User Experience** (Sprints 004, 005, 006) - Landings, dashboard, tools

## Key Decisions Made

### Design Decisions
- **Mobile-first** responsive design approach
- **Protective blue** (#3E92CC) as primary brand color
- **Data-dense** interfaces for professional users
- **Progressive disclosure** for complex features

### Technical Decisions  
- **Monorepo** structure for initial development
- **Server-side** risk calculations for security
- **Offline-first** architecture with sync
- **Version control** for all estimates

### Business Decisions
- **Freemium** model with usage-based tiers
- **Per-project** pricing for enterprise
- **30-day** free trial for all features
- **API access** for enterprise plans only

## Known Constraints

### Technical Constraints
- Must work on 2017+ mobile devices
- 3-second load time on 3G networks
- Offline capability required for field use
- Export compatibility with Excel required

### Business Constraints
- GDPR compliance for data handling
- SOC 2 requirements for enterprise
- Insurance industry data standards
- Construction industry terminology

## Current Blockers

### Immediate Needs
1. **Environment Setup**: Need API keys for third-party services
2. **Design Assets**: Need high-res logo and brand assets
3. **Test Data**: Need anonymized historical project data
4. **Legal Review**: Terms of service and privacy policy

### Technical Decisions Pending
1. **Hosting Platform**: AWS vs Google Cloud vs Azure
2. **CDN Strategy**: CloudFlare vs CloudFront
3. **Email Service**: SendGrid vs AWS SES
4. **Search Solution**: Elasticsearch vs Algolia

## Risk Register

### High Priority Risks
1. **Competitor Response**: Existing PM tools adding risk features
   - *Mitigation*: Focus on roofing-specific intelligence
   
2. **Data Quality**: Poor historical data affecting predictions
   - *Mitigation*: Manual verification of initial dataset

3. **User Adoption**: Resistance to changing estimation process
   - *Mitigation*: Gradual feature introduction

### Medium Priority Risks
1. **Scaling Costs**: AI analysis becoming expensive at scale
2. **Integration Complexity**: Difficulty connecting to existing tools
3. **Mobile Performance**: Complex calculations on limited devices

## Success Metrics

### V1 Launch Targets
- **Users**: 100 active estimators in first 90 days
- **Analyses**: 1,000 risk analyses completed
- **Accuracy**: 85% risk prediction accuracy
- **Performance**: <3s page load, <5s analysis

### Key Performance Indicators
1. **Activation Rate**: Sign-up to first analysis
2. **Weekly Active Usage**: Return users per week
3. **Analysis Accuracy**: Predicted vs actual costs
4. **Time to Value**: Sign-up to first caught risk

## Team Responsibilities

### AI Team Assignments
- **Codex**: Primary implementation, React components, API integration
- **Operator**: QA testing, cross-browser validation, deployment
- **Claude**: Content creation, documentation, UX copy
- **Gemini**: Market analysis, competitive intelligence
- **Perplexity**: Technical research, vendor evaluation

### Human Responsibilities
- **Founder**: Strategic decisions, final approval, industry expertise
- **Users**: Beta testing, feedback, validation

## Next Steps

### Immediate Actions (Next 48 Hours)
1. Set up development environment
2. Initialize Git repository with sprint structure
3. Configure build pipeline and testing
4. Create component library foundation
5. Implement authentication flow

### Week 1 Deliverables
- Working homepage with responsive design
- Authentication with email/SSO
- Basic dashboard structure  
- Database schema implemented
- First risk analysis prototype

### Month 1 Milestones
- All core features functional
- 10 beta users testing system
- Risk prediction model trained
- Performance targets met
- V1 feature complete

## Communication Protocols

### Daily Standup Format
```
1. Completed since last update
2. Working on today
3. Blockers or decisions needed
4. Help required from others
```

### Code Review Standards
- All PRs require review before merge
- Tests must pass in CI
- Documentation for new features
- Performance impact assessed

### Decision Log Format
```
Date: [YYYY-MM-DD]
Decision: [What was decided]
Rationale: [Why this choice]
Impact: [What changes]
Decided by: [Who made final call]
```

## Resource Links

### Documentation
- [Business Plan](./business-plan.md)
- [Technical Specification](./tech-spec.md)
- [API Documentation](./api-docs.md)
- [Brand Guidelines](./brand-guide.md)

### External Resources
- [Figma Designs](#)
- [Competitor Analysis](#)
- [Market Research](#)
- [User Interviews](#)

## Version History

### 2024-11-XX: Initial Planning
- Created comprehensive sprint structure
- Defined V1 feature set
- Established technical architecture

### 2024-11-XX: Sprint Documentation
- Completed all 9 sprint documents
- Created content guidelines
- Established implementation order

---

*This document should be updated after each sprint completion and major decision.*