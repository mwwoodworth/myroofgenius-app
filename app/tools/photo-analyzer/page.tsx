import { buildMeta } from '@/lib/metadata'

export const generateMetadata = () =>
  buildMeta({
    title: 'Photo Analyzer | MyRoofGenius',
    description: 'Upload a roof photo to receive instant AI analysis.',
  })

export default async function PhotoAnalyzerPage() {
  const { default: PhotoAnalyzerClient } = await import('./PhotoAnalyzerClient')
  return <PhotoAnalyzerClient />
}

