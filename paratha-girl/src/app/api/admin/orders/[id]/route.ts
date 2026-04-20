import { NextRequest, NextResponse } from 'next/server'
import { cookies }       from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'
import { sendOrderConfirmedEmail } from '@/lib/email'
import type { OrderStatus, Order } from '@/types'

const VALID_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled',
]

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Auth check
  const cookieStore: any = cookies()
  const adminCookie = cookieStore.get ? await cookieStore.get('admin_authed') : cookieStore.get?.('admin_authed')
  if (adminCookie?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { status } = await req.json()
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch the updated order
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  // Send confirmation email if status changed to 'confirmed'
  if (status === 'confirmed' && order) {
    sendOrderConfirmedEmail(order as Order).catch((err) => {
      console.error('Failed to send confirmation email:', err)
    })
  }

  return NextResponse.json({ success: true, status })
}
