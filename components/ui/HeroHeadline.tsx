'use client'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

interface HeroHeadlineProps {
  texts: string[]
  interval?: number
  className?: string
}

export default function HeroHeadline({ texts, interval = 3000, className }: HeroHeadlineProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % texts.length)
    }, interval)
    return () => clearInterval(timer)
  }, [texts, interval])

  return (
    <span className={clsx('hero-headline block min-h-[6rem] relative', className)}>
      {texts.map((text, i) => (
        <span
          key={i}
          className={clsx(
            'absolute inset-0 flex items-center opacity-0 transition-opacity',
            i === index && 'active'
          )}
        >
          {text}
        </span>
      ))}
    </span>
  )
}
