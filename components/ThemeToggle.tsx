'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun, Contrast } from 'lucide-react'

type Theme = 'light' | 'dark' | 'high-contrast'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (prefersHighContrast) {
      setTheme('high-contrast')
    } else if (prefersDark) {
      setTheme('dark')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const root = document.documentElement
    
    // Remove all theme classes
    root.removeAttribute('data-theme')
    root.classList.remove('high-contrast')
    
    // Apply the selected theme
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light')
    } else if (theme === 'high-contrast') {
      root.classList.add('high-contrast')
    }
    
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  if (!mounted) {
    return null
  }

  const cycleTheme = () => {
    const themes: Theme[] = ['dark', 'light', 'high-contrast']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />
      case 'high-contrast':
        return <Contrast className="w-5 h-5" />
      default:
        return <Moon className="w-5 h-5" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to high contrast mode'
      case 'high-contrast':
        return 'Switch to dark mode'
      default:
        return 'Switch to light mode'
    }
  }

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg glass hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </button>
  )
}