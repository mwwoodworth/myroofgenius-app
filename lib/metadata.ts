import type { Metadata } from 'next'

interface MetaInput {
  title: string
  description: string
  image?: string
}

export function buildMeta({ title, description, image }: MetaInput): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://myroofgenius.com'
  const img = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/og.png`

  return {
    title,
    description,
    alternates: { canonical: baseUrl },
    openGraph: {
      title,
      description,
      images: [img]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [img]
    }
  }
}
