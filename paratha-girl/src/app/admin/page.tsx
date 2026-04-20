import { redirect }      from 'next/navigation'
import { cookies }       from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import type { Order }    from '@/types'

export default async function AdminPage() {
  // Simple cookie-based auth — replace with Supabase Auth for production
  const cookieStore: any = cookies()
  const adminCookie = cookieStore.get ? await cookieStore.get('admin_authed') : cookieStore.get?.('admin_authed')
  const authed = adminCookie?.value === 'true'
  if (!authed) redirect('/admin/login')

  // Fetch today's orders
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('*')
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })

  return <AdminDashboard orders={(orders ?? []) as Order[]} />
}
