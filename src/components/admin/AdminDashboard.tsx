'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminLogout } from '@/app/admin/actions'
import { Logo } from '@/components/ui/Logo'
import { ReviewsManager } from '@/components/admin/ReviewsManager'
import type { Order, OrderStatus } from '@/types'

interface Props { orders: Order[] }

const STATUS_CYCLE: Record<OrderStatus, OrderStatus> = {
  pending:          'confirmed',
  confirmed:        'preparing',
  preparing:        'out_for_delivery',
  out_for_delivery: 'delivered',
  delivered:        'delivered',
  cancelled:        'cancelled',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:          'Pending',
  confirmed:        'Confirmed',
  preparing:        'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
}

const getStatusLabel = (status: OrderStatus, fulfillmentType?: string): string => {
  if (status === 'out_for_delivery' && fulfillmentType === 'pickup') {
    return 'Ready to Pick Up'
  }
  return STATUS_LABELS[status]
}

const STATUS_TONE: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  pending:          { bg: 'rgba(212,168,75,0.10)', text: '#D4A84B', dot: '#D4A84B' },
  confirmed:        { bg: 'rgba(58,107,83,0.14)',  text: '#3A6B53', dot: '#3A6B53' },
  preparing:        { bg: 'rgba(196,80,26,0.12)',  text: '#C4501A', dot: '#C4501A' },
  out_for_delivery: { bg: 'rgba(96,165,250,0.12)', text: '#6FAEF5', dot: '#6FAEF5' },
  delivered:        { bg: 'rgba(111,207,151,0.12)',text: '#6FCF97', dot: '#6FCF97' },
  cancelled:        { bg: 'rgba(249,244,236,0.06)',text: '#6B5C45', dot: '#6B5C45' },
}

export function AdminDashboard({ orders: initialOrders }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  const activeOrders = orders.filter((o) => o.status !== 'cancelled')
  const todayRevenue = activeOrders.reduce((s, o) => s + o.total_amount, 0)
  const byStatus = (s: OrderStatus) => orders.filter((o) => o.status === s).length

  const advanceStatus = async (orderId: string, current: OrderStatus) => {
    const next = STATUS_CYCLE[current]
    if (next === current) return

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: next }),
    })

    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: next } : o))
      )
    }
  }

  const stats = [
    { label: 'Total Orders',  value: String(orders.length),             detail: 'Today' },
    { label: 'Revenue',       value: `$${todayRevenue.toFixed(0)}`,     detail: 'CAD, today' },
    { label: 'Queued',        value: String(byStatus('pending') + byStatus('confirmed')), detail: 'Awaiting prep' },
    { label: 'In Motion',     value: String(byStatus('preparing') + byStatus('out_for_delivery')), detail: 'Prep · delivery' },
  ]

  return (
    <div
      className="min-h-screen text-ivory relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1A1208 0%, #0F0A03 100%)' }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-[0.12] blur-[140px]"
        style={{ background: 'radial-gradient(closest-side, #D4A84B 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-[0.18] blur-[140px]"
        style={{ background: 'radial-gradient(closest-side, #2D5241 0%, transparent 70%)' }}
      />

      <GrainOverlay />

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header
        className="relative z-10 flex items-center justify-between px-8 md:px-[60px] py-5"
        style={{
          background: 'rgba(26,18,8,0.5)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(212,168,75,0.18)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="flex items-center gap-4">
          <Logo size={64} />
          <div className="leading-tight">
            <p className="font-serif text-[20px] text-ivory">
              Paratha <span className="italic text-gold">Girl</span>
            </p>
            <p className="text-[9px] tracking-[.38em] uppercase text-ivory/50 mt-1">
              Fresh · Flaky · Famous
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 border border-gold/25 text-[10px] tracking-[.25em] uppercase text-ivory/70"
            style={{ background: 'rgba(26,18,8,0.5)' }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-gold opacity-70 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold" />
            </span>
            Live
          </div>
          <a
            href="/"
            className="group hidden sm:inline-flex items-center gap-2 text-[10px] tracking-[.28em] uppercase text-ivory/60 hover:text-gold transition-colors border border-ivory/15 hover:border-gold/50 px-5 py-2 duration-300"
          >
            <span className="text-[13px] leading-none transition-transform duration-300 group-hover:-translate-x-[2px]">←</span>
            Site
          </a>
          <form action={adminLogout}>
            <button
              type="submit"
              className="text-[10px] tracking-[.28em] uppercase text-ivory/60 hover:text-gold transition-colors border border-ivory/15 hover:border-gold/50 px-5 py-2 duration-300"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-[60px] py-14">
        {/* ── Title ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div className="flex items-center gap-4 mb-5">
            <span className="text-[10px] tracking-[.4em] uppercase text-gold font-medium">
              Today&rsquo;s Orders
            </span>
            <span className="flex-1 h-px bg-gradient-to-r from-gold/50 via-gold/15 to-transparent max-w-[300px]" />
            <span className="text-[10px] tracking-[.3em] uppercase text-ivory/35">
              {new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h1 className="font-serif text-[clamp(42px,5.5vw,76px)] font-normal leading-[.95] text-ivory tracking-[-0.02em]">
            The{' '}
            <em
              className="italic bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(120deg, #F3D488 0%, #D4A84B 50%, #B8882A 100%)',
              }}
            >
              line
            </em>
            .
          </h1>
        </motion.div>

        {/* ── Stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
              className="relative p-6 border border-ivory/10 overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, rgba(249,244,236,0.04) 0%, rgba(249,244,236,0.01) 100%)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span className="absolute top-0 left-0 w-6 h-px bg-gold/50" />
              <span className="absolute top-0 left-0 h-6 w-px bg-gold/50" />

              <p
                className="font-serif text-[44px] leading-none font-normal bg-clip-text text-transparent mb-3 tracking-[-0.02em]"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #F3D488 0%, #D4A84B 50%, #B8882A 100%)',
                }}
              >
                {stat.value}
              </p>
              <p className="text-[10px] tracking-[.28em] uppercase text-ivory/70 font-medium mb-1">
                {stat.label}
              </p>
              <p className="text-[10px] text-ivory/35 tracking-[.04em]">
                {stat.detail}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Orders Table ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative border border-ivory/10 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(249,244,236,0.035) 0%, rgba(249,244,236,0.01) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Table header */}
          <div className="grid grid-cols-[90px_1fr_180px_140px_120px_120px_170px] px-6 py-4 border-b border-ivory/10"
            style={{ background: 'rgba(26,18,8,0.4)' }}
          >
            {['ID', 'Customer', 'Items', 'Slot', 'Total', 'Type', 'Status'].map((h) => (
              <span key={h} className="text-[9px] tracking-[.35em] uppercase text-gold/70 font-medium">
                {h}
              </span>
            ))}
          </div>

          <AnimatePresence mode="popLayout">
            {orders.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="font-serif italic text-[26px] text-ivory/50 mb-2">
                  No orders yet.
                </p>
                <p className="text-[10px] tracking-[.35em] uppercase text-ivory/30">
                  The kitchen is open · waiting on the first box
                </p>
              </motion.div>
            ) : (
              orders.map((order, i) => {
                const tone = STATUS_TONE[order.status]
                const isDone = order.status === 'delivered' || order.status === 'cancelled'
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.03 }}
                    className="grid grid-cols-[90px_1fr_180px_140px_120px_120px_170px] px-6 py-5 border-b border-ivory/06 items-center group hover:bg-ivory/[0.02] transition-colors duration-200"
                  >
                    {/* ID */}
                    <span className="font-mono text-[10px] text-gold/80 tracking-wider">
                      #{order.id.slice(0, 6).toUpperCase()}
                    </span>

                    {/* Customer */}
                    <div>
                      <p className="font-serif text-[15px] text-ivory leading-tight">
                        {order.customer_name || <span className="italic text-ivory/35">No name</span>}
                      </p>
                      <p className="text-[11px] text-ivory/45 mt-0.5">
                        {order.customer_email || '—'}
                      </p>
                    </div>

                    {/* Items */}
                    <p className="text-[11.5px] text-ivory/60 leading-[1.6] font-light">
                      {order.items.map((i) => `${i.quantity}× ${i.product_name.split(' ')[0]}`).join(', ')}
                    </p>

                    {/* Slot */}
                    <p className="text-[11.5px] text-ivory/65 tracking-[.03em]">
                      {order.slot_label ?? <span className="italic text-ivory/30">—</span>}
                    </p>

                    {/* Total */}
                    <p
                      className="font-serif text-[20px] leading-none font-normal bg-clip-text text-transparent"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, #F3D488 0%, #D4A84B 60%, #B8882A 100%)',
                      }}
                    >
                      ${order.total_amount.toFixed(0)}
                    </p>

                    {/* Fulfillment Type */}
                    <p className="text-[10px] uppercase tracking-[.28em] font-medium" style={{ color: order.fulfillment_type === 'pickup' ? '#3A6B53' : '#6FAEF5' }}>
                      {order.fulfillment_type === 'pickup' ? '🏪 Pickup' : '🚗 Delivery'}
                    </p>

                    {/* Status */}
                    <button
                      onClick={() => advanceStatus(order.id, order.status)}
                      disabled={isDone}
                      title={
                        !isDone
                          ? `Click to advance → ${getStatusLabel(STATUS_CYCLE[order.status], order.fulfillment_type)}`
                          : undefined
                      }
                      className="inline-flex items-center gap-2 px-3 py-2 border text-[9px] tracking-[.25em] uppercase font-medium disabled:cursor-default transition-all duration-300 hover:scale-[1.03]"
                      style={{
                        background: tone.bg,
                        color: tone.text,
                        borderColor: tone.text + '40',
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: tone.dot, boxShadow: `0 0 6px ${tone.dot}80` }}
                      />
                      {getStatusLabel(order.status, order.fulfillment_type)}
                    </button>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-[10px] tracking-[.25em] uppercase text-ivory/35 mt-5">
          Click any status pill to advance the order to the next stage
        </p>

        {/* ── Reviews Manager ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 relative border border-ivory/10 p-8 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(249,244,236,0.035) 0%, rgba(249,244,236,0.01) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] tracking-[.4em] uppercase text-gold font-medium">
              Testimonials
            </span>
            <span className="flex-1 h-px bg-gradient-to-r from-gold/50 via-gold/15 to-transparent max-w-[300px]" />
          </div>
          <div className="text-ivory">
            <ReviewsManager />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════

function GrainOverlay() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 w-full h-full opacity-[0.1] mix-blend-overlay z-0"
    >
      <filter id="admin-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#admin-grain)" />
    </svg>
  )
}
