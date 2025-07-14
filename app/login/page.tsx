import { buildMeta } from '../../lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Login | MyRoofGenius',
    description: 'Access your MyRoofGenius account and tools.',
  })

export default async function LoginPageWrapper() {
  const { default: LoginClient } = await import('./LoginClient')
  return <LoginClient />
}

