import PhotoAnalyzerClient from './PhotoAnalyzerClient'
import { buildMeta } from '@/lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Photo Analyzer | MyRoofGenius',
    description: 'Upload a roof photo to receive instant AI analysis.',
  })

export default function PhotoAnalyzerPage() {
  return <PhotoAnalyzerClient />
}

