# Sprint: Feature, UI, and Documentation Polish

**ID:** SPRINT-006  
**Priority:** Nice-to-Have  
**State:** To Do

## 1. Executive Summary

Polishing the UI, docs, and dev experience ensures the app is professional, maintainable, and developer-friendly for future growth. This sprint focuses on cleaning up disabled features, organizing documentation, and establishing clear design system guidelines.

## 2. Acceptance Criteria

- [ ] Disabled features (AI Estimator and AR Mode) display professional "Coming Soon" notices with feature flag checks
- [ ] All outdated sprints/docs are archived to `/sprints/archive`
- [ ] A comprehensive `DEVELOPER_GUIDE.md` exists with setup, architecture, and operational documentation
- [ ] A complete `docs/DESIGN_SYSTEM.md` documents the design language and components
- [ ] `package.json` scripts are cleaned, standardized, and properly documented

## 3. Step-by-Step Implementation Guide

### File: components/AIEstimator.tsx

```tsx
'use client'

import React from 'react'
import { AlertCircle, Brain, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Feature flag for AI Estimator
const AI_ESTIMATOR_ENABLED = process.env.NEXT_PUBLIC_AI_ESTIMATOR_ENABLED === 'true'

export default function AIEstimator() {
  
  if (!AI_ESTIMATOR_ENABLED) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-muted-foreground" />
            <CardTitle>AI Roof Estimator</CardTitle>
          </div>
          <CardDescription>
            Advanced estimation powered by computer vision and machine learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-blue-200 bg-blue-50">
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Coming Soon</AlertTitle>
            <AlertDescription>
              Our AI-powered estimation system is currently in development. This feature will enable:
              <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                <li>Instant roof measurements from aerial imagery</li>
                <li>Automated material calculations with 95%+ accuracy</li>
                <li>Real-time cost estimates based on local market data</li>
                <li>Detailed reports with visualizations and breakdowns</li>
              </ul>
              <p className="mt-3 text-sm font-medium">
                Expected launch: Q2 2025
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Production AI Estimator implementation would go here
  return (
    <div>
      {/* AI estimator UI would render here */}
      <p>AI Estimator Active</p>
    </div>
  )
}
```

### File: components/DashboardAR.tsx

```tsx
'use client'

import React from 'react'
import { Camera, Smartphone, View } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

// Feature flag for AR Mode
const AR_MODE_ENABLED = process.env.NEXT_PUBLIC_AR_MODE_ENABLED === 'true'

export default function DashboardAR() {
  // WebXR/AR.js integration planned
  // Device capability detection (ARCore/ARKit)
  // 3D roof model overlay system
  // Measurement tools in AR space
  // Integration with estimation workflow planned
  // AR session recording/screenshot capabilities
  
  if (!AR_MODE_ENABLED) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <View className="h-5 w-5 text-muted-foreground" />
            <CardTitle>AR Roof Visualization</CardTitle>
            <Badge variant="secondary" className="ml-2">Beta</Badge>
          </div>
          <CardDescription>
            Visualize roofing projects in augmented reality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-purple-200 bg-purple-50">
            <Camera className="h-4 w-4" />
            <AlertTitle>Coming Soon</AlertTitle>
            <AlertDescription>
              Our AR visualization tools are being refined for the roofing industry. This feature will provide:
              <ul className="mt-2 ml-4 list-disc space-y-1 text-sm">
                <li>Real-time roof overlay on mobile devices</li>
                <li>Interactive material and color selection</li>
                <li>On-site measurement verification</li>
                <li>Before/after visualization for clients</li>
                <li>Collaborative AR sessions for teams</li>
              </ul>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <Smartphone className="h-4 w-4" />
                <span className="font-medium">Requires AR-capable device</span>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Production AR implementation would go here
  return (
    <div>
      {/* AR visualization UI would render here */}
      <p>AR Mode Active</p>
    </div>
  )
}
```

### File: DEVELOPER_GUIDE.md

```markdown
# MyRoofGenius Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Development Workflow](#development-workflow)
5. [Code Standards](#code-standards)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

## Project Overview

MyRoofGenius is an AI-native roofing estimation and project management platform built with Next.js 14, TypeScript, and TailwindCSS. The application provides professional tools for contractors, estimators, and building owners to manage roofing projects efficiently.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Package Manager**: npm

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- Git
- Supabase account (for backend services)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mwwoodworth/myroofgenius-app.git
cd myroofgenius-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` file:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Feature Flags
NEXT_PUBLIC_AI_ESTIMATOR_ENABLED=false
NEXT_PUBLIC_AR_MODE_ENABLED=false

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

5. Run the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Architecture

### Directory Structure
```
myroofgenius-app/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard-specific components
│   └── shared/           # Shared components
├── lib/                   # Utility functions and configurations
│   ├── supabase/         # Supabase client and helpers
│   └── utils/            # General utilities
├── styles/               # Global styles
├── types/                # TypeScript type definitions
├── public/               # Static assets
├── docs/                 # Documentation
└── sprints/              # Sprint documentation and archives
```

### Key Design Patterns

#### 1. Server Components by Default
Use Server Components for data fetching and static content. Client Components only when necessary for interactivity.

```tsx
// Server Component (default)
export default async function ProjectList() {
  const projects = await getProjects()
  return <ProjectGrid projects={projects} />
}

// Client Component (when needed)
'use client'
export function InteractiveForm() {
  const [state, setState] = useState()
  // Interactive logic here
}
```

#### 2. Type Safety
Leverage TypeScript throughout the application:

```tsx
// types/project.ts
export interface Project {
  id: string
  name: string
  status: 'active' | 'completed' | 'archived'
  createdAt: Date
  updatedAt: Date
}

// Usage
const project: Project = {
  id: '123',
  name: 'Commercial Roof Replacement',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date()
}
```

#### 3. Component Composition
Build complex UIs from smaller, reusable components:

```tsx
// Compose smaller components
<Card>
  <CardHeader>
    <CardTitle>Project Overview</CardTitle>
  </CardHeader>
  <CardContent>
    <ProjectMetrics />
    <ProjectTimeline />
  </CardContent>
</Card>
```

## Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `docs/*`: Documentation updates

### Commit Convention
Follow conventional commits:
```
feat: add new estimation algorithm
fix: correct calculation in roof area
docs: update API documentation
style: format code with prettier
refactor: reorganize project structure
test: add unit tests for calculator
chore: update dependencies
```

### Code Review Process
1. Create feature branch from `develop`
2. Make changes following code standards
3. Write/update tests
4. Create pull request with description
5. Address review feedback
6. Merge after approval

## Code Standards

### TypeScript
- Enable strict mode
- Define interfaces for all data structures
- Avoid `any` type
- Use enums for finite sets of values

### React/Next.js
- Prefer functional components
- Use custom hooks for reusable logic
- Implement error boundaries
- Optimize with React.memo when necessary

### Styling
- Use TailwindCSS utilities
- Follow mobile-first approach
- Maintain consistent spacing scale
- Use CSS variables for theming

### Performance
- Implement lazy loading for images
- Use dynamic imports for code splitting
- Optimize bundle size
- Monitor Core Web Vitals

## Testing

### Unit Tests
```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Integration Tests
Test API routes and database interactions:
```typescript
// __tests__/api/projects.test.ts
describe('/api/projects', () => {
  it('should return project list', async () => {
    const response = await fetch('/api/projects')
    expect(response.status).toBe(200)
  })
})
```

### E2E Tests
Use Playwright for end-to-end testing:
```bash
npm run test:e2e
```

## Deployment

### Environment Setup
1. Set up Vercel project
2. Connect GitHub repository
3. Configure environment variables
4. Enable automatic deployments

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Build successful locally
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Feature flags set appropriately

### Deployment Commands
```bash
npm run build    # Build production bundle
npm run start    # Start production server
npm run lint     # Check for linting errors
```

## Troubleshooting

### Common Issues

#### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

#### Database Connection
- Verify Supabase credentials
- Check network connectivity
- Review connection pooling settings

#### Performance Issues
- Analyze bundle size: `npm run analyze`
- Check for unnecessary re-renders
- Review API response times

### Debug Tools
- Next.js DevTools
- React Developer Tools
- Network tab for API debugging
- Supabase dashboard for database queries

### Getting Help
1. Check existing documentation
2. Search closed issues on GitHub
3. Ask in development channel
4. Create detailed bug report

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

Last updated: December 2024
```

### File: docs/DESIGN_SYSTEM.md

```markdown
# MyRoofGenius Design System

## Overview

The MyRoofGenius design system provides a cohesive visual language and component library for building consistent, accessible, and professional interfaces across the platform.

## Design Principles

### 1. **Protective & Professional**
Every interface element should reinforce trust and competence. The design communicates reliability through consistent patterns and clear hierarchy.

### 2. **Clarity Over Decoration**
Prioritize functional clarity. Every visual element must serve a purpose in guiding users through complex workflows.

### 3. **Responsive & Accessible**
Design for mobile-first experiences and ensure WCAG 2.1 AA compliance throughout.

## Color Palette

### Primary Colors
```css
--primary: hsl(222.2 47.4% 11.2%)          /* #0f172a - Deep blue-black */
--primary-foreground: hsl(210 40% 98%)     /* #f8fafc - Near white */
```

### Accent Colors
```css
--accent: hsl(210 40% 96.1%)               /* #f1f5f9 - Light gray */
--accent-foreground: hsl(222.2 47.4% 11.2%) /* #0f172a - Deep blue-black */
```

### Semantic Colors
```css
--destructive: hsl(0 84.2% 60.2%)          /* #ef4444 - Red */
--destructive-foreground: hsl(210 40% 98%)  /* #f8fafc - White */

--success: hsl(142 71% 45%)                 /* #22c55e - Green */
--warning: hsl(38 92% 50%)                  /* #f59e0b - Amber */
--info: hsl(199 89% 48%)                    /* #0ea5e9 - Blue */
```

### Neutral Scale
```css
--background: hsl(0 0% 100%)                /* #ffffff - White */
--foreground: hsl(222.2 84% 4.9%)          /* #020817 - Near black */

--muted: hsl(210 40% 96.1%)                /* #f1f5f9 - Light gray */
--muted-foreground: hsl(215.4 16.3% 46.9%) /* #64748b - Medium gray */

--border: hsl(214.3 31.8% 91.4%)           /* #e2e8f0 - Border gray */
--input: hsl(214.3 31.8% 91.4%)            /* #e2e8f0 - Input border */
```

## Typography

### Font Stack
```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace;
```

### Type Scale
```css
/* Headings */
--text-4xl: 2.25rem;    /* 36px */
--text-3xl: 1.875rem;   /* 30px */
--text-2xl: 1.5rem;     /* 24px */
--text-xl: 1.25rem;     /* 20px */
--text-lg: 1.125rem;    /* 18px */

/* Body */
--text-base: 1rem;      /* 16px */
--text-sm: 0.875rem;    /* 14px */
--text-xs: 0.75rem;     /* 12px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Usage Guidelines
- **Headings**: Use semibold (600) weight for all headings
- **Body Text**: Regular (400) weight for readability
- **Emphasis**: Medium (500) for subtle emphasis, Bold (700) for strong emphasis
- **Captions**: Small size (14px) with muted foreground color

## Spacing System

Based on a 4px grid system:
```css
--spacing-0: 0;
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
```

## Core Components

### Buttons

#### Primary Button
```tsx
<Button>Save Estimate</Button>
```
- Background: Primary color
- Text: Primary foreground
- Hover: 10% darker
- Disabled: 50% opacity

#### Secondary Button
```tsx
<Button variant="secondary">Cancel</Button>
```
- Background: Muted
- Text: Foreground
- Border: Transparent

#### Destructive Button
```tsx
<Button variant="destructive">Delete Project</Button>
```
- Background: Destructive color
- Text: Destructive foreground
- Use sparingly for irreversible actions

### Cards

Standard card pattern for content grouping:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Project Summary</CardTitle>
    <CardDescription>Overview of current status</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
</Card>
```

### Forms

#### Input Fields
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="name@company.com" />
  <p className="text-sm text-muted-foreground">We'll never share your email.</p>
</div>
```

#### Select Menus
```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose roof type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="shingle">Asphalt Shingle</SelectItem>
    <SelectItem value="metal">Metal</SelectItem>
    <SelectItem value="tile">Tile</SelectItem>
  </SelectContent>
</Select>
```

### Feedback Components

#### Alerts
```tsx
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Important Notice</AlertTitle>
  <AlertDescription>
    Your estimate has been saved successfully.
  </AlertDescription>
</Alert>
```

#### Toast Notifications
```tsx
toast({
  title: "Estimate Created",
  description: "Your new estimate is ready for review.",
})
```

### Data Display

#### Tables
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Project</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Downtown Office</TableCell>
      <TableCell>Active</TableCell>
      <TableCell>$45,000</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Icons

Using Lucide React for consistent iconography:
- Size: 16px (h-4 w-4) for inline, 20px (h-5 w-5) for buttons
- Color: Inherit from parent text color
- Stroke Width: 2px (default)

Common icons:
- `<Home />` - Dashboard
- `<FileText />` - Documents/Estimates
- `<Users />` - Clients
- `<Settings />` - Configuration
- `<AlertCircle />` - Warnings
- `<CheckCircle />` - Success

## Responsive Design

### Breakpoints
```css
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
--screen-2xl: 1536px;
```

### Mobile-First Approach
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid layout */}
</div>
```

## Motion & Animation

Keep animations subtle and functional:
```css
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

