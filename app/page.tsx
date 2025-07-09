import HomeClient from './HomeClient'
import { buildMeta } from '../lib/metadata'

export const dynamic = 'force-dynamic'

export const generateMetadata = () =>
  buildMeta({
    title: 'MyRoofGenius - Smart Roofing Solutions',
    description: 'AI-powered roofing tools and marketplace for contractors.',
  })

export default function HomePage() {
  return <HomeClient />
}
