'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { adminLogin } from '@/app/admin/actions'
import { Logo } from '@/components/ui/Logo'

export function AdminLogin() {
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd     = new FormData(e.currentTarget)
    const result = await adminLogin(fd)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0F0A03 0%, #1A1208 60%, #0F0A03 100%)' }}
    >
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-[0.14] blur-[140px]"
        style={{ background: 'radial-gradient(closest-side, #D4A84B 0%, transparent 70%)' }}
      />
      {/* Forest counterbalance */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.1] blur-[120px]"
        style={{ background: 'radial-gradient(closest-side, #1F3A2E 0%, transparent 70%)' }}
      />

      <GrainOverlay />

      {/* Back-to-site link */}
      <a
        href="/"
        className="group fixed top-6 left-6 md:top-8 md:left-10 z-20 flex items-center gap-3 text-[10px] tracking-[.35em] uppercase text-ivory/50 hover:text-gold transition-colors duration-300"
      >
        <span className="flex items-center justify-center w-8 h-8 border border-ivory/20 group-hover:border-gold/60 transition-colors duration-300">
          <span className="text-[13px] leading-none transition-transform duration-300 group-hover:-translate-x-[2px]">←</span>
        </span>
        Back to site
      </a>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[420px]"
      >
        {/* ── Masthead ─────────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/50" />
            <Logo size={128} priority />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/50" />
          </div>

          <p className="text-[10px] tracking-[.5em] uppercase text-gold/80 font-medium mb-5">
            Command Center
          </p>

          <h1 className="font-serif text-[52px] font-normal text-ivory leading-[.95] tracking-[-0.02em]">
            Paratha{' '}
            <em
              className="italic bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(120deg, #F3D488 0%, #D4A84B 35%, #B8882A 65%, #8A6519 100%)',
              }}
            >
              Girl
            </em>
            <span className="text-gold">.</span>
          </h1>

          <p className="text-[10px] tracking-[.38em] uppercase text-ivory/55 mt-5 font-medium">
            Fresh · Flaky · Famous
          </p>
          <p className="text-[10px] tracking-[.3em] uppercase text-ivory/35 mt-2 font-light">
            Authorised Personnel Only
          </p>
        </div>

        {/* ── Card ─────────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="relative p-9 border border-ivory/10 overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(249,244,236,0.04) 0%, rgba(249,244,236,0.01) 100%)',
            backdropFilter: 'blur(14px)',
          }}
        >
          {/* Gold corners */}
          <Corner className="top-3 left-3" />
          <Corner className="top-3 right-3" rotate={90} />
          <Corner className="bottom-3 right-3" rotate={180} />
          <Corner className="bottom-3 left-3" rotate={270} />

          <p className="text-[9px] tracking-[.4em] uppercase text-gold font-medium mb-5 flex items-center gap-3">
            <span>Password</span>
            <span className="flex-1 h-px bg-ivory/10" />
          </p>

          <input
            name="password"
            type="password"
            required
            autoFocus
            placeholder="••••••••••••"
            className="w-full px-4 py-4 border border-ivory/15 text-ivory text-[14px] tracking-[.15em] placeholder:text-ivory/25 outline-none focus:border-gold/60 transition-colors duration-300 mb-5 font-light"
            style={{ background: 'rgba(15,10,3,0.5)' }}
          />

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-spice text-[11px] tracking-[.15em] mb-5 pl-3 border-l-2 border-spice/60"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-4 text-[11px] tracking-[.28em] uppercase font-medium text-ink overflow-hidden transition-all duration-300 hover:-translate-y-[1px] disabled:opacity-60 disabled:translate-y-0 disabled:cursor-not-allowed"
            style={{
              background:
                'linear-gradient(120deg, #E8C77A 0%, #D4A84B 45%, #B8882A 100%)',
              boxShadow:
                '0 10px 28px -8px rgba(212,168,75,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <Spinner />
                  Verifying
                </>
              ) : (
                <>
                  Enter Dashboard
                  <span className="text-[14px] leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
                </>
              )}
            </span>
          </button>

          <p className="text-[9px] tracking-[.35em] uppercase text-ivory/30 text-center mt-6 font-light">
            Session lasts 8 hours
          </p>
        </form>

        <p className="text-[10px] tracking-[.3em] uppercase text-ivory/25 text-center mt-8 font-light">
          &copy; Paratha Girl · Toronto
        </p>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════

function Corner({ className = '', rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <span
      aria-hidden
      className={`absolute w-4 h-4 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <span className="absolute top-0 left-0 w-full h-px bg-gold/50" />
      <span className="absolute top-0 left-0 w-px h-full bg-gold/50" />
    </span>
  )
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" fill="none" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function GrainOverlay() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 w-full h-full opacity-[0.1] mix-blend-overlay"
    >
      <filter id="login-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#login-grain)" />
    </svg>
  )
}
