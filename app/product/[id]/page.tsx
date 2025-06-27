import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import CheckoutButton from './CheckoutButton'
import Image from 'next/image'
import Link from 'next/link'
import { salesEnabled } from '../../lib/features'

// Add dynamic params export to handle dynamic routes
export async function generateStaticParams() {
  // Return empty array to disable static generation for dynamic routes
  return []
}

async function getProduct(id: string) {
  // Handle missing env vars gracefully
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not configured')
    return null
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
    
  return data
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  if (!salesEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <p>Marketplace is currently disabled.</p>
      </div>
    )
  }
  const product = await getProduct(params.id)
  
  if (!product) {
    notFound()
  }
  
  // Mock data for demonstration - would come from product data
  const features = product.features?.split(',') || [
    'Instant download after purchase',
    'Lifetime updates included',
    'Email support for 90 days',
    'Compatible with Excel 2016+',
    'Works on Mac and PC'
  ]
  
  const benefits = [
    { icon: '⏰', title: 'Save 3+ Hours', desc: 'Per estimate with automated calculations' },
    { icon: '💰', title: 'Increase Margins', desc: 'Catch hidden costs before they eat profits' },
    { icon: '🎯', title: 'Win More Bids', desc: 'Professional proposals that stand out' },
  ]
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/marketplace" className="text-gray-500 hover:text-gray-700">Marketplace</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
              <Image
                src={product.image_url || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop'}
                alt={product.name}
                width={800}
                height={600}
                className="w-full"
              />
            </div>
            {/* Thumbnail gallery would go here */}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {product.category || 'Professional Tool'}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-yellow-400">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <span className="text-gray-600">4.8/5 (127 reviews)</span>
            </div>

            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {product.description || 'Professional-grade tool designed specifically for commercial roofing contractors. Battle-tested on hundreds of projects.'}
            </p>

            {/* Price and CTA */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-4xl font-bold">${product.price}</span>
                  {product.original_price && (
                    <span className="text-xl text-gray-500 line-through ml-3">
                      ${product.original_price}
                    </span>
                  )}
                </div>
                <span className="text-green-600 font-semibold">You save ${((product.original_price || product.price) - product.price).toFixed(2)}</span>
              </div>
              
              <CheckoutButton 
                priceId={product.price_id} 
                productId={product.id}
              />
              
              <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  30-Day Guarantee
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure Checkout
                </span>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Why Contractors Choose This</h3>
              <div className="space-y-3">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="text-2xl">{benefit.icon}</span>
                    <div>
                      <h4 className="font-semibold">{benefit.title}</h4>
                      <p className="text-gray-600 text-sm">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">What&apos;s Included</h3>
              <ul className="space-y-2">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{feature.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="mt-16 border-t pt-16">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex text-yellow-400 mb-2">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                &quot;This tool paid for itself on the first project. Found $8,000 in hidden costs I would have missed.&quot;
              </p>
              <p className="font-semibold">Mike R. - Denver, CO</p>
              <p className="text-sm text-gray-500">Verified Purchase</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex text-yellow-400 mb-2">
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                &quot;Finally, someone who understands commercial roofing. This is exactly what I&apos;ve been looking for.&quot;
              </p>
              <p className="font-semibold">Sarah T. - Colorado Springs</p>
              <p className="text-sm text-gray-500">Verified Purchase</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16 border-t pt-16">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">How do I access my purchase?</h3>
                <p className="text-gray-600">
                  You&apos;ll receive an email with download links immediately after purchase. Files are also available in your account dashboard.
                </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What if I need help using the tool?</h3>
              <p className="text-gray-600">
                Every purchase includes 90 days of email support. We also provide video tutorials and documentation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is this compatible with my software?</h3>
              <p className="text-gray-600">
                Our tools work with Excel 2016 or newer (Mac and PC), Google Sheets, and most project management software.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}