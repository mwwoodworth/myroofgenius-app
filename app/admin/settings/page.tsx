import { buildMeta } from '../../../lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Admin Settings | MyRoofGenius',
    description: 'Toggle feature flags and configuration options.',
  })

export default async function SettingsPage() {
  const { default: SettingsClient } = await import('./SettingsClient')
  return <SettingsClient />
}

