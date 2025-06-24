import { createClient } from '@supabase/supabase-js'

// Add dynamic export to prevent static generation
export const dynamic = 'force-dynamic'

async function getDashboardData() {
  // Handle missing env vars gracefully
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not configured')
    return {
      orders: 0,
      products: 0,
      revenue: 0,
      recentOrders: [],
      recentActivity: []
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  // Get orders data
  const { data: orders, count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(10)
  
  // Get products count  
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
  
  // Calculate revenue
  const revenue = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0
  
  // Get recent activity (mock data for now)
  const recentActivity = [
    { type: 'order', message: 'New order: Estimation Toolkit Pro', time: '2 hours ago', icon: '💰' },
    { type: 'signup', message: 'New user signup from Denver, CO', time: '4 hours ago', icon: '👤' },
    { type: 'download', message: 'Cash Flow Template downloaded', time: '5 hours ago', icon: '📥' },
    { type: 'review', message: '5-star review on Quote-to-Close Kit', time: '1 day ago', icon: '⭐' },
  ]
    
  return {
    orders: ordersCount || 0,
    products: productsCount || 0,
    revenue,
    recentOrders: orders || [],
    recentActivity
  }
}

export default async function Dashboard() {
  const data = await getDashboardData()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your business overview.</p>
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">${data.revenue.toFixed(2)}</p>
                <p className="text-sm text-green-600 mt-1">+12.5% from last month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{data.orders}</p>
                <p className="text-sm text-green-600 mt-1">+18% from last month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-3xl font-bold mt-2">{data.products}</p>
                <p className="text-sm text-gray-600 mt-1">In marketplace</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🛍️</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold mt-2">3.2%</p>
                <p className="text-sm text-green-600 mt-1">+0.5% from last month</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
              </div>
              <div className="p-6">
                {data.recentOrders.length === 0 ? (
                  <p className="text-gray-600">No orders yet. Share your marketplace link to start selling!</p>
                ) : (
                  <div className="space-y-4">
                    {data.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${order.amount.toFixed(2)}</p>
                          <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {data.recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="text-2xl">{activity.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Assistant Panel */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">AI Business Assistant</h2>
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <span className="text-4xl">🤖</span>
              <h3 className="text-lg font-semibold mt-4 mb-2">Coming Soon: Your AI Copilot</h3>
              <p className="text-gray-600 mb-4">
                Get instant answers about your business metrics, customer insights, and growth opportunities.
              </p>
              <button className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed" disabled>
                Activate AI Assistant (Coming Q3 2025)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}