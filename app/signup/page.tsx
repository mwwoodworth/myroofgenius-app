import { constructMetadata } from '../lib/metadata'

export const metadata = constructMetadata({
  title: 'Sign Up | MyRoofGenius - Start Your Free Roofing Software Trial',
  description: 'Create your MyRoofGenius account and get instant access to AI-powered roofing calculators, estimate generators, and contractor tools. Start your free trial today.',
  keywords: ['roofing software free trial', 'sign up myroofgenius', 'contractor software registration', 'roofing tools account', 'AI roofing signup'],
})

export default async function SignupPageWrapper() {
  const { default: SignupClient } = await import('./SignupClient')
  return <SignupClient />
}

