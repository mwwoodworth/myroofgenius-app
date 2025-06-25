"use client"
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { HotActions } from '../../components/ui'
import { salesEnabled } from '../lib/features'

// Add dynamic export to prevent static generation
export const dynamic = 'force-dynamic'

async function fetchProducts() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not configured')
    return []
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

export default function Marketplace() {
  const disabled = !salesEnabled
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    if (!disabled) {
      fetchProducts().then(setProducts)
    }
  }, [disabled])

  if (disabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <p>Marketplace is currently disabled.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* Hero Section */}
      <section className="bg-accent text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Professional Roofing Tools & Templates</h1>
          <p className="text-xl text-blue-100 mb-8">
            Save hours on every project with battle-tested resources used by 2,800+ contractors
          </p>
          <div className="flex flex-wrap gap-4 mb-6">
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
          <HotActions />
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-bg-card border-b border-[rgba(255,255,255,0.1)]">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.04, boxShadow: '0 4px 20px #5E5CE6bb' }}
                  className="bg-bg-card p-6 rounded-lg shadow"
                >
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop'}
                    alt={product.name}
                    className="rounded mb-4 w-full h-48 object-cover"
                  />
                  <h4 className="font-semibold text-xl">{product.name}</h4>
                  <p className="text-text-secondary">{product.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-accent">${product.price}</span>
                    <a href={`/product/${product.id}`} className="btn-accent rounded px-4 py-1">Buy</a>
                  </div>
                </motion.div>
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