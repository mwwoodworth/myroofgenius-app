import { useEffect, useRef } from 'react'

export function useFocusTrap(isActive: boolean) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    const element = elementRef.current
    if (!element) return

    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstFocusableElement = focusableElements[0] as HTMLElement
    const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement

    // Store the element that was focused before the trap was activated
    const previouslyFocusedElement = document.activeElement as HTMLElement

    // Focus the first element
    firstFocusableElement?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableElement) {
          e.preventDefault()
          lastFocusableElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableElement) {
          e.preventDefault()
          firstFocusableElement?.focus()
        }
      }
    }

    element.addEventListener('keydown', handleKeyDown)

    return () => {
      element.removeEventListener('keydown', handleKeyDown)
      // Restore focus to the previously focused element
      previouslyFocusedElement?.focus()
    }
  }, [isActive])

  return elementRef
}