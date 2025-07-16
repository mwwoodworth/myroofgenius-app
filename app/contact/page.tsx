import { constructMetadata } from '../lib/metadata'

export const metadata = constructMetadata({
  title: 'Contact Us | MyRoofGenius - Get Support for Your Roofing Software',
  description: 'Contact MyRoofGenius for support, sales inquiries, or partnership opportunities. Our team is ready to help you transform your roofing business with AI technology.',
  keywords: ['contact myroofgenius', 'roofing software support', 'contractor help', 'AI roofing assistance', 'customer service roofing'],
})

export default async function ContactPageWrapper() {
  const { default: ContactClient } = await import('./ContactClient')
  return <ContactClient />
}