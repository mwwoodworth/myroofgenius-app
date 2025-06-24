import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

async function getProduct(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
    
  return data
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  
  if (!product) {
    notFound()
  }
  
  async function handleCheckout() {
    'use server'
    // Server action for checkout
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_id: product.price_id,
        product_id: product.id
      })
    })
    
    const data = await response.json()
    if (data.url) {
      // Redirect to Stripe
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold">${product.price}</span>
            <form action={handleCheckout}>
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
                Buy Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
