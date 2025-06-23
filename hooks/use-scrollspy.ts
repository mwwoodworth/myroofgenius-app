'use client'

import { useEffect, useState } from 'react'

export function useScrollSpy(
  selectors: string[],
  options: IntersectionObserverInit = {}
) {
  const [activeId, setActiveId] = useState<string>()

  useEffect(() => {
    const elements = selectors
      .map((selector) => document.querySelector(selector))
      .filter(Boolean) as Element[]

    if (elements.length === 0) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id')
          if (id) {
            setActiveId(id)
          }
        }
      })
    }, options)

    elements.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
    }
  }, [selectors.join(','), options.rootMargin, options.threshold])

  return activeId
}