Common transitions:
- Hover states: `transition-colors duration-200`
- Modal/dropdown appearance: `transition-all duration-300`
- Loading states: `animate-pulse` or `animate-spin`

## Accessibility Guidelines

### Color Contrast
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- Interactive elements: Clear focus indicators

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Skip links for main content

### Screen Readers
- Semantic HTML structure
- Proper ARIA labels where needed
- Alt text for all informative images

## Implementation Examples

### Dashboard Card
```tsx
<Card className="hover:shadow-lg transition-shadow duration-200">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">
      Total Revenue
    </CardTitle>
    <DollarSign className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$45,231.89</div>
    <p className="text-xs text-muted-foreground">
      +20.1% from last month
    </p>
  </CardContent>
</Card>
```

### Form with Validation
```tsx
<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="project-name">Project Name</Label>
    <Input 
      id="project-name" 
      placeholder="e.g., Main Street Office Complex"
      className="focus:ring-2 focus:ring-primary"
    />
  </div>
  <Button type="submit" className="w-full">
    Create Project
  </Button>
</form>
```

## Resources

- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

Version: 1.0.0  
Last Updated: December 2024
```

### File: package.json

Update the scripts section to be clean and standardized:

```json
{
  "name": "myroofgenius-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "analyze": "ANALYZE=true next build",
    "clean": "rm -rf .next out node_modules",
    "reinstall": "npm run clean && npm install",
    "prepare": "husky install"
  },
  "dependencies": {
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-toast": "^1.1.5",
    "@supabase/ssr": "^0.5.1",
    "@supabase/supabase-js": "^2.45.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.454.0",
    "next": "15.0.3",
    "react": "19.0.0-rc-02c0e824-20241028",
    "react-dom": "19.0.0-rc-02c0e824-20241028",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "^15.0.3",
    "@playwright/test": "^1.48.2",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@types/jest": "^29.5.14",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "15.0.3",
    "husky": "^9.1.6",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "postcss": "^8",
    "prettier": "^3.3.3",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

### Archive Structure

Create the following directory structure and move outdated files:

```bash
# Create archive directory
mkdir -p sprints/archive

# Move completed/outdated sprint files to archive
# (This would be done via file system commands, listing structure here)
sprints/archive/
├── initial-setup-sprint.md
├── auth-implementation-sprint.md
├── dashboard-implementation-sprint.md
├── supabase-integration-sprint.md
└── [any other completed sprints]
```

## 4. Test Instructions

### Feature Flag Testing
1. Ensure `.env.local` has feature flags set to `false`:
   ```
   NEXT_PUBLIC_AI_ESTIMATOR_ENABLED=false
   NEXT_PUBLIC_AR_MODE_ENABLED=false
   ```

2. Navigate to pages with disabled features:
   - AI Estimator page should show "Coming Soon" card
   - AR Dashboard should show "Coming Soon" card

3. Test with flags enabled (set to `true`) to verify conditional rendering

### Documentation Verification
1. Verify `DEVELOPER_GUIDE.md` exists at root level
2. Check all sections are complete and code examples work
3. Verify `docs/DESIGN_SYSTEM.md` exists
4. Confirm design tokens match actual implementation

### Package Scripts Testing
1. Run each script to ensure it works:
   ```bash
   npm run lint
   npm run type-check
   npm run format:check
   npm run build
   ```

2. Verify no deprecated or duplicate scripts remain

### Archive Verification
1. Check `/sprints/archive` directory exists
2. Confirm all outdated sprint documents are moved
3. Verify current sprints remain in `/sprints` root

## 5. Post-Merge & Deploy Validation

- [ ] All feature flags properly control feature visibility
- [ ] Documentation is accessible and accurate
- [ ] No broken links in documentation
- [ ] Package scripts execute without errors
- [ ] Archive structure maintains historical records
- [ ] Design system documentation matches implementation
- [ ] Developer guide provides clear onboarding path

## 6. References

- Next.js App Router Documentation: https://nextjs.org/docs/app
- TailwindCSS Configuration: https://tailwindcss.com/docs/configuration
- shadcn/ui Components: https://ui.shadcn.com/
- Feature Flags Best Practices: https://martinfowler.com/articles/feature-toggles.html

---

**Sprint prepared for:** MyRoofGenius Feature Polish  
**Prepared by:** BrainOps Content Operations  
**Date:** December 2024  
**Version:** 1.0.0