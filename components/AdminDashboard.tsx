'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Users, Package, DollarSign, FileText, Settings as SettingsIcon, BarChart3 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

async function checkAdminAccess() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('user_profiles').select('is_admin').eq('user_id', user.id).single()
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
    monthlyRevenue: [] as { month: string, revenue: number }[]
  })
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    verifyAccess()
  }, [])

  useEffect(() => {
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
    const res = await fetch('/api/admin/stats')
    if (res.ok) {
      const data = await res.json()
      setStats(data)
    }
  }

  function calculateMonthlyRevenue(orders: any[]) {
    const revenueByMonth: { [month: string]: number } = {}
    orders.forEach(order => {
      const date = new Date(order.created_at)
      const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
      revenueByMonth[month] = (revenueByMonth[month] || 0) + order.amount
    })
    const months = Object.keys(revenueByMonth).sort()
    const recentMonths = months.slice(-12)
    return recentMonths.map(month => ({ month, revenue: revenueByMonth[month] }))
  }

  if (loading) return <div className="p-4">Loading...</div>
  if (!isAdmin) return <div className="p-4">Access Denied</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex space-x-8">
          {['overview', 'orders', 'products', 'users', 'analytics', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'analytics' && <AnalyticsTab stats={stats} />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

function OverviewTab({ stats }: { stats: any }) {
  const maxRevenue = stats.monthlyRevenue.length ? Math.max(...stats.monthlyRevenue.map((m: any) => m.revenue)) : 0
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-6 h-6" />} color="blue" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={<Package className="w-6 h-6" />} color="green" />
        <StatCard title="Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="w-6 h-6" />} color="purple" />
        <StatCard title="Active Products" value={stats.activeProducts} icon={<FileText className="w-6 h-6" />} color="orange" />
        <StatCard title="Pending Tickets" value={stats.pendingTickets} icon={<SettingsIcon className="w-6 h-6" />} color="red" />
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
        {stats.monthlyRevenue.length > 0 ? (
          <div className="flex items-end space-x-2 h-40">
            {stats.monthlyRevenue.map((monthData: any) => (
              <div key={monthData.month} className="relative bg-blue-500" style={{ height: `${maxRevenue ? (monthData.revenue / maxRevenue) * 100 : 0}%`, width: '12px' }} title={`${monthData.month}: $${monthData.revenue.toFixed(2)}`}></div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No revenue data available.</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string, value: any, icon: JSX.Element, color: string }) {
  const colorClasses: Record<string, string> = {
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
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  )
}

function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    const res = await fetch('/api/admin/orders')
    if (res.ok) {
      const json = await res.json()
      setOrders(json.orders || [])
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 uppercase">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map(order => (
              <tr key={order.id}>
                <td className="px-6 py-2">{order.id.slice(0, 8)}...</td>
                <td className="px-6 py-2">{order.customer_email || '—'}</td>
                <td className="px-6 py-2">{order.products?.name || '—'}</td>
                <td className="px-6 py-2">${order.amount.toFixed(2)}</td>
                <td className="px-6 py-2">
                  <span className={`px-2 py-1 text-xs rounded ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.status}</span>
                </td>
                <td className="px-6 py-2">{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function ProductsTab() {
  const [products, setProducts] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const res = await fetch('/api/admin/products')
    if (res.ok) {
      const json = await res.json()
      setProducts(json.products || [])
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Products</h2>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Product</button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 uppercase">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product.id}>
                <td className="px-6 py-3">
                  <div className="flex items-center">
                    <Image src={product.image_url} alt={product.name} width={40} height={40} className="w-10 h-10 rounded object-cover mr-3" />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.description?.slice(0, 50)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3">{product.category}</td>
                <td className="px-6 py-3">${product.price.toFixed(2)}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 text-xs rounded ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{product.is_active ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-6 py-3">
                  <button className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd && <AddProductModal onClose={() => { setShowAdd(false); loadProducts() }} />}
    </div>
  )
}

function AddProductModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'estimation', features: '', image_url: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (res.ok) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={3} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
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
            <input type="text" value={formData.features} onChange={e => setFormData({ ...formData, features: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Feature1, Feature2, ..."/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input type="url" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Product</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<Array<any>>([])
  const [loading, setLoading] = useState(true)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const json = await res.json()
      setUsers(json.users || [])
    }
    setLoading(false)
  }

  async function toggleAdmin(userId: string, currentStatus: boolean) {
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, is_admin: !currentStatus })
    })
    setUsers(users.map(u => u.user_id === userId ? { ...u, is_admin: !currentStatus } : u))
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Users</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.user_id}>
                <td className="px-4 py-2">{user.full_name || '—'}</td>
                <td className="px-4 py-2">{user.email || '—'}</td>
                <td className="px-4 py-2">{user.company_name || '—'}</td>
                <td className="px-4 py-2">{user.is_admin ? 'Admin' : 'User'}</td>
                <td className="px-4 py-2">
                  {user.is_admin ? (
                    <button onClick={() => toggleAdmin(user.user_id, true)} className="text-red-600 hover:underline">Revoke Admin</button>
                  ) : (
                    <button onClick={() => toggleAdmin(user.user_id, false)} className="text-blue-600 hover:underline">Make Admin</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function AnalyticsTab({ stats }: { stats: any }) {
  const data = stats.monthlyRevenue
  const maxRevenue = data.length ? Math.max(...data.map((m: any) => m.revenue)) : 0
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-600" /> Revenue (Last {data.length} Months)
      </h2>
      {data.length > 0 ? (
        <div className="flex items-end space-x-3 h-56 px-2">
          {data.map((m: any) => (
            <div key={m.month} className="relative bg-blue-500" style={{ height: `${maxRevenue ? (m.revenue / maxRevenue) * 100 : 0}%`, width: '16px' }} title={`${m.month}: $${m.revenue.toFixed(2)}` }>
              <span className="absolute bottom-0 text-xs text-white text-center w-full" style={{ transform: 'translateY(100%) rotate(-45deg)' }}>{m.month.slice(2)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Not enough data to display analytics.</p>
      )}
    </div>
  )
}

function SettingsTab() {
  const [health, setHealth] = useState<{ status: string, services: any } | null>(null)
  const [loading, setLoading] = useState(true)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch('/api/health')
        const data = await res.json()
        setHealth(data)
      } catch (error) {
        console.error('Health check failed:', error)
        setHealth(null)
      } finally {
        setLoading(false)
      }
    }
    fetchHealth()
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">System Status</h2>
      {loading ? (
        <p>Checking system health...</p>
      ) : health ? (
        <div>
          <p className={`font-medium mb-4 ${health.status === 'healthy' ? 'text-green-600' : health.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'}`}>Overall Status: {health.status.charAt(0).toUpperCase() + health.status.slice(1)}</p>
          <ul>
            <li>Database: <span className={health.services.database === 'healthy' ? 'text-green-600' : 'text-red-600'}>{health.services.database}</span></li>
            <li>Storage: <span className={health.services.storage === 'healthy' ? 'text-green-600' : 'text-red-600'}>{health.services.storage}</span></li>
            <li>Stripe: <span className={health.services.stripe === 'healthy' ? 'text-green-600' : 'text-red-600'}>{health.services.stripe}</span></li>
            <li>OpenAI: <span className={health.services.openai === 'healthy' ? 'text-green-600' : 'text-red-600'}>{health.services.openai}</span></li>
            <li>Email: <span className={health.services.email === 'healthy' ? 'text-green-600' : 'text-red-600'}>{health.services.email}</span></li>
          </ul>
        </div>
      ) : (
        <p className="text-red-600">Unable to retrieve health status.</p>
      )}
    </div>
  )
}
