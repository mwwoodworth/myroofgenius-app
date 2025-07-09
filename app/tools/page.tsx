import ToolsClient from './ToolsClient'
import { buildMeta } from '../../lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Roofing Tools | MyRoofGenius',
    description: 'Professional calculators and financial tools for roofers.'
  })
export default function ToolsPage() {
  return <ToolsClient />
}
