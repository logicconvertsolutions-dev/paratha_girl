'use server'

import { stripe }        from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { PRODUCTS, MAX_PER_SLOT } from '@/lib/products'
import { isWithinDeliveryZone }   from '@/lib/distance'
import { sendCustomerOrderEmail, sendAdminOrderEmail } from '@/lib/email'
import type { CheckoutPayload, CreatePaymentIntentResult, CreateCodOrderResult } from '@/types'

export async function createPaymentIntent(
  payload: CheckoutPayload
): Promise<CreatePaymentIntentResult> {

  // ── 1. Validate items ───────────────────────────────────────────────────────
  if (!payload.items.length) throw new Error('Cart is empty.')

  const orderItems = payload.items.map((i) => {
    const product = PRODUCTS.find((p) => p.id === i.product_id)
    if (!product)           throw new Error(`Unknown product: ${i.product_id}`)
    if (!product.available) throw new Error(`${product.name} is unavailable.`)
    if (i.quantity < 1)     throw new Error('Quantity must be at least 1.')
    return { ...product, quantity: i.quantity, subtotal: product.price * i.quantity }
  })

  const totalQty = orderItems.reduce((s, i) => s + i.quantity, 0)

  // ── 2. Delivery zone check ──────────────────────────────────────────────────
  const { valid, distanceKm } = isWithinDeliveryZone(
    payload.delivery_lat ?? 0,
    payload.delivery_lng ?? 0
  )
  if (!valid) {
    throw new Error(
      `Address is ${distanceKm.toFixed(1)}km away — outside our 7km delivery zone.`
    )
  }

  // ── 3. Slot capacity check ──────────────────────────────────────────────────
  let slotId: string | null = null
  if (payload.slot_id) {
    const { data: slot, error: slotErr } = await supabaseAdmin
      .from('delivery_slots')
      .select('id, capacity, booked')
      .eq('id', payload.slot_id)
      .single()

    if (slotErr || !slot) throw new Error('Selected slot not found.')
    if (slot.booked + totalQty > slot.capacity) {
      throw new Error(
        `This slot only has ${slot.capacity - slot.booked} space(s) remaining.`
      )
    }
    slotId = slot.id
  }

  // ── 4. Calculate amount ────────────────────────────────────────────────────
  const amountCents = orderItems.reduce((s, i) => s + i.subtotal * 100, 0)

  // ── 5. Create Stripe Payment Intent ────────────────────────────────────────
  const paymentIntent = await stripe.paymentIntents.create({
    amount:   amountCents,
    currency: 'cad',
    automatic_payment_methods: { enabled: true },
    metadata: {
      slot_id:          slotId || '',
      delivery_address: payload.delivery_address || '',
      items_json:       JSON.stringify(
        orderItems.map((i) => ({ id: i.id, name: i.name, qty: i.quantity, price: i.price }))
      ),
    },
  })

  return {
    clientSecret:    paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
    amount:          amountCents / 100,
  }
}

// ─── COD (Cash on Delivery) Order Creation ──────────────────────────────────
export async function createCodOrder(
  payload: CheckoutPayload
): Promise<CreateCodOrderResult> {
  // ── 1. Validate items ───────────────────────────────────────────────────────
  if (!payload.items.length) throw new Error('Cart is empty.')

  const orderItems = payload.items.map((i) => {
    const product = PRODUCTS.find((p) => p.id === i.product_id)
    if (!product)           throw new Error(`Unknown product: ${i.product_id}`)
    if (!product.available) throw new Error(`${product.name} is unavailable.`)
    if (i.quantity < 1)     throw new Error('Quantity must be at least 1.')
    return { ...product, quantity: i.quantity, subtotal: product.price * i.quantity }
  })

  const totalQty = orderItems.reduce((s, i) => s + i.quantity, 0)
  const totalAmount = orderItems.reduce((s, i) => s + i.subtotal, 0)

  // ── 2. Delivery zone check ──────────────────────────────────────────────────
  if (payload.fulfillment_type === 'delivery') {
    const { valid, distanceKm } = isWithinDeliveryZone(
      payload.delivery_lat ?? 0,
      payload.delivery_lng ?? 0
    )
    if (!valid) {
      throw new Error(
        `Address is ${distanceKm.toFixed(1)}km away — outside our 7km delivery zone.`
      )
    }
  }

  // ── 3. Slot capacity check ──────────────────────────────────────────────────
  let slotId: string | null = null
  if (payload.slot_id) {
    const { data: slot, error: slotErr } = await supabaseAdmin
      .from('delivery_slots')
      .select('id, capacity, booked')
      .eq('id', payload.slot_id)
      .single()

    if (slotErr || !slot) throw new Error('Selected slot not found.')
    if (slot.booked + totalQty > slot.capacity) {
      throw new Error(
        `This slot only has ${slot.capacity - slot.booked} space(s) remaining.`
      )
    }
    slotId = slot.id
  }

  // ── 4. Insert order record ──────────────────────────────────────────────────
  const { data: order, error: insertErr } = await supabaseAdmin
    .from('orders')
    .insert({
      customer_name:    payload.customer_name,
      customer_email:   payload.customer_email,
      customer_phone:   payload.customer_phone,
      fulfillment_type: payload.fulfillment_type,
      delivery_address: payload.delivery_address,
      delivery_lat:     payload.delivery_lat,
      delivery_lng:     payload.delivery_lng,
      scheduled_for:    payload.scheduled_for,
      payment_method:   'cod',
      status:           'pending',
      total_amount:     totalAmount,
      items:            orderItems.map((i) => ({
        product_id: i.id,
        product_name: i.name,
        quantity: i.quantity,
        unit_price: i.price,
        subtotal: i.subtotal,
      })),
      notes:            payload.notes || null,
    })
    .select()
    .single()

  if (insertErr || !order) {
    throw new Error(`Failed to create COD order: ${insertErr?.message || 'Unknown error'}`)
  }

  // ── 5. Increment slot booked count atomically (if slot was specified) ─────
  if (slotId) {
    const { error: incrementErr } = await supabaseAdmin.rpc('increment_slot_booked', {
      p_slot_id: slotId,
      p_quantity: totalQty,
    })

    if (incrementErr) {
      // Rollback: delete the order we just created
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      throw new Error(`Failed to reserve slot: ${incrementErr.message}`)
    }
  }

  // ── 6. Send confirmation emails (non-blocking) ───────────────────────────
  Promise.all([
    sendCustomerOrderEmail(order),
    sendAdminOrderEmail(order),
  ]).catch((err) => {
    console.error('Failed to send order emails:', err)
  })

  return {
    orderId: order.id,
    amount: totalAmount,
  }
}
