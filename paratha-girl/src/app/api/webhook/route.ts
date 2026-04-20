import { NextRequest, NextResponse } from 'next/server'
import { stripe }        from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { sendCustomerOrderEmail, sendAdminOrderEmail, sendOrderConfirmedEmail } from '@/lib/email'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi       = event.data.object as Stripe.PaymentIntent
    const metadata = pi.metadata

    const items: Array<{
      product_id:   number
      product_name: string
      quantity:     number
      unit_price:   number
      subtotal:     number
    }> = JSON.parse(metadata.items_json ?? '[]').map(
      (i: { id: number; name: string; qty: number; price: number }) => ({
        product_id:   i.id,
        product_name: i.name,
        quantity:     i.qty,
        unit_price:   i.price,
        subtotal:     i.price * i.qty,
      })
    )

    const totalQty = items.reduce((s, i) => s + i.quantity, 0)

    // ── Insert order ──────────────────────────────────────────────────────────
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name:           pi.metadata.customer_name ?? '',
        customer_email:          pi.receipt_email ?? '',
        delivery_address:        metadata.delivery_address,
        slot_id:                 metadata.slot_id,
        items,
        total_amount:            pi.amount / 100,
        status:                  'confirmed',
        stripe_payment_intent_id: pi.id,
        stripe_payment_status:   pi.status,
      })
      .select()
      .single()

    if (orderErr) {
      console.error('Failed to insert order:', orderErr)
      return NextResponse.json({ error: 'DB insert failed' }, { status: 500 })
    }

    // ── Increment slot booked count ───────────────────────────────────────────
    await supabaseAdmin.rpc('increment_slot_booked', {
      p_slot_id: metadata.slot_id,
      p_amount:  totalQty,
    })

    // ── Send confirmation emails (non-blocking) ──────────────────────────────
    Promise.all([
      sendCustomerOrderEmail(order),
      sendAdminOrderEmail(order),
      sendOrderConfirmedEmail(order),
    ]).catch((err) => {
      console.error('Failed to send order emails:', err)
    })
  }

  return NextResponse.json({ received: true })
}
