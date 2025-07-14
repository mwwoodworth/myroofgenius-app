import { buildMeta } from '@/lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Cash Flow Forecaster | MyRoofGenius',
    description: 'Predict payment schedules and spot cash crunches.',
  })

export default async function CashFlowPage() {
  const { default: CashFlowClient } = await import('./CashFlowClient')
  return <CashFlowClient />
}

