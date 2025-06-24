'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../supabaseClient'
import content from '../../../../data/product.json'

export default function Product() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      setProduct(data)
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  const handleBuy = async () => {
    if (!product) return
    const user = (await supabase.auth.getUser()).data?.user

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || ''
    const res = await fetch(`${apiBase}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_id: product.price_id,
        product_id: product.id,
        user_id: user?.id || null,
      }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  if (loading) return <p style={{ padding: '2rem' }}>{content.loading}</p>
  if (!product) return <p style={{ padding: '2rem' }}>{content.notFound}</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>${product.price}</p>
      <button onClick={handleBuy}>{content.buyButton}</button>
    </div>
  )
}
