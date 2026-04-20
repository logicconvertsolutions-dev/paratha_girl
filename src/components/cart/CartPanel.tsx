'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cart'
import { AddressChecker } from './AddressChecker'
import { createPaymentIntent, createCodOrder } from '@/app/api/checkout/actions'
import { lineTotal } from '@/types'
import type { FulfillmentType, PaymentMethod } from '@/types'

type ScheduleMode = 'asap' | 'later'

export function CartPanel() {
  const [open,     setOpen]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Fulfillment
  const [fulfillment, setFulfillment] = useState<FulfillmentType>('delivery')
  const [addressOk,   setAddressOk]   = useState(false)
  const [address,     setAddress]     = useState('')
  const [addrCoords,  setAddrCoords]  = useState<{ lat: number; lng: number } | null>(null)

  // Schedule
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('asap')
  const [scheduledAt,  setScheduledAt]  = useState('') // datetime-local value

  // Customer details
  const [name,  setName]  = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')

  // Payment
  const [payment, setPayment] = useState<PaymentMethod>('cod')

  const { items, removeItem, updateQty, total, totalItems, clearCart, hydrated } = useCartStore()

  useEffect(() => {
    setIsMounted(true)
    useCartStore.persist.rehydrate()
  }, [])

  useEffect(() => {
    const openFn = () => setOpen(true)
    window.addEventListener('open-cart', openFn)
    return () => window.removeEventListener('open-cart', openFn)
  }, [])

  // datetime-local needs a local-timezone minimum
  const minScheduleValue = useMemo(() => {
    const d = new Date()
    d.setMinutes(d.getMinutes() + 20) // at least 20 min out
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }, [])

  const resetForm = () => {
    clearCart()
    setName(''); setPhone(''); setEmail(''); setNotes('')
    setAddress(''); setAddressOk(false); setAddrCoords(null)
    setScheduleMode('asap'); setScheduledAt('')
  }

  const validate = (): string | null => {
    if (!items.length)               return 'Add some parathas first.'
    if (!name.trim())                return 'Please enter your name.'
    if (!phone.trim())               return 'Please enter your phone number.'
    if (!email.trim() || !email.includes('@')) return 'Please enter a valid email.'
    if (fulfillment === 'delivery' && (!addressOk || !addrCoords)) {
      return 'Please verify your delivery address.'
    }
    if (scheduleMode === 'later') {
      if (!scheduledAt) return 'Pick a date and time, or switch to ASAP.'
      const when = new Date(scheduledAt)
      if (isNaN(when.getTime())) return 'Invalid scheduled time.'
      if (when.getTime() < Date.now() + 10 * 60 * 1000) {
        return 'Scheduled time must be at least 10 minutes from now.'
      }
    }
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true); setError(null)

    const payload = {
      items: items.map((i) => ({
        product_id: i.product.id,
        quantity:   i.quantity,
        sides:      i.sides,
        extras:     i.extras,
      })),
      customer_name:    name.trim(),
      customer_email:   email.trim(),
      customer_phone:   phone.trim(),
      fulfillment_type: fulfillment,
      delivery_address: fulfillment === 'delivery' ? address : null,
      delivery_lat:     fulfillment === 'delivery' && addrCoords ? addrCoords.lat : null,
      delivery_lng:     fulfillment === 'delivery' && addrCoords ? addrCoords.lng : null,
      scheduled_for:    scheduleMode === 'later' && scheduledAt
        ? new Date(scheduledAt).toISOString()
        : null,
      payment_method:   payment,
      notes:            notes.trim() || undefined,
    }

    try {
      if (payment === 'cod') {
        const result = await createCodOrder(payload)
        setSuccessId(result.orderId)
        resetForm()
      } else {
        const result = await createPaymentIntent(payload)
        window.location.href = `/checkout?client_secret=${result.clientSecret}&amount=${result.amount}`
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const count = isMounted && hydrated ? totalItems() : 0
  const grandTotal = isMounted && hydrated ? total() : 0

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200]"
            style={{
              background: 'radial-gradient(ellipse at 70% 50%, rgba(26,18,8,0.78) 0%, rgba(10,6,0,0.85) 100%)',
              backdropFilter: 'blur(6px)',
            }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 34 }}
            className="fixed right-0 top-0 bottom-0 z-[201] w-full md:w-[520px] flex flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1A1208 0%, #0F0A03 100%)',
              borderLeft: '1px solid rgba(212,168,75,0.18)',
              boxShadow: '-40px 0 80px -20px rgba(0,0,0,0.6)',
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full opacity-[0.18] blur-[100px]"
              style={{ background: 'radial-gradient(closest-side, #D4A84B 0%, transparent 70%)' }}
            />
            <GrainOverlay />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="relative px-8 pt-9 pb-6 border-b border-ivory/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] tracking-[.4em] uppercase text-gold font-medium mb-3">
                    Checkout
                  </p>
                  <h2 className="font-serif text-[34px] font-normal text-ivory leading-none tracking-[-0.01em]">
                    Your{' '}
                    <em
                      className="italic bg-clip-text text-transparent"
                      style={{ backgroundImage: 'linear-gradient(120deg, #F3D488 0%, #D4A84B 50%, #B8882A 100%)' }}
                    >
                      Box
                    </em>
                  </h2>
                  <p className="text-[11px] text-ivory/50 mt-2 tracking-[.12em]">
                    {count} {count === 1 ? 'piece' : 'pieces'} · ${grandTotal.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="w-10 h-10 flex items-center justify-center border border-ivory/15 text-ivory/60 hover:text-gold hover:border-gold/50 transition-all duration-300 group"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" className="transition-transform duration-300 group-hover:rotate-90">
                    <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Body ─────────────────────────────────────────────────── */}
            <div className="relative flex-1 overflow-y-auto cart-scroll">
              {successId ? (
                <SuccessView orderId={successId} onNew={() => { setSuccessId(null) }} />
              ) : (
                <>
                  {/* Items */}
                  <div className="px-8 py-6">
                    <SectionLabel>Selection</SectionLabel>

                    {items.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="font-serif italic text-[22px] text-ivory/50 mb-2">
                          The box is empty
                        </p>
                        <p className="text-[11px] text-ivory/35 tracking-[.15em] uppercase">
                          Add parathas from the menu
                        </p>
                      </div>
                    ) : (
                      <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                          <motion.div
                            key={item.lineId}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{ duration: 0.3 }}
                            className="relative flex gap-4 py-4 border-b border-ivory/08 last:border-b-0"
                          >
                            <div className="relative w-[72px] h-[72px] flex-shrink-0 overflow-hidden border border-gold/20">
                              <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="72px" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-serif text-[16px] font-normal text-ivory leading-tight mb-1 truncate">
                                {item.product.name}
                              </p>
                              {(item.sides.length > 0 || item.extras.length > 0) && (
                                <p className="text-[10px] text-ivory/50 leading-[1.5] mb-2">
                                  {item.sides.join(' · ')}
                                  {item.extras.length > 0 && (
                                    <span className="text-gold/70">
                                      {item.sides.length > 0 ? ' · ' : ''}
                                      +{item.extras.join(', ')}
                                    </span>
                                  )}
                                </p>
                              )}

                              <div className="flex items-center gap-3">
                                <div className="flex items-center border border-ivory/15">
                                  <button
                                    onClick={() => updateQty(item.lineId, item.quantity - 1)}
                                    aria-label="Decrease"
                                    className="w-7 h-7 flex items-center justify-center text-ivory/70 hover:bg-gold hover:text-ink transition-colors text-sm"
                                  >
                                    &minus;
                                  </button>
                                  <span className="w-8 h-7 flex items-center justify-center text-[12px] font-serif text-ivory border-x border-ivory/15">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQty(item.lineId, item.quantity + 1)}
                                    aria-label="Increase"
                                    className="w-7 h-7 flex items-center justify-center text-ivory/70 hover:bg-gold hover:text-ink transition-colors text-sm"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeItem(item.lineId)}
                                  className="text-[9px] tracking-[.22em] uppercase text-ivory/35 hover:text-spice transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-col items-end justify-between">
                              <span
                                className="font-serif text-[20px] font-normal bg-clip-text text-transparent leading-none"
                                style={{ backgroundImage: 'linear-gradient(135deg, #F3D488 0%, #D4A84B 60%, #B8882A 100%)' }}
                              >
                                ${lineTotal(item).toFixed(2)}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Fulfillment */}
                  <div className="px-8 py-6 border-t border-ivory/10">
                    <SectionLabel>Fulfillment</SectionLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <ToggleButton
                        active={fulfillment === 'delivery'}
                        onClick={() => setFulfillment('delivery')}
                        primary="Delivery"
                        sub="Within 7km"
                      />
                      <ToggleButton
                        active={fulfillment === 'pickup'}
                        onClick={() => setFulfillment('pickup')}
                        primary="Pickup"
                        sub="From our kitchen"
                      />
                    </div>
                  </div>

                  {/* Address (only if delivery) */}
                  {fulfillment === 'delivery' && (
                    <AddressChecker
                      onValidated={(ok, addr, coords) => {
                        setAddressOk(ok); setAddress(addr); setAddrCoords(coords)
                      }}
                    />
                  )}

                  {/* Schedule */}
                  <div className="px-8 py-6 border-t border-ivory/10">
                    <SectionLabel>When</SectionLabel>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <ToggleButton
                        active={scheduleMode === 'asap'}
                        onClick={() => setScheduleMode('asap')}
                        primary="ASAP"
                        sub="As soon as ready"
                      />
                      <ToggleButton
                        active={scheduleMode === 'later'}
                        onClick={() => setScheduleMode('later')}
                        primary="Schedule"
                        sub="Pick a time"
                      />
                    </div>
                    {scheduleMode === 'later' && (
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        min={minScheduleValue}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full px-4 py-[11px] bg-transparent border border-ivory/15 text-ivory text-[13px] outline-none focus:border-gold/60 transition-colors font-light tracking-[.02em]"
                        style={{ background: 'rgba(249,244,236,0.03)', colorScheme: 'dark' }}
                      />
                    )}
                  </div>

                  {/* Customer details */}
                  <div className="px-8 py-6 border-t border-ivory/10">
                    <SectionLabel>Your Details</SectionLabel>
                    <div className="grid gap-3">
                      <Field label="Name">
                        <TextInput value={name} onChange={setName} placeholder="Jane Singh" autoComplete="name" />
                      </Field>
                      <Field label="Phone">
                        <TextInput value={phone} onChange={setPhone} placeholder="(416) 555-0131" autoComplete="tel" type="tel" />
                      </Field>
                      <Field label="Email">
                        <TextInput value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" type="email" />
                      </Field>
                      <Field label="Notes (optional)">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          placeholder="Buzzer code, allergies, etc."
                          className="w-full px-4 py-[11px] bg-transparent border border-ivory/15 text-ivory text-[13px] outline-none focus:border-gold/60 transition-colors font-light tracking-[.02em] resize-none"
                          style={{ background: 'rgba(249,244,236,0.03)' }}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="px-8 py-6 border-t border-ivory/10">
                    <SectionLabel>Payment</SectionLabel>
                    <div className="grid grid-cols-2 gap-2">
                      <ToggleButton
                        active={payment === 'cod'}
                        onClick={() => setPayment('cod')}
                        primary="Cash"
                        sub={fulfillment === 'pickup' ? 'Pay at pickup' : 'Pay on delivery'}
                      />
                      <ToggleButton
                        active={payment === 'stripe'}
                        onClick={() => setPayment('stripe')}
                        primary="Card"
                        sub="Stripe secure"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ── Footer ──────────────────────────────────────────────── */}
            {!successId && (
              <div className="relative px-8 pb-8 pt-5 border-t border-ivory/10">
                <div className="flex justify-between items-baseline mb-4 pb-4 border-b border-ivory/08">
                  <div>
                    <p className="text-[9px] tracking-[.35em] uppercase text-ivory/40 mb-1">
                      Order Total
                    </p>
                    <p className="text-[10px] text-ivory/40 tracking-[.08em]">
                      {fulfillment === 'delivery' ? 'Including delivery' : 'Pickup — no delivery fee'}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-[14px] text-ivory/60">$</span>
                    <span
                      className="font-serif text-[40px] leading-none font-normal bg-clip-text text-transparent"
                      style={{ backgroundImage: 'linear-gradient(135deg, #F3D488 0%, #D4A84B 50%, #B8882A 100%)' }}
                    >
                      {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-[11px] text-spice mb-3 tracking-[.08em]"
                    >
                      <span className="w-1 h-1 rounded-full bg-spice flex-shrink-0" />
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group relative w-full overflow-hidden py-[16px] text-[11px] tracking-[.3em] uppercase font-medium text-ink disabled:opacity-50 disabled:pointer-events-none transition-all duration-300"
                  style={{
                    background: 'linear-gradient(120deg, #E8C77A 0%, #D4A84B 45%, #B8882A 100%)',
                    boxShadow: '0 10px 30px -8px rgba(212,168,75,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <Spinner />
                        Placing order
                      </>
                    ) : payment === 'cod' ? (
                      <>
                        Place Order — Pay {fulfillment === 'pickup' ? 'at Pickup' : 'on Delivery'}
                        <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                      </>
                    ) : (
                      <>
                        Proceed to Payment
                        <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                      </>
                    )}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>

                <div className="flex items-center justify-center gap-2 mt-3 text-[9px] text-ivory/35 tracking-[.28em] uppercase">
                  {payment === 'cod' ? (
                    <>Kitchen will confirm by phone</>
                  ) : (
                    <><LockIcon /> Secured by Stripe</>
                  )}
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .cart-scroll::-webkit-scrollbar { width: 4px; }
        .cart-scroll::-webkit-scrollbar-track { background: transparent; }
        .cart-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(212,168,75,0.4), rgba(212,168,75,0.1));
          border-radius: 2px;
        }
      `}</style>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] tracking-[.4em] uppercase text-ivory/40 font-medium mb-4 flex items-center gap-3">
      <span>{children}</span>
      <span className="flex-1 h-px bg-ivory/10" />
    </p>
  )
}

function ToggleButton({
  active, onClick, primary, sub,
}: { active: boolean; onClick: () => void; primary: string; sub: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex flex-col items-start gap-1 px-4 py-3 border transition-all duration-300',
        active ? 'border-transparent text-ink' : 'border-ivory/15 text-ivory/75 hover:border-gold/50',
      ].join(' ')}
      style={
        active
          ? {
              background: 'linear-gradient(120deg, #E8C77A 0%, #D4A84B 45%, #B8882A 100%)',
              boxShadow: '0 8px 20px -8px rgba(212,168,75,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
            }
          : { background: 'rgba(249,244,236,0.02)' }
      }
    >
      <span className={['text-[11px] tracking-[.22em] uppercase font-medium', active ? 'text-ink' : 'text-ivory'].join(' ')}>
        {primary}
      </span>
      <span className={['text-[9px] tracking-[.15em]', active ? 'text-ink/65' : 'text-ivory/45'].join(' ')}>
        {sub}
      </span>
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[9px] tracking-[.28em] uppercase text-ivory/45 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  )
}

function TextInput({
  value, onChange, placeholder, autoComplete, type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="w-full px-4 py-[11px] bg-transparent border border-ivory/15 text-ivory text-[13px] outline-none focus:border-gold/60 transition-colors font-light tracking-[.02em] placeholder:text-ivory/25"
      style={{ background: 'rgba(249,244,236,0.03)' }}
    />
  )
}

function SuccessView({ orderId, onNew }: { orderId: string; onNew: () => void }) {
  const orderNumber = orderId.slice(0, 8).toUpperCase()

  return (
    <div className="px-8 py-12 text-center">
      <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center border border-gold/40 rounded-full"
        style={{ background: 'linear-gradient(135deg, rgba(212,168,75,0.15), rgba(212,168,75,0.02))' }}
      >
        <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
          <path d="M2 9.5L8 15.5L20 3.5" stroke="#D4A84B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-[10px] tracking-[.4em] uppercase text-gold font-medium mb-3">Order Placed</p>
      <h3 className="font-serif text-[28px] text-ivory leading-tight mb-3">
        Thank you.
      </h3>
      <p className="text-[12px] text-ivory/55 font-light leading-[1.7] max-w-[340px] mx-auto mb-1">
        We&rsquo;ll call you to confirm timing. Cash ready, please — change on hand.
      </p>
      <p className="font-mono text-[10px] text-gold/70 tracking-wider mt-5">
        ORDER #{orderNumber}
      </p>

      <div className="flex flex-col gap-3 mt-10">
        <Link
          href={`/order/${orderId}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[10px] tracking-[.28em] uppercase text-ink font-medium transition-all duration-300"
          style={{
            background: 'linear-gradient(120deg, #E8C77A 0%, #D4A84B 45%, #B8882A 100%)',
            boxShadow: '0 8px 20px -8px rgba(212,168,75,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}
        >
          Track Order
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6H10M10 6L6 2M10 6L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <button
          onClick={onNew}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-ivory/20 text-[10px] tracking-[.28em] uppercase text-ivory/70 hover:border-gold/60 hover:text-gold transition-colors"
        >
          Start another order
        </button>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" className="animate-spin">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.25" />
      <path d="M7 1.5 A 5.5 5.5 0 0 1 12.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="10" height="11" viewBox="0 0 10 11" fill="none">
      <rect x="1.5" y="5" width="7" height="5" rx="0.5" stroke="currentColor" strokeWidth="1" />
      <path d="M3 5V3.5a2 2 0 0 1 4 0V5" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function GrainOverlay() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.12] mix-blend-overlay"
    >
      <filter id="cart-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#cart-grain)" />
    </svg>
  )
}
