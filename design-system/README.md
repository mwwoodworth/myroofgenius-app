# MyRoofGenius Design System

## Overview
The MyRoofGenius design system provides a unified visual language and component library for building consistent, accessible, and performant user interfaces across all roofing software applications.

## Design Principles

### 1. **Clarity & Precision**
- Clean, uncluttered interfaces that help contractors focus on their work
- Precise measurements and calculations displayed prominently
- Clear visual hierarchy with proper information architecture

### 2. **Accessibility First**
- WCAG 2.1 AA compliance as a minimum standard
- High contrast ratios and clear focus indicators
- Support for screen readers and keyboard navigation

### 3. **Mobile-First Responsive**
- Optimized for field use on mobile devices
- Touch-friendly interfaces with 44px minimum tap targets
- Responsive design that works on all screen sizes

### 4. **Professional Aesthetics**
- Modern glassmorphism design with subtle transparency
- Trust-building visual elements for B2B software
- Consistent branding that reinforces expertise

## Color System

### Primary Colors
```css
--color-primary: #3b82f6;        /* Blue - Primary actions */
--color-primary-hover: #2563eb;  /* Blue hover state */
--color-accent: #10b981;         /* Green - Success/accent */
--color-accent-hover: #059669;   /* Green hover state */
```

### Semantic Colors
```css
--color-success: #10b981;        /* Success states */
--color-warning: #f59e0b;        /* Warning states */
--color-danger: #ef4444;         /* Error/danger states */
--color-info: #3b82f6;           /* Informational states */
```

### Background Colors
```css
--color-bg-primary: #0a0a0a;     /* Main background */
--color-bg-secondary: #111111;   /* Secondary background */
--color-bg-tertiary: #1a1a1a;    /* Tertiary background */
```

### Text Colors
```css
--color-text-primary: #f3f4f6;   /* Primary text */
--color-text-secondary: #d1d5db; /* Secondary text */
--color-text-muted: #9ca3af;     /* Muted text */
```

### Glass Effect Colors
```css
--glass-bg: rgba(255, 255, 255, 0.08);
--glass-bg-hover: rgba(255, 255, 255, 0.12);
--glass-border: rgba(255, 255, 255, 0.15);
--glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
```

## Typography

### Font Families
- **Primary**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono (Google Fonts)

### Type Scale
```css
--font-size-xs: clamp(0.75rem, 2vw, 0.875rem);
--font-size-sm: clamp(0.875rem, 2.5vw, 1rem);
--font-size-base: clamp(1rem, 2.5vw, 1.125rem);
--font-size-lg: clamp(1.125rem, 3vw, 1.25rem);
--font-size-xl: clamp(1.25rem, 3.5vw, 1.5rem);
--font-size-2xl: clamp(1.5rem, 4vw, 2rem);
--font-size-3xl: clamp(2rem, 5vw, 2.5rem);
--font-size-4xl: clamp(2.25rem, 6vw, 3.5rem);
```

### Line Heights
```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

## Spacing System

### Base Spacing Scale
```css
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
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
```

### Responsive Spacing
```css
--spacing-section: clamp(2rem, 8vw, 6rem);
--spacing-grid-gap: clamp(1rem, 4vw, 2rem);
--spacing-touch-target: clamp(44px, 6vw, 56px);
```

## Component Guidelines

### Button Variants
1. **Primary**: Main call-to-action buttons
2. **Secondary**: Secondary actions
3. **Ghost**: Subtle actions, often used in navigation
4. **Destructive**: Delete or dangerous actions
5. **Glass**: Transparent overlay buttons

### Card Types
1. **Basic**: Standard content containers
2. **Glass**: Transparent containers with backdrop blur
3. **Interactive**: Hover and focus states for clickable cards
4. **Status**: Cards with color-coded status indicators

### Form Elements
1. **Input**: Text inputs with consistent styling
2. **Select**: Dropdown selectors
3. **Checkbox**: Boolean selections
4. **Radio**: Single-choice selections
5. **Switch**: Toggle controls

## Animation Guidelines

### Timing Functions
```css
--transition-base: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
--transition-spring: all 0.3s cubic-bezier(0.68, -0.6, 0.32, 1.6);
```

### Motion Principles
- **Purposeful**: Animations serve a functional purpose
- **Subtle**: Smooth transitions without being distracting
- **Accessible**: Respect `prefers-reduced-motion` setting
- **Consistent**: Same timing and easing throughout

## Accessibility Standards

### Color Contrast
- **AA Compliance**: Minimum 4.5:1 for normal text
- **AAA Compliance**: 7:1 for enhanced accessibility
- **UI Elements**: 3:1 minimum for interactive elements

### Focus Management
- **Visible Focus**: Clear focus indicators on all interactive elements
- **Logical Tab Order**: Proper keyboard navigation flow
- **Skip Links**: Skip to main content functionality

### Screen Reader Support
- **ARIA Labels**: Proper labeling for all interactive elements
- **Semantic HTML**: Use of proper HTML5 semantic elements
- **Live Regions**: Dynamic content announcements

## Usage Examples

### Button Usage
```tsx
import { Button } from '@/design-system/components/Button'

<Button variant="primary" size="md">
  Calculate Estimate
</Button>
```

### Card Usage
```tsx
import { Card } from '@/design-system/components/Card'

<Card variant="glass" className="p-6">
  <h3>Project Details</h3>
  <p>Project information content</p>
</Card>
```

### Form Usage
```tsx
import { Input, Label } from '@/design-system/components/Form'

<Label htmlFor="project-name">Project Name</Label>
<Input id="project-name" placeholder="Enter project name" />
```

## Development Guidelines

### File Structure
```
design-system/
├── tokens.json          # Design tokens
├── components/          # Component library
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── ...
├── styles/             # Global styles
│   ├── globals.css
│   └── components.css
└── README.md           # This documentation
```

### Token Usage
Always use design tokens instead of hard-coded values:
```tsx
// ❌ Don't do this
<div style={{ color: '#f3f4f6' }}>

// ✅ Do this
<div className="text-text-primary">
```

### Component Props
Follow consistent prop naming:
- `variant`: Visual style variant
- `size`: Size variation (sm, md, lg)
- `disabled`: Disabled state
- `className`: Additional CSS classes

## Testing

### Visual Regression Testing
- Components are tested across all variants
- Multiple viewport sizes tested
- Dark/light mode compatibility verified

### Accessibility Testing
- Automated accessibility testing with axe-core
- Manual keyboard navigation testing
- Screen reader testing with NVDA/JAWS

## Maintenance

### Version Control
- Semantic versioning for design system updates
- Changelog maintained for breaking changes
- Migration guides for major updates

### Documentation
- Storybook documentation for all components
- Design token documentation
- Usage examples and best practices