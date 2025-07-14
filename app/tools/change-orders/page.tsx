import { buildMeta } from '@/lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Change Order Calculator | MyRoofGenius',
    description: 'Price project changes fairly while protecting margins.',
  })

export default async function ChangeOrdersPage() {
  const { default: ChangeOrdersClient } = await import('./ChangeOrdersClient')
  return <ChangeOrdersClient />
}

