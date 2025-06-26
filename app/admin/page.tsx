import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import AdminDashboard from '../../components/AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()
  if (!profile?.is_admin) {
    redirect('/dashboard')
  }
  return <AdminDashboard />
}
