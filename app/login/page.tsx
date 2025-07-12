import LoginClient from './LoginClient'
import { buildMeta } from '../../lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Login | MyRoofGenius',
    description: 'Access your MyRoofGenius account and tools.',
  })

export default function LoginPageWrapper() {
  return <LoginClient />
}

