'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onValidated: (
    ok: boolean,
    address: string,
    coords: { lat: number; lng: number } | null
  ) => void
}

export function AddressChecker({ onValidated }: Props) {
  const [value,   setValue]   = useState('')
  const [status,  setStatus]  = useState<'idle' | 'checking' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const check = async () => {
    if (!value.trim()) return
    setStatus('checking')

    try {
      const res = await fetch('/api/validate-address', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ address: value }),
      })
      const data = await res.json()

      if (data.valid) {
        setStatus('ok')
        setMessage(`Within ${data.distanceKm.toFixed(1)}km — delivery confirmed`)
        onValidated(true, data.address, { lat: data.lat, lng: data.lng })
      } else {
        setStatus('error')
        setMessage(`${data.distanceKm.toFixed(1)}km away — outside our 7km zone`)
        onValidated(false, '', null)
      }
    } catch {
      setStatus('error')
      setMessage('Could not verify address. Please try again.')
      onValidated(false, '', null)
    }
  }

  return (
    <div className="px-9 py-6 border-t border-ivory/10">
      <p className="text-[9px] tracking-[.4em] uppercase text-ivory/40 font-medium mb-4 flex items-center gap-3">
        <span>Address</span>
        <span className="flex-1 h-px bg-ivory/10" />
      </p>

      <div
        className="relative flex items-stretch border border-ivory/15 focus-within:border-gold/60 transition-colors duration-300"
        style={{ background: 'rgba(249,244,236,0.03)' }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); if (status !== 'idle') setStatus('idle') }}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          placeholder="123 Main St, Toronto, ON"
          className="flex-1 pl-4 pr-3 py-[13px] bg-transparent text-ivory text-[13px] placeholder:text-ivory/25 outline-none font-light tracking-[.02em]"
        />
        <button
          onClick={check}
          disabled={status === 'checking' || !value.trim()}
          className="px-5 border-l border-ivory/15 text-[9px] tracking-[.28em] uppercase font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group"
          style={{
            color: status === 'ok' ? '#1A1208' : '#D4A84B',
            background: status === 'ok'
              ? 'linear-gradient(120deg, #E8C77A 0%, #D4A84B 45%, #B8882A 100%)'
              : 'transparent',
          }}
        >
          <span className="relative z-10 flex items-center gap-2">
            {status === 'checking' ? (
              <>
                <Spinner />
                Checking
              </>
            ) : status === 'ok' ? (
              <>
                <CheckIcon />
                Verified
              </>
            ) : (
              'Verify'
            )}
          </span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {status === 'ok' && (
          <motion.p
            key="ok"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 mt-3 text-[11px] tracking-[.06em] text-gold"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,168,75,0.8)]" />
            {message}
          </motion.p>
        )}
        {status === 'error' && (
          <motion.p
            key="err"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 mt-3 text-[11px] tracking-[.06em] text-spice"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-spice" />
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function Spinner() {
  return (
    <svg width="10" height="10" viewBox="0 0 14 14" className="animate-spin">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d="M7 1.5 A 5.5 5.5 0 0 1 12.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
      <path d="M1 4.5L4 7.5L10 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
