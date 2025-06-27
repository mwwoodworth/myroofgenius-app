'use client'
import { useEffect, useState } from 'react'

interface FeatureFlag {
  key: string
  label: string
  description: string
  enabled: boolean
}

const initialFlags: FeatureFlag[] = [
  {
    key: 'AI_COPILOT_ENABLED',
    label: 'AI Copilot',
    description: 'AI-powered assistance features',
    enabled: process.env.NEXT_PUBLIC_AI_COPILOT_ENABLED === 'true'
  },
  {
    key: 'ESTIMATOR_ENABLED',
    label: 'Estimator',
    description: 'Roof estimation page',
    enabled: process.env.NEXT_PUBLIC_ESTIMATOR_ENABLED === 'true'
  },
  {
    key: 'AR_MODE_ENABLED',
    label: 'AR Mode',
    description: 'Augmented reality features',
    enabled: process.env.NEXT_PUBLIC_AR_MODE_ENABLED === 'true'
  },
  {
    key: 'SALES_ENABLED',
    label: 'Marketplace',
    description: 'Product marketplace',
    enabled: process.env.NEXT_PUBLIC_SALES_ENABLED === 'true'
  }
]

export default function AdminSettings() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])

  useEffect(() => {
    const withOverrides = initialFlags.map(f => {
      const override = localStorage.getItem(f.key)
      return override ? { ...f, enabled: override === 'true' } : f
    })
    setFlags(withOverrides)
  }, [])

  const toggle = (key: string, value: boolean) => {
    localStorage.setItem(key, value ? 'true' : 'false')
    setFlags(flags.map(f => (f.key === key ? { ...f, enabled: value } : f)))
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Feature Flags</h1>
      {flags.map(flag => (
        <label key={flag.key} className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={flag.enabled}
            onChange={e => toggle(flag.key, e.target.checked)}
          />
          <span className="font-medium">{flag.label}</span>
          <span className="text-sm text-gray-500">{flag.description}</span>
        </label>
      ))}
      <p className="text-sm text-gray-500">
        Changes apply on next page load and are stored in localStorage.
      </p>
    </div>
  )
}
