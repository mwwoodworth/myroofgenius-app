# Sprint 009: Repo Hygiene

## Why This Matters
A clean repository is the difference between shipping confidently and shipping scared. When your codebase is organized, documented, and free of legacy artifacts, every deployment becomes predictable. This isn't housekeeping—it's operational insurance. The 20 minutes spent here saves hours of debugging at 2 AM when something breaks in production.

## What This Protects
- **Deployment confidence**: Clean builds every time
- **Team efficiency**: New developers productive in hours, not days
- **System reliability**: No zombie code creating unexpected behaviors
- **Your sanity**: Finding what you need when pressure is high

## Implementation Steps

### 1. Legacy Sprint Cleanup

**Archive Structure:**
```bash
# Move all legacy sprint files to archive
mkdir -p /sprints/archive/pre-v1
mv /sprints/*.md /sprints/archive/pre-v1/ 2>/dev/null || true
mv /sprints/legacy-* /sprints/archive/pre-v1/ 2>/dev/null || true

# Clean up partial or duplicate files
find /sprints/archive/pre-v1 -name "*-backup*" -delete
find /sprints/archive/pre-v1 -name "*-old*" -delete
find /sprints/archive/pre-v1 -name "*.tmp" -delete

# Create archive manifest
cat > /sprints/archive/pre-v1/ARCHIVE_MANIFEST.md << 'EOF'
# Pre-V1 Sprint Archive

This directory contains sprint documents from the initial development phase.
These files are preserved for historical reference but are not part of the active codebase.

## Archive Date
$(date +"%Y-%m-%d")

## Reason for Archive
- Superseded by V1 sprint structure
- Contains exploratory work not implemented
- Preserved for institutional knowledge

## Files Archived
$(ls -la /sprints/archive/pre-v1/*.md | awk '{print "- " $9}')
EOF
```

### 2. Dependencies Audit

**Package Cleanup Script:**
```javascript
// scripts/audit-dependencies.js
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function auditDependencies() {
  console.log('🔍 Auditing dependencies...\n');
  
  // 1. Check for unused dependencies
  console.log('Checking for unused dependencies...');
  try {
    const { stdout } = await execPromise('npx depcheck');
    console.log(stdout || '✅ No unused dependencies found\n');
  } catch (error) {
    console.log('⚠️  Unused dependencies found:', error.stdout);
  }
  
  // 2. Check for security vulnerabilities
  console.log('Running security audit...');
  try {
    const { stdout } = await execPromise('npm audit --json');
    const audit = JSON.parse(stdout);
    
    if (audit.metadata.vulnerabilities.total === 0) {
      console.log('✅ No security vulnerabilities found\n');
    } else {
      console.log(`⚠️  Found ${audit.metadata.vulnerabilities.total} vulnerabilities`);
      console.log(`   High: ${audit.metadata.vulnerabilities.high}`);
      console.log(`   Medium: ${audit.metadata.vulnerabilities.moderate}`);
      console.log(`   Low: ${audit.metadata.vulnerabilities.low}\n`);
    }
  } catch (error) {
    console.error('Error running audit:', error);
  }
  
  // 3. Check for outdated packages
  console.log('Checking for outdated packages...');
  try {
    const { stdout } = await execPromise('npm outdated --json');
    const outdated = JSON.parse(stdout || '{}');
    
    if (Object.keys(outdated).length === 0) {
      console.log('✅ All packages up to date\n');
    } else {
      console.log('⚠️  Outdated packages:');
      Object.entries(outdated).forEach(([pkg, info]) => {
        console.log(`   ${pkg}: ${info.current} → ${info.latest}`);
      });
    }
  } catch (error) {
    // npm outdated returns non-zero exit code when packages are outdated
    console.log('Completed outdated check\n');
  }
  
  // 4. Size analysis
  console.log('Analyzing bundle size...');
  const stats = await analyzeBundleSize();
  console.log(`📦 Total bundle size: ${stats.totalSize}`);
  console.log(`   JS: ${stats.jsSize}`);
  console.log(`   CSS: ${stats.cssSize}`);
  console.log(`   Images: ${stats.imageSize}\n`);
}

// Clean package-lock
async function cleanPackageLock() {
  console.log('🧹 Cleaning package-lock.json...');
  
  // Remove node_modules and package-lock
  await execPromise('rm -rf node_modules package-lock.json');
  
  // Reinstall with clean lock file
  await execPromise('npm install');
  
  console.log('✅ Clean package-lock.json generated\n');
}
```

### 3. Code Quality Enforcement

**ESLint Configuration:**
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // Enforce code quality
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    
    // React specific
    'react/prop-types': 'error',
    'react/no-array-index-key': 'warn',
    'react-hooks/exhaustive-deps': 'error',
    
    // Code style
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    
    // Security
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error'
  }
};
```

**Pre-commit Hooks:**
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:ci"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "*.{css,scss}": [
      "prettier --write",
      "git add"
    ],
    "*.md": [
      "prettier --write --prose-wrap always",
      "git add"
    ]
  }
}
```

