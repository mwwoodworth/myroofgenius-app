import { Metadata } from 'next'

export const siteConfig = {
  name: 'MyRoofGenius',
  url: 'https://myroofgenius.com',
  ogImage: 'https://myroofgenius.com/og-image.png',
  description: 'AI-powered roofing software, calculators, and marketplace for contractors. Streamline estimates, manage projects, and grow your roofing business.',
  keywords: ['roofing software', 'roofing calculator', 'roofing estimates', 'contractor tools', 'roofing marketplace', 'AI roofing', 'construction software'],
}

export function constructMetadata({
  title = 'MyRoofGenius - AI-Powered Roofing Software & Marketplace',
  description = siteConfig.description,
  keywords = siteConfig.keywords,
  image = siteConfig.ogImage,
  icons = '/favicon.ico',
  noIndex = false,
}: {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@myroofgenius',
    },
    icons,
    metadataBase: new URL(siteConfig.url),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}