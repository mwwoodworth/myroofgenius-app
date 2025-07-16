import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://myroofgenius.com'
  
  // Static routes with their priorities and change frequencies
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/demo`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/get-started`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  // Dynamic routes - In production, these would be fetched from your database
  const blogPosts = await getBlogPosts()
  const products = await getProducts()
  const partners = await getPartners()

  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(product.updated_at || product.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const partnerRoutes = partners.map((partner) => ({
    url: `${baseUrl}/partners/${partner.slug}`,
    lastModified: new Date(partner.updated_at || partner.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticRoutes, ...blogRoutes, ...productRoutes, ...partnerRoutes]
}

// These functions would fetch from your database in production
async function getBlogPosts() {
  // For now, return sample data
  return [
    {
      slug: 'hidden-cost-drivers-commercial-roofing',
      published_at: '2025-06-15',
      updated_at: '2025-06-15',
    },
  ]
}

async function getProducts() {
  // For now, return sample data
  return [
    {
      id: 'quote-to-close-kit',
      created_at: '2024-01-01',
      updated_at: '2025-01-01',
    },
    {
      id: 'ai-roof-analyzer',
      created_at: '2024-01-01',
      updated_at: '2025-01-01',
    },
  ]
}

async function getPartners() {
  // For now, return sample data
  return [
    {
      slug: 'gaf-certified',
      created_at: '2024-01-01',
      updated_at: '2025-01-01',
    },
  ]
}