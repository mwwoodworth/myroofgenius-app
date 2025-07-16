// Accessibility utility functions
import React from 'react'

export const a11yProps = {
  // For clickable elements that aren't buttons or links
  clickable: {
    role: 'button',
    tabIndex: 0,
    onKeyDown: (handler: () => void) => (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handler()
      }
    },
  },
  
  // For decorative images
  decorative: {
    'aria-hidden': true,
    alt: '',
  },
  
  // For loading states
  loading: {
    'aria-busy': true,
    'aria-live': 'polite' as const,
  },
  
  // For expanded/collapsed states
  expandable: (isExpanded: boolean) => ({
    'aria-expanded': isExpanded,
  }),
  
  // For current page in navigation
  current: {
    'aria-current': 'page' as const,
  },
}

// Screen reader only text
export function srOnly(text: string) {
  return React.createElement('span', { className: 'sr-only' }, text)
}

// Announce to screen readers
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.setAttribute('class', 'sr-only')
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Generate unique IDs for form elements
let idCounter = 0
export function useId(prefix = 'a11y') {
  return `${prefix}-${++idCounter}`
}

// Focus management
export const focusManager = {
  // Save current focus
  saveFocus: () => document.activeElement as HTMLElement,
  
  // Restore focus to element
  restoreFocus: (element: HTMLElement | null) => {
    element?.focus()
  },
  
  // Focus first focusable element in container
  focusFirst: (container: HTMLElement) => {
    const focusable = container.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable?.focus()
  },
}

// Keyboard navigation helpers
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  TAB: 'Tab',
}

// Check if user prefers reduced motion
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// High contrast mode detection
export function prefersHighContrast() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: high)').matches
}