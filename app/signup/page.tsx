import { buildMeta } from '../../lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Sign Up | MyRoofGenius',
    description: 'Create your account to start using AI roofing tools.',
  })

export default async function SignupPageWrapper() {
  const { default: SignupClient } = await import('./SignupClient')
  return <SignupClient />
}

