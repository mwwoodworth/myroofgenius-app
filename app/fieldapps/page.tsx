import FieldAppsClient from './FieldAppsClient'
import { buildMeta } from '../../lib/metadata'

export const dynamic = 'force-dynamic'

export const generateMetadata = () =>
  buildMeta({
    title: 'Field Apps | MyRoofGenius',
    description: 'Quick links to Claude-powered utilities for crews and partners.'
  })

export default function FieldApps() {
  return <FieldAppsClient />
}
