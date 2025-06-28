import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')
  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  const { data: profile } = await admin
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', userId)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [usersRes, ordersRes, productsRes] = await Promise.all([
    admin.from('auth.users').select('id', { count: 'exact', head: true }),
    admin.from('orders').select('amount', { count: 'exact' }),
    admin.from('products').select('id', { count: 'exact' }).eq('is_active', true)
  ])

  const totalRevenue =
    ordersRes.data?.reduce((sum: number, o: any) => sum + Number(o.amount), 0) ||
    0

  return NextResponse.json({
    totalUsers: usersRes.count || 0,
    totalOrders: ordersRes.count || 0,
    totalRevenue,
    activeProducts: productsRes.count || 0
  })
}
