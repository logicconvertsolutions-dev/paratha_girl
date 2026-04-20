import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { MAX_PER_SLOT }  from '@/lib/products'
import type { DeliverySlot } from '@/types'

export const revalidate = 0

export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get('date')

  let dayStart: Date
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    dayStart = new Date(dateParam + 'T00:00:00')
  } else {
    dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)
  }

  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  const { data, error } = await supabaseAdmin
    .from('delivery_slots')
    .select('id, label, start_time, capacity, booked')
    .gte('start_time', dayStart.toISOString())
    .lt('start_time',  dayEnd.toISOString())
    .order('start_time', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const slots: DeliverySlot[] = (data ?? []).map((row) => ({
    id:         row.id,
    label:      row.label,
    start_time: row.start_time,
    capacity:   row.capacity ?? MAX_PER_SLOT,
    booked:     row.booked   ?? 0,
    available:  (row.booked ?? 0) < (row.capacity ?? MAX_PER_SLOT),
  }))

  return NextResponse.json({ slots })
}
