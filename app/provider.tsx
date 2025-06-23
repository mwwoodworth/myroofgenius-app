'use client'

import { AuthProvider } from '@saas-ui/auth'
import { SaasProvider } from '@saas-ui/react'
import { useEffect, useState } from 'react'

import { theme } from '#theme'
import { CommandPalette } from '#components/command-palette'

export function Provider(props: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <SaasProvider theme={theme}>
      <AuthProvider>
        {props.children}
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      </AuthProvider>
    </SaasProvider>
  )
}
