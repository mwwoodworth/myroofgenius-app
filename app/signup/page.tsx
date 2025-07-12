import SignupClient from './SignupClient'
import { buildMeta } from '../../lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Sign Up | MyRoofGenius',
    description: 'Create your account to start using AI roofing tools.',
  })

export default function SignupPageWrapper() {
  return <SignupClient />
}

