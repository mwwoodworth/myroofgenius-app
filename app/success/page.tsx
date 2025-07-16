import { constructMetadata } from '../lib/metadata'

export const metadata = constructMetadata({
  title: 'Payment Successful | MyRoofGenius - Thank You for Your Purchase',
  description: 'Payment confirmed! Access your MyRoofGenius roofing software, templates, and tools. Your AI-powered roofing solutions are ready to use.',
  keywords: ['payment success', 'myroofgenius purchase', 'order confirmation', 'roofing software access', 'download ready'],
})

export default async function SuccessPageWrapper() {
  const { default: SuccessClient } = await import('./SuccessClient')
  return <SuccessClient />
}

