'use client'
import { createContext, useContext, useEffect, useState } from 'react'

interface ARModeCtx {
  enabled: boolean
  toggle: () => void
}

const ARModeContext = createContext<ARModeCtx>({ enabled: false, toggle: () => {} })

export function ARModeProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('ar_mode')
    if (stored === 'true') setEnabled(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('ar_mode', String(enabled))
  }, [enabled])

  return (
    <ARModeContext.Provider value={{ enabled, toggle: () => setEnabled(e => !e) }}>
      {children}
    </ARModeContext.Provider>
  )
}

export const useARMode = () => useContext(ARModeContext)
