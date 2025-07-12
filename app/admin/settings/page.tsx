import SettingsClient from './SettingsClient'
import { buildMeta } from '../../../lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Admin Settings | MyRoofGenius',
    description: 'Toggle feature flags and configuration options.',
  })

export default function SettingsPage() {
  return <SettingsClient />
}

