import CashFlowClient from './CashFlowClient'
import { buildMeta } from '@/lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Cash Flow Forecaster | MyRoofGenius',
    description: 'Predict payment schedules and spot cash crunches.',
  })

export default function CashFlowPage() {
  return <CashFlowClient />
}

