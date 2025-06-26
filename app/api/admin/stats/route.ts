import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabase.from('user_profiles').select('is_admin').eq('user_id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const [usersRes, ordersRes, productsRes, ticketsRes] = await Promise.all([
    admin.from('user_profiles').select('id', { count: 'exact', head: true }),
    admin.from('orders').select('id, amount, created_at', { count: 'exact' }),
    admin.from('products').select('id', { count: 'exact' }).eq('is_active', true),
    admin.from('support_tickets').select('id', { count: 'exact' }).eq('status', 'open')
  ])
  const totalRevenue = ordersRes.data?.reduce((sum: number, o: any) => sum + o.amount, 0) || 0
  const revenueByMonth: Record<string, number> = {}
  ;(ordersRes.data || []).forEach((o: any) => {
    const month = o.created_at.slice(0,7)
    revenueByMonth[month] = (revenueByMonth[month] || 0) + o.amount
  })
  const months = Object.keys(revenueByMonth).sort().slice(-12)
  const monthlyRevenue = months.map(m => ({ month: m, revenue: revenueByMonth[m] }))

  return NextResponse.json({
    totalUsers: usersRes.count || 0,
    totalOrders: ordersRes.count || 0,
    totalRevenue,
    activeProducts: productsRes.count || 0,
    pendingTickets: ticketsRes.count || 0,
    monthlyRevenue
  })
}
