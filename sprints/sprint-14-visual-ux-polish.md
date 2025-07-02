## Sprint 14: Visual & UX Polishing

```markdown
# Sprint 14: Visual & UX Polishing

## Objective
Polish the user interface with loading states, accessibility improvements, responsive design fixes, and overall visual refinements for production readiness.

## Critical Context for Codex
- Add loading states and skeletons for better perceived performance
- Ensure WCAG 2.1 AA compliance for accessibility
- Fix responsive design issues
- Add micro-interactions and polish animations

## Task 1: Create Loading Components

### Create `src/components/ui/skeleton.tsx`:
```typescript
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="h-12 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <SkeletonTable />
    </div>
  );
}
Create src/components/ui/spinner.tsx:
typescriptimport { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ size = 'md', className, ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={cn('relative', sizeClasses[size], className)}
      {...props}
    >
      <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700" />
      <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
Task 2: Add Loading States to Components
Update src/components/marketplace/Marketplace.tsx:
typescriptimport { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

export default function Marketplace() {
  const [loading, setLoading] = useState(true);
  // ... existing code

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... existing filters ... */}
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ... existing product cards ... */}
        </div>
      )}
    </div>
  );
}
Update src/app/dashboard/page.tsx for loading state:
typescriptimport { Suspense } from 'react';
import { SkeletonDashboard } from '@/components/ui/skeleton';

export default function DashboardPage() {
  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <Dashboard />
    </Suspense>
  );
}
Task 3: Accessibility Improvements
Create src/components/ui/visually-hidden.tsx:
typescriptimport * as React from 'react';

export const VisuallyHidden = React.forwardRef
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ ...props }, ref) => {
  return (
    <span
      ref={ref}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        borderWidth: 0,
      }}
      {...props}
    />
  );
});

VisuallyHidden.displayName = 'VisuallyHidden';
Update components for accessibility:
typescript// Add ARIA labels and keyboard navigation
// Example: Update navigation in src/components/navigation/navbar.tsx

export function Navbar() {
  return (
    <nav role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="MyRoofGenius Home">
          <Logo />
        </Link>
        
        <ul role="list" className="flex space-x-6">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="focus:outline-none focus:ring-2 focus:ring-primary rounded-md px-2 py-1"
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        
        <button
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </nav>
  );
}
Task 4: Responsive Design Fixes
Update mobile menu with proper scrolling:
typescript// src/components/navigation/mobile-menu.tsx
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          className="fixed inset-0 z-50 md:hidden"
        >
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <div className="fixed right-0 top-0 h-full w-[80%] max-w-sm bg-background overflow-y-auto">
            <div className="sticky top-0 bg-background border-b px-4 py-3 flex justify-between items-center">
              <span className="font-semibold">Menu</span>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 hover:bg-accent rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="px-4 py-6">
              <ul className="space-y-4">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block py-2 text-lg hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
Task 5: Add Micro-interactions
Create src/hooks/use-hover-effect.ts:
typescriptimport { useRef, useEffect } from 'react';

export function useHoverEffect() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      element.style.setProperty('--mouse-x', `${x}px`);
      element.style.setProperty('--mouse-y', `${y}px`);
    };

    element.addEventListener('mousemove', handleMouseMove);
    return () => element.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return ref;
}
Add hover effects to cards:
css/* src/styles/globals.css */
@layer utilities {
  .hover-lift {
    @apply transition-transform duration-300 ease-out;
  }
  
  .hover-lift:hover {
    @apply -translate-y-1;
  }
  
  .card-hover {
    @apply relative overflow-hidden;
  }
  
  .card-hover::before {
    content: '';
    @apply absolute inset-0 opacity-0 transition-opacity duration-300;
    background: radial-gradient(
      600px circle at var(--mouse-x) var(--mouse-y),
      rgba(255, 255, 255, 0.1),
      transparent 40%
    );
  }
  
  .card-hover:hover::before {
    @apply opacity-100;
  }
}
Task 6: Focus States and Keyboard Navigation
Create src/styles/focus.css:
css@layer utilities {
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background;
  }
  
  .focus-visible-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background;
  }
  
  .keyboard-only:focus {
    @apply outline-none;
  }
  
  .keyboard-only:focus-visible {
    @apply ring-2 ring-primary ring-offset-2 ring-offset-background;
  }
}
Update all interactive elements:
typescript// Example: Update button component
export function Button({ className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
Validation Steps

Test all loading states by throttling network
Run axe DevTools for accessibility audit
Test on mobile devices (iOS Safari, Android Chrome)
Test keyboard navigation through entire app
Verify contrast ratios meet WCAG AA standards

Success Criteria

 All async operations show loading states
 Zero accessibility violations in axe audit
 Mobile menu scrolls properly on all devices
 All interactive elements have focus states
 Animations respect prefers-reduced-motion