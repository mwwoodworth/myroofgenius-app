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
