import { createServerSupabaseClient, getUser } from '@/lib/supabase-auth-helpers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign,
  Package,
  Users,
  Download,
  FileText,
  Bell,
  BarChart3
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const profileCache = new Map<string, { data: any; timestamp: number }>();

async function fetchProfile(supabase: ReturnType<typeof createServerSupabaseClient>, userId: string) {
  const cached = profileCache.get(userId);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data;
  }
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (data) {
    profileCache.set(userId, { data, timestamp: Date.now() });
  }
  return data;
}

async function getDashboardData() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  const supabase = createServerSupabaseClient();

  const profilePromise = fetchProfile(supabase, user.id);

  const [ordersRes, downloadsRes, analysesRes, ticketsRes] =
    await Promise.allSettled([
      supabase
        .from('orders')
        .select(`
          *,
          products (
            name,
            price,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('downloads')
        .select(`
          *,
          product_files (
            file_name,
            product_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('roof_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);
  const profile = await profilePromise;
  const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.data : null;
  const downloads = downloadsRes.status === 'fulfilled' ? downloadsRes.value.data : null;
  const analyses = analysesRes.status === 'fulfilled' ? analysesRes.value.data : null;
  const tickets = ticketsRes.status === 'fulfilled' ? ticketsRes.value.data : null;

  // Calculate analytics
  const totalSpent = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
  const totalDownloads = downloads?.length || 0;
  const activeTickets = tickets?.filter(t => t.status !== 'closed').length || 0;

  // Get monthly spending for chart
  const monthlySpending = calculateMonthlySpending(orders || []);

  // Get category breakdown
  const categoryBreakdown = calculateCategoryBreakdown(orders || []);

  return {
    user,
    profile,
    orders: orders || [],
    downloads: downloads || [],
    analyses: analyses || [],
    tickets: tickets || [],
    stats: {
      totalSpent,
      totalOrders: orders?.length || 0,
      totalDownloads,
      activeTickets,
      averageOrderValue: orders?.length ? totalSpent / orders.length : 0
    },
    charts: {
      monthlySpending,
      categoryBreakdown
    }
  };
}

interface OrderData {
  amount: number;
  created_at: string;
  products?: { category?: string } | null;
}

function calculateMonthlySpending(orders: OrderData[]) {
  const months = {};
  const now = new Date();

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toISOString().slice(0, 7);
    months[key] = 0;
  }

  // Sum spending by month
  orders.forEach(order => {
    const month = order.created_at.slice(0, 7);
    if (months[month] !== undefined) {
      months[month] += order.amount;
    }
  });

  return Object.entries(months).map(([month, amount]) => ({
    month,
    amount
  }));
}

function calculateCategoryBreakdown(orders: OrderData[]) {
  const categories = {};

  orders.forEach(order => {
    const category = order.products?.category || 'Other';
    categories[category] = (categories[category] || 0) + order.amount;
  });

  return Object.entries(categories).map(([category, amount]) => ({
    category,
    amount
  }));
}

export default async function Dashboard() {
  const data = await getDashboardData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {data.profile?.company_name || data.user.email}
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/estimator"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                New Estimate
              </Link>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold mt-1">
                  ${data.stats.totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{data.stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-2xl font-bold mt-1">{data.stats.totalDownloads}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Analyses</p>
                <p className="text-2xl font-bold mt-1">{data.analyses.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tickets</p>
                <p className="text-2xl font-bold mt-1">{data.stats.activeTickets}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Recent Orders</h2>
                  <Link
                    href="/orders"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {data.orders.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No orders yet.
                    <Link href="/marketplace" className="text-blue-600 hover:underline ml-1">
                      Browse marketplace
                    </Link>
                  </p>
                ) : (
                  <div className="space-y-4">
                    {data.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{order.products?.name}</p>
                          <p className="text-sm text-gray-600">
                            Order #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${order.amount.toFixed(2)}</p>
                          <span className={`
                            text-sm px-2 py-1 rounded
                            ${order.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }
                          `}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Spending Chart */}
            <div className="bg-white rounded-lg shadow mt-8">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Monthly Spending
                </h2>
              </div>
              <div className="p-6">
                <div className="h-64">
                  {/* In production, use a proper charting library like recharts */}
                  <div className="flex items-end justify-between h-full">
                    {data.charts.monthlySpending.map((month, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full max-w-12 bg-blue-500 rounded-t"
                          style={{
                            height: `${((month.amount as number) / Math.max(...data.charts.monthlySpending.map(m => m.amount as number)) * 100) || 10}%`
                          }}
                        />
                        <p className="text-xs text-gray-600 mt-2">
                          {new Date(month.month).toLocaleDateString('en', { month: 'short' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Downloads */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Recent Downloads</h2>
              </div>
              <div className="p-6">
                {data.downloads.length === 0 ? (
                  <p className="text-gray-600 text-sm">No downloads yet</p>
                ) : (
                  <div className="space-y-3">
                    {data.downloads.slice(0, 5).map((download) => (
                      <div key={download.id} className="flex items-center gap-3">
                        <Download className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {download.product_files?.file_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(download.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent AI Analyses */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Recent Analyses</h2>
              </div>
              <div className="p-6">
                {data.analyses.length === 0 ? (
                  <p className="text-gray-600 text-sm">
                    No analyses yet.
                    <Link href="/estimator" className="text-blue-600 hover:underline ml-1">
                      Try AI estimator
                    </Link>
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.analyses.map((analysis) => (
                      <div key={analysis.id} className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {analysis.analysis_type} Analysis
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Confidence: {(analysis.confidence_score * 100).toFixed(0)}%
                          </p>
                        </div>
                        <Link
                          href={`/analysis/${analysis.id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Support Tickets */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Support Tickets</h2>
              </div>
              <div className="p-6">
                {data.tickets.length === 0 ? (
                  <p className="text-gray-600 text-sm">No support tickets</p>
                ) : (
                  <div className="space-y-3">
                    {data.tickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-start gap-3">
                        <div className={`
                          w-2 h-2 rounded-full mt-1.5
                          ${ticket.status === 'open' ? 'bg-red-500' :
                            ticket.status === 'in_progress' ? 'bg-yellow-500' :
                            'bg-green-500'}
                        `} />
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">
                            {ticket.subject}
                          </p>
                          <p className="text-xs text-gray-500">
                            {ticket.status} • {new Date(ticket.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          href={`/support/${ticket.id}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Banner */}
        {data.profile?.subscription_tier === 'free' && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
            <div className="max-w-3xl">
              <h3 className="text-2xl font-bold mb-2">Upgrade to Pro</h3>
              <p className="text-blue-100 mb-4">
                Get unlimited AI analyses, priority support, and exclusive templates
              </p>
              <Link
                href="/pricing"
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 font-semibold"
              >
                View Plans
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
