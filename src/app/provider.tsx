'use client'

import { AuthProvider } from '@saas-ui/auth'
import { SaasProvider } from '@saas-ui/react'



export function Provider(props: { children: React.ReactNode }) {
  return (
    <SaasProvider>
      <AuthProvider>{props.children}</AuthProvider>
    </SaasProvider>
  )
}
