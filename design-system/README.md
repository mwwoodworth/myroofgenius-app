# MyRoofGenius Design System

Reusable atomic components and design tokens for rapid UI development.

## Usage

```tsx
import { Button, Card } from '../design-system';
```

All new pages should import UI elements from this library instead of local component copies.

## Extending

1. Add tokens in `tokens.ts` or edit `tailwind.config.js`.
2. Create your component under `components/` and export it in `index.ts`.
3. Document it in `docs/Component.mdx` with prop tables and examples.

## Accessibility

Components follow WCAG guidelines with proper ARIA labels and keyboard focus styles. When adding new components, ensure focus rings, labels and semantic HTML are used.
