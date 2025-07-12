import SuccessClient from './SuccessClient'
import { buildMeta } from '../../lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Payment Successful | MyRoofGenius',
    description: 'Thank you for your purchase. Access your download now.',
  })

export default function SuccessPageWrapper() {
  return <SuccessClient />
}

