import LaborEstimatorClient from './LaborEstimatorClient'
import { buildMeta } from '@/lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Labor Hour Estimator | MyRoofGenius',
    description: 'Calculate crew sizes using real productivity data.',
  })

export default function LaborEstimatorPage() {
  return <LaborEstimatorClient />
}

