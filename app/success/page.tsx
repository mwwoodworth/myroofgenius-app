import { buildMeta } from '../../lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Payment Successful | MyRoofGenius',
    description: 'Thank you for your purchase. Access your download now.',
  })

export default async function SuccessPageWrapper() {
  const { default: SuccessClient } = await import('./SuccessClient')
  return <SuccessClient />
}