### 4. Documentation Standardization

**README.md Update:**
```markdown
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
├── src/
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-specific modules
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API and external services
│   ├── utils/          # Helper functions
│   └── styles/         # Global styles and themes
├── public/            # Static assets
├── docs/              # Documentation
├── scripts/           # Build and maintenance scripts
└── sprints/           # Sprint documentation
    └── v1/            # Current sprint docs
```

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **State**: React Context + useReducer
- **Data**: PostgreSQL, WebSockets
- **Testing**: Jest, React Testing Library
- **Build**: Vite, ESBuild

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
```

### 5. Environment Configuration

**Environment Setup:**
```bash
# .env.example
# Copy this file to .env.local and fill in your values

# API Configuration
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_WS_URL=ws://localhost:4000

# Authentication
REACT_APP_AUTH_DOMAIN=
REACT_APP_AUTH_CLIENT_ID=

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_SENTRY=false
REACT_APP_ENABLE_OFFLINE=true

# Third Party Services
REACT_APP_GOOGLE_MAPS_KEY=
REACT_APP_STRIPE_PUBLIC_KEY=

# Build Configuration
REACT_APP_VERSION=$npm_package_version
REACT_APP_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

**Environment Validation:**
```javascript
// src/config/validate-env.js
const requiredEnvVars = [
  'REACT_APP_API_URL',
  'REACT_APP_WS_URL',
  'REACT_APP_AUTH_DOMAIN',
  'REACT_APP_AUTH_CLIENT_ID'
];

export function validateEnvironment() {
  const missing = requiredEnvVars.filter(
    varName => !process.env[varName]
  );
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
      'Please check your .env.local file.'
    );
  }
  
  // Validate URLs
  try {
    new URL(process.env.REACT_APP_API_URL);
    new URL(process.env.REACT_APP_WS_URL);
  } catch (error) {
    throw new Error('Invalid URL in environment variables');
  }
}
```

### 6. Build Optimization

**Production Build Configuration:**
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './build-stats.html',
      open: true,
      gzipSize: true
    })
  ],
  
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'date-fns']
        }
      }
    },
    reportCompressedSize: true
  },
  
  server: {
    port: 3000,
    strictPort: true
  }
});
```

### 7. Final Cleanup Checklist

**Automated Cleanup Script:**
```bash
#!/bin/bash
# scripts/repo-cleanup.sh

echo "🧹 Starting repository cleanup..."

# Remove common junk files
echo "Removing temporary files..."
find . -name "*.tmp" -delete
find . -name "*.log" -delete
find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete

# Clean up node_modules in subdirectories
echo "Cleaning nested node_modules..."
find . -name "node_modules" -type d -prune -exec rm -rf '{}' + 2>/dev/null

# Remove empty directories
echo "Removing empty directories..."
find . -type d -empty -delete

# Update .gitignore
echo "Updating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/
.nyc_output/

# Production
build/
dist/

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db

# Build stats
build-stats.html
EOF

echo "✅ Repository cleanup complete!"
```

## Design & UX Specifications

This sprint has no UI components—it's purely backend/repository focused.

## Acceptance Criteria

### Repository Structure
- [ ] All legacy files archived properly
- [ ] Clear folder structure documented
- [ ] No orphaned or temporary files
- [ ] .gitignore comprehensive

### Code Quality
- [ ] ESLint passes with no errors
- [ ] No console.logs in production code
- [ ] All tests passing
- [ ] No security vulnerabilities

### Documentation
- [ ] README complete and accurate
- [ ] Environment setup documented
- [ ] Contribution guidelines clear
- [ ] Troubleshooting section helpful

### Build Process
- [ ] Production build < 300KB gzipped
- [ ] No build warnings
- [ ] Source maps generated correctly
- [ ] Environment validation working

## Operator QA Checklist

### Repository Testing
1. Clone fresh repository - verify builds correctly
2. Follow README setup - completes in < 5 minutes
3. Run all scripts - verify no errors
4. Check file structure - matches documentation
5. Verify no sensitive data committed

### Build Testing
1. Run production build - completes successfully
2. Check bundle size - under limits
3. Verify minification working
4. Test source maps in browser
5. Check for console errors in production

### Documentation Testing
1. Follow quick start guide as new developer
2. Verify all links work
3. Test troubleshooting solutions
4. Check code examples run correctly
5. Validate environment setup process

### Automation Testing
1. Trigger pre-commit hooks - verify working
2. Run cleanup scripts - check results
3. Test CI/CD pipeline if configured
4. Verify dependency audit runs
5. Check all npm scripts work

## Assigned AI

**Primary:** Codex - Script implementation and automation  
**Secondary:** Operator - Testing cleanup effectiveness  
**Review:** Claude - Documentation clarity and completeness