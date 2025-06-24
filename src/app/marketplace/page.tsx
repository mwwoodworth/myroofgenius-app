import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

// Add dynamic export to prevent static generation
export const dynamic = 'force-dynamic'

async function getProducts() {
  // Handle missing env vars gracefully
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not configured')
    return []
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    
  return data || []
}

const categories = [
  { id: 'all', name: 'All Products', icon: '🏠' },
  { id: 'estimation', name: 'Estimation Tools', icon: '📊' },
  { id: 'templates', name: 'Contract Templates', icon: '📋' },
  { id: 'checklists', name: 'Inspection Checklists', icon: '✅' },
  { id: 'financial', name: 'Financial Tools', icon: '💰' },
  { id: 'safety', name: 'Safety Resources', icon: '⚠️' },
]

export default async function Marketplace() {
  const products = await getProducts()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Professional Roofing Tools & Templates</h1>
          <p className="text-xl text-blue-100 mb-8">
            Save hours on every project with battle-tested resources used by 2,800+ contractors
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm">
              ✨ Instant Download
            </div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm">
              💯 30-Day Guarantee
            </div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm">
              🔄 Lifetime Updates
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Products are being added. Check back soon!</p>
              <Link href="/" className="text-blue-600 hover:underline">
                Return to Homepage
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    <img 
                      src={product.image_url || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop'} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold">{product.name}</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {product.category || 'Tool'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold">${product.price}</span>
                        {product.original_price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.original_price}
                          </span>
                        )}
                      </div>
                      <Link 
                        href={`/product/${product.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                      >
                        View Details
                      </Link>
                    </div>
                    {product.features && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {product.features.split(',').slice(0, 3).map((feature, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {feature.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Can't Find What You Need?</h2>
          <p className="text-gray-600 mb-6">
            We're constantly adding new tools based on contractor feedback
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Request a Custom Tool
          </Link>
        </div>
      </section>
    </div>
  )
}