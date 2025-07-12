import MaterialCalculatorClient from './MaterialCalculatorClient'
import { buildMeta } from '@/lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Material Calculator | MyRoofGenius',
    description: 'Upload measurements and get precise material lists.',
  })

export default function MaterialCalculatorPage() {
  return <MaterialCalculatorClient />
}

