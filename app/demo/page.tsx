import DemoClient from './DemoClient'
import { buildMeta } from '../../lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Demo | MyRoofGenius',
    description: 'Watch demos of our estimation and compliance tools in action.'
  })

export default function DemoPage() {
  return <DemoClient />
}
