import { buildMeta } from '@/lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Material Calculator | MyRoofGenius',
    description: 'Upload measurements and get precise material lists.',
  })

export default async function MaterialCalculatorPage() {
  const { default: MaterialCalculatorClient } = await import('./MaterialCalculatorClient')
  return <MaterialCalculatorClient />
}

