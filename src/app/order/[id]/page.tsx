import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { supabaseAdmin } from '@/lib/supabase'
import type { OrderStatus } from '@/types'
import Link from 'next/link'

const STATUS_STEPS: { value: OrderStatus; label: string; description: string }[] = [
  { value: 'pending', label: 'Pending', description: 'Order received' },
  { value: 'confirmed', label: 'Confirmed', description: 'Order confirmed' },
  { value: 'preparing', label: 'Preparing', description: 'Cooking your parathas' },
  { value: 'out_for_delivery', label: 'Out for Delivery', description: 'On the way' },
  { value: 'delivered', label: 'Delivered', description: 'Enjoy!' },
]

const getStatusLabel = (status: OrderStatus, fulfillmentType?: string): string => {
  if (status === 'out_for_delivery' && fulfillmentType === 'pickup') {
    return 'Ready to Pick Up'
  }
  const labels: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    out_for_delivery: 'Out for Delivery',
    delivered: fulfillmentType === 'pickup' ? 'Ready for Pickup' : 'Delivered',
    cancelled: 'Cancelled',
  }
  return labels[status]
}

const getStatusDescription = (status: OrderStatus, fulfillmentType?: string): string => {
  if (status === 'out_for_delivery' && fulfillmentType === 'pickup') {
    return 'Your order is ready!'
  }
  if (status === 'delivered' && fulfillmentType === 'pickup') {
    return 'Pick up anytime'
  }
  const descriptions: Record<OrderStatus, string> = {
    pending: 'Order received',
    confirmed: 'Order confirmed',
    preparing: 'Cooking your parathas',
    out_for_delivery: 'On the way',
    delivered: 'Enjoy!',
    cancelled: 'Order cancelled',
  }
  return descriptions[status]
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !order) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-ink text-ivory flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <p className="text-[10px] tracking-[.4em] uppercase text-spice font-medium mb-3">
              Order Not Found
            </p>
            <h1 className="font-serif text-[32px] text-ivory mb-4">
              We couldn&rsquo;t find this order.
            </h1>
            <p className="text-[13px] text-ivory/60 mb-8">
              Please check the order number and try again.
            </p>
            <Link
              href="/"
              className="inline-flex px-6 py-3 border border-ivory/20 text-[10px] tracking-[.28em] uppercase text-ivory/70 hover:border-gold/60 hover:text-gold transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const items = (order.items as any[]) || []
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.value === order.status)
  const isDelivery = order.fulfillment_type === 'delivery'
  const isCOD = order.payment_method === 'cod'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-ink text-ivory">
        {/* Header */}
        <section className="px-6 py-12 md:py-16 border-b border-ivory/10">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <p className="text-[10px] tracking-[.4em] uppercase text-gold font-medium mb-3">
                Order Tracking
              </p>
              <h1 className="font-serif text-[42px] md:text-[52px] text-ivory leading-tight">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-[9px] tracking-[.4em] uppercase text-ivory/50 mb-2">Status</p>
                <p className="text-[14px] text-gold font-medium capitalize">
                  {getStatusLabel(order.status, order.fulfillment_type)}
                </p>
              </div>
              <div>
                <p className="text-[9px] tracking-[.4em] uppercase text-ivory/50 mb-2">
                  {isDelivery ? 'Delivery' : 'Pickup'}
                </p>
                <p className="text-[14px] text-ivory/80">
                  {new Date(order.created_at).toLocaleDateString('en-CA', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-[9px] tracking-[.4em] uppercase text-ivory/50 mb-2">Total</p>
                <p className="text-[14px] font-serif bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(120deg, #F3D488 0%, #D4A84B 50%, #B8882A 100%)',
                }}>
                  ${(order.total_amount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Status Timeline */}
        <section className="px-6 py-12 md:py-16 border-b border-ivory/10">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Progress bar */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-ivory/10" />
              <div
                className="absolute left-4 top-0 w-px transition-all duration-500"
                style={{
                  background: 'linear-gradient(180deg, #D4A84B 0%, #B8882A 100%)',
                  height: `${((currentStepIndex + 1) / STATUS_STEPS.length) * 100}%`,
                }}
              />

              {/* Steps */}
              <div className="space-y-8">
                {STATUS_STEPS.map((step, index) => {
                  const isComplete = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex

                  return (
                    <div key={step.value} className="flex gap-6 relative">
                      {/* Dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className={[
                            'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative z-10',
                            isComplete
                              ? 'bg-gold/20 border-gold'
                              : 'bg-ink border-ivory/20',
                          ].join(' ')}
                        >
                          {isComplete && (
                            <svg
                              width="16"
                              height="12"
                              viewBox="0 0 16 12"
                              fill="none"
                              className="text-gold"
                            >
                              <path
                                d="M2 6L6 10L14 2"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                          {isCurrent && !isComplete && (
                            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <p
                          className={[
                            'text-[12px] tracking-[.28em] uppercase font-medium transition-colors duration-500',
                            isComplete ? 'text-gold' : 'text-ivory/40',
                          ].join(' ')}
                        >
                          {getStatusLabel(step.value, order.fulfillment_type)}
                        </p>
                        <p className={['text-[13px] mt-1', isComplete ? 'text-ivory/70' : 'text-ivory/30'].join(' ')}>
                          {getStatusDescription(step.value, order.fulfillment_type)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Order Details */}
        <section className="px-6 py-12 md:py-16 border-b border-ivory/10">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-[28px] text-ivory mb-8">Order Details</h2>

            {/* Items */}
            <div className="mb-8">
              <p className="text-[10px] tracking-[.4em] uppercase text-ivory/40 mb-4">Items</p>
              <div className="space-y-3 bg-ivory/[0.02] border border-ivory/10 rounded p-6">
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[13px]">
                      <div>
                        <p className="text-ivory font-medium">{item.product_name}</p>
                        <p className="text-ivory/50 text-[11px]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-gold font-medium">${(item.subtotal || 0).toFixed(2)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-ivory/40">No items in order</p>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-[10px] tracking-[.4em] uppercase text-ivory/40 mb-2">Customer</p>
                <div className="bg-ivory/[0.02] border border-ivory/10 rounded p-4">
                  <p className="text-ivory text-[13px] mb-1">{order.customer_name}</p>
                  <p className="text-ivory/50 text-[12px]">{order.customer_email}</p>
                  <p className="text-ivory/50 text-[12px]">{order.customer_phone}</p>
                </div>
              </div>

              {isDelivery && (
                <div>
                  <p className="text-[10px] tracking-[.4em] uppercase text-ivory/40 mb-2">
                    Delivery Address
                  </p>
                  <div className="bg-ivory/[0.02] border border-ivory/10 rounded p-4">
                    <p className="text-ivory text-[13px]">{order.delivery_address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <p className="text-[10px] tracking-[.4em] uppercase text-ivory/40 mb-2">Payment Method</p>
              <div className="bg-ivory/[0.02] border border-ivory/10 rounded p-4">
                <p className="text-ivory text-[13px] capitalize">
                  {isCOD ? 'Cash on Delivery' : 'Credit Card (Stripe)'}
                </p>
                {isCOD && (
                  <p className="text-ivory/50 text-[11px] mt-2">
                    Please have cash ready for payment upon {isDelivery ? 'delivery' : 'pickup'}.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-ivory/60 text-[13px] mb-6">
              {isDelivery
                ? 'We will call you to confirm delivery timing.'
                : 'Your order is ready for pickup at our kitchen!'}
            </p>
            <Link
              href="/"
              className="inline-flex px-6 py-3 border border-ivory/20 text-[10px] tracking-[.28em] uppercase text-ivory/70 hover:border-gold/60 hover:text-gold transition-colors"
            >
              Back to Menu
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
