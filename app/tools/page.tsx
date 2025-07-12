import ToolsPageClient from './ToolsPageClient'
import { buildMeta } from '@/lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Roofing Calculators & AI Tools | MyRoofGenius',
    description: 'Estimate costs, analyze damage and generate proposals using our professional roofing tools.',
  })

export default function ToolsPageWrapper() {
  return <ToolsPageClient />
}

