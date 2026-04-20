'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DeliverySlot } from '@/types'

interface Props {
  selectedSlot: string | null
  onSelect:     (slotId: string) => void
}

function toDateString(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateLabel(dateStr: string) {
  const today = toDateString(new Date())
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = toDateString(tomorrow)

  if (dateStr === today) return { primary: 'Today', secondary: formatShort(dateStr) }
  if (dateStr === tomorrowStr) return { primary: 'Tomorrow', secondary: formatShort(dateStr) }

  const d = new Date(dateStr + 'T12:00:00')
  return {
    primary:   d.toLocaleDateString('en-CA', { weekday: 'short' }),
    secondary: d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
  }
}

function formatShort(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-CA', {
    month: 'short',
    day:   'numeric',
  })
}

const MAX_DAYS_AHEAD = 7

export function SlotPicker({ selectedSlot, onSelect }: Props) {
  const [selectedDate, setSelectedDate] = useState(() => toDateString(new Date()))
  const [slots,   setSlots]   = useState<DeliverySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const dateOptions = Array.from({ length: MAX_DAYS_AHEAD }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return toDateString(d)
  })

  const fetchSlots = useCallback((date: string) => {
    setLoading(true)
    setError(null)
    fetch(`/api/slots?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setSlots(data.slots ?? [])
        }
        setLoading(false)
      })
      .catch(() => { setError('Failed to load slots'); setLoading(false) })
  }, [])

  useEffect(() => {
    fetchSlots(selectedDate)
  }, [selectedDate, fetchSlots])

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    onSelect('')
  }

  return (
    <div className="px-9 py-6 border-t border-ivory/10">
      {/* ── Date row ────────────────────────────────────────────────────── */}
      <p className="text-[9px] tracking-[.4em] uppercase text-ivory/40 font-medium mb-4 flex items-center gap-3">
        <span>Delivery Date</span>
        <span className="flex-1 h-px bg-ivory/10" />
      </p>

      <div className="flex gap-2 mb-7 overflow-x-auto pb-1 date-scroll">
        {dateOptions.map((date) => {
          const label = formatDateLabel(date)
          const isSelected = selectedDate === date
          return (
            <button
              key={date}
              onClick={() => handleDateChange(date)}
              className={[
                'flex-shrink-0 px-4 py-3 border text-center transition-all duration-300 min-w-[76px]',
                isSelected
                  ? 'border-transparent text-ink'
                  : 'border-ivory/15 text-ivory/70 hover:border-gold/50',
              ].join(' ')}
              style={
                isSelected
                  ? {
                      background:
                        'linear-gradient(120deg, #E8C77A 0%, #D4A84B 45%, #B8882A 100%)',
                      boxShadow: '0 8px 20px -8px rgba(212,168,75,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                    }
                  : { background: 'rgba(249,244,236,0.02)' }
              }
            >
              <span className={[
                'block text-[10px] tracking-[.2em] uppercase font-medium',
                isSelected ? 'text-ink' : 'text-ivory',
              ].join(' ')}>
                {label.primary}
              </span>
              <span className={[
                'block text-[9px] tracking-[.1em] mt-0.5',
                isSelected ? 'text-ink/60' : 'text-ivory/40',
              ].join(' ')}>
                {label.secondary}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Time row ────────────────────────────────────────────────────── */}
      <p className="text-[9px] tracking-[.4em] uppercase text-ivory/40 font-medium mb-4 flex items-center gap-3">
        <span>Time Slot</span>
        <span className="flex-1 h-px bg-ivory/10" />
      </p>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-3 gap-2"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[52px] border border-ivory/08 animate-pulse"
                style={{ background: 'rgba(249,244,236,0.02)' }}
              />
            ))}
          </motion.div>
        ) : error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[12px] text-spice tracking-[.06em]"
          >
            {error}
          </motion.p>
        ) : slots.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[12px] text-ivory/40 font-light italic text-center py-6"
          >
            No delivery slots available for {formatDateLabel(selectedDate).primary}
          </motion.p>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-3 gap-2"
          >
            {slots.map((slot, i) => {
              const isSelected = selectedSlot === slot.id
              const remaining = slot.capacity - slot.booked

              return (
                <motion.button
                  key={slot.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  disabled={!slot.available}
                  onClick={() => onSelect(slot.id)}
                  className={[
                    'relative py-3 px-2 text-center border transition-all duration-300 overflow-hidden',
                    !slot.available
                      ? 'opacity-25 border-ivory/08 cursor-not-allowed'
                      : isSelected
                      ? 'border-transparent text-ink'
                      : 'border-ivory/15 text-ivory/80 hover:border-gold/50',
                  ].join(' ')}
                  style={
                    isSelected
                      ? {
                          background:
                            'linear-gradient(120deg, #E8C77A 0%, #D4A84B 45%, #B8882A 100%)',
                          boxShadow: '0 8px 20px -8px rgba(212,168,75,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                        }
                      : { background: 'rgba(249,244,236,0.02)' }
                  }
                >
                  <span className={[
                    'block text-[11px] tracking-[.04em] font-medium',
                    !slot.available && 'line-through',
                  ].filter(Boolean).join(' ')}>
                    {slot.label.split(' – ')[0]}
                  </span>
                  <span className={[
                    'block text-[8.5px] tracking-[.2em] uppercase mt-1',
                    isSelected ? 'text-ink/60' : !slot.available ? 'text-ivory/30' : 'text-gold/70',
                  ].join(' ')}>
                    {slot.available ? `${remaining} left` : 'Full'}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .date-scroll::-webkit-scrollbar { height: 2px; }
        .date-scroll::-webkit-scrollbar-track { background: transparent; }
        .date-scroll::-webkit-scrollbar-thumb {
          background: rgba(212,168,75,0.2);
          border-radius: 1px;
        }
      `}</style>
    </div>
  )
}
