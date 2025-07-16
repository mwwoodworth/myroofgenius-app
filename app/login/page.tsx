import { constructMetadata } from '../lib/metadata'

export const metadata = constructMetadata({
  title: 'Login | MyRoofGenius - Access Your Roofing Software Dashboard',
  description: 'Sign in to MyRoofGenius to access AI-powered roofing estimates, project management tools, and your contractor dashboard. Secure login for roofing professionals.',
  keywords: ['myroofgenius login', 'roofing software login', 'contractor portal', 'roofing dashboard access', 'sign in roofing tools'],
})

export default async function LoginPageWrapper() {
  const { default: LoginClient } = await import('./LoginClient')
  return <LoginClient />
}

