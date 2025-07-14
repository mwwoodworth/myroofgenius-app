import { buildMeta } from '@/lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Labor Hour Estimator | MyRoofGenius',
    description: 'Calculate crew sizes using real productivity data.',
  })

export default async function LaborEstimatorPage() {
  const { default: LaborEstimatorClient } = await import('./LaborEstimatorClient')
  return <LaborEstimatorClient />
}

