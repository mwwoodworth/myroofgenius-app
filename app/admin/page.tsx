'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Users, 
  Package, 
  DollarSign, 
  FileText, 
  Settings,
  BarChart3,
  Download,
  Upload,
  Search,
  Filter
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Admin role check
async function checkAdminAccess() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()
  
  return profile?.is_admin === true
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    pendingTickets: 0,
    monthlyRevenue: []
  })
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    verifyAccess()
    if (isAdmin) {
      loadDashboardData()
    }
  }, [isAdmin])

  async function verifyAccess() {
    const hasAccess = await checkAdminAccess()
    if (!hasAccess) {
      router.push('/dashboard')
    } else {
      setIsAdmin(true)
      setLoading(false)
    }
  }

  async function loadDashboardData() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get stats
    const [users, orders, products, tickets] = await Promise.all([
      supabase.from('user_profiles').select('id', { count: 'exact' }),
      supabase.from('orders').select('id, amount', { count: 'exact' }),
      supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('support_tickets').select('id', { count: 'exact' }).eq('status', 'open')
    ])

    const totalRevenue = orders.data?.reduce((sum, order) => sum + order.amount, 0) || 0

    setStats({
      totalUsers: users.count || 0,
      totalOrders: orders.count || 0,
      totalRevenue,
      activeProducts: products.count || 0,
      pendingTickets: tickets.count || 0,
      monthlyRevenue: calculateMonthlyRevenue(orders.data || [])
    })
  }

  function calculateMonthlyRevenue(orders: any[]) {
    // Implementation similar to dashboard
    return []
  }

  if (loading) return <div>Loading...</div>
  if (!isAdmin) return <div>Access Denied</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex space-x-8">
          {['overview', 'orders', 'products', 'users', 'analytics', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 font-medium capitalize
                ${activeTab === tab 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'}
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

// Component implementations for each tab
function OverviewTab({ stats }: { stats: any }) {
  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<Package className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Active Products"
          value={stats.activeProducts}
          icon={<FileText className="w-6 h-6" />}
          color="orange"
        />
        <StatCard
          title="Pending Tickets"
          value={stats.pendingTickets}
          icon={<Settings className="w-6 h-6" />}
          color="red"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
        {/* Add chart implementation */}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        products (name),
        user_profiles (company_name, user_id)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    setOrders(data || [])
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Recent Orders</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order: any) => (
              <tr key={order.id}>
                <td className="px-6 py-4 text-sm">{order.id.slice(0, 8)}</td>
                <td className="px-6 py-4 text-sm">{order.user_profiles?.company_name || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">{order.products?.name}</td>
                <td className="px-6 py-4 text-sm">${order.amount.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`
                    px-2 py-1 text-xs rounded
                    ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  `}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-blue-600 hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProductsTab() {
  const [products, setProducts] = useState([])
  const [showAddProduct, setShowAddProduct] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    setProducts(data || [])
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Products</h2>
        <button
          onClick={() => setShowAddProduct(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product: any) => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover mr-3"
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.description.slice(0, 50)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{product.category}</td>
                <td className="px-6 py-4 text-sm">${product.price}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`
                    px-2 py-1 text-xs rounded
                    ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                  `}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && <AddProductModal onClose={() => setShowAddProduct(false)} />}
    </div>
  )
}

function AddProductModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'estimation',
    features: '',
    image_url: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase
      .from('products')
      .insert({
        ...formData,
        price: parseFloat(formData.price),
        price_id: `price_${Date.now()}`,
        is_active: true
      })

    if (!error) {
      onClose()
      // Refresh products list
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="estimation">Estimation</option>
                <option value="templates">Templates</option>
                <option value="checklists">Checklists</option>
                <option value="financial">Financial</option>
                <option value="safety">Safety</option>
                <option value="training">Training</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Features (comma-separated)</label>
            <input
              type="text"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Feature 1, Feature 2, Feature 3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UsersTab() {
  // Implementation similar to Orders tab
  return <div>Users management interface</div>
}

function AnalyticsTab() {
  // Implementation with charts and analytics
  return <div>Analytics and reporting interface</div>
}

function SettingsTab() {
  // System settings management
  return <div>System settings interface</div>
}
