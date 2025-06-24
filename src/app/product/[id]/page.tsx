import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import CheckoutButton from './CheckoutButton'

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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold">${product.price}</span>
            <CheckoutButton 
              priceId={product.price_id} 
              productId={product.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
