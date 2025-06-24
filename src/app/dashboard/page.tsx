import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

async function getDashboardData() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // Get orders count
  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
  
  // Get products count  
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    
  return {
    orders: ordersCount || 0,
    products: productsCount || 0,
    revenue: 0 // TODO: Calculate from orders
  }
}

export default async function Dashboard() {
  const data = await getDashboardData()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-600">Total Orders</h2>
            <p className="text-3xl font-bold mt-2">{data.orders}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-600">Products</h2>
            <p className="text-3xl font-bold mt-2">{data.products}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-600">Revenue</h2>
            <p className="text-3xl font-bold mt-2">${data.revenue}</p>
          </div>
        </div>
        
        {/* AI Copilot Panel */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-600">AI chat interface coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
