'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import content from '../../../data/marketplace.json'

export default function Marketplace() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*')
      setProducts(data || [])
    }
    fetchProducts()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8 text-[#202940]">{content.title}</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
            <img src={p.image_url} alt={p.name} className="h-48 w-full object-cover rounded-t-lg" />
            <div className="p-4">
              <h3 className="font-semibold text-lg text-[#202940]">{p.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{p.description}</p>
              <p className="font-bold text-[#2366d1] mb-4">${p.price}</p>
              <a href={`/product/${p.id}`} className="bg-[#2366d1] hover:bg-[#1e59b8] text-white py-2 px-4 rounded w-full inline-block text-center">
                {content.viewButton}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
