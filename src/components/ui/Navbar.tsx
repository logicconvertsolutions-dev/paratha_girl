'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cart'
import { Logo } from '@/components/ui/Logo'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const totalItems = useCartStore((s) => s.totalItems)
  const hydrated = useCartStore((s) => s.hydrated)

  useEffect(() => {
    setIsMounted(true)
    useCartStore.persist.rehydrate()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const count = isMounted && hydrated ? totalItems() : 0

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* ── Backdrop that morphs with scroll ──────────────────────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: scrolled
            ? 'linear-gradient(180deg, rgba(249,244,236,0.92) 0%, rgba(249,244,236,0.88) 100%)'
            : 'linear-gradient(180deg, rgba(26,18,8,0.55) 0%, rgba(26,18,8,0.15) 100%)',
          backdropFilter: scrolled ? 'blur(18px) saturate(1.15)' : 'blur(10px)',
          borderBottom: scrolled
            ? '1px solid rgba(30,59,47,0.10)'
            : '1px solid rgba(212,168,75,0.14)',
          boxShadow: scrolled
            ? '0 10px 40px -16px rgba(30,59,47,0.15)'
            : 'none',
        }}
      />

      {/* ── Hairline gold top accent ──────────────────────────────────────── */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
      />

      <div className="relative flex items-center justify-between px-8 md:px-[60px] py-5">
        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <a href="/" className="group flex items-center gap-3" aria-label="Paratha Girl — home">
          <Logo size={64} priority className="transition-transform duration-500 group-hover:scale-[1.03]" />
          <div className="flex flex-col leading-tight">
            <span
              className={[
                'font-serif text-[20px] font-normal tracking-[-0.01em] transition-colors duration-500',
                scrolled ? 'text-forest' : 'text-ivory',
              ].join(' ')}
            >
              Paratha <span className="italic text-gold">Girl</span>
            </span>
            <span
              className={[
                'text-[8px] tracking-[.38em] uppercase mt-1 font-medium transition-colors duration-500',
                scrolled ? 'text-muted' : 'text-ivory/55',
              ].join(' ')}
            >
              Fresh · Flaky · Famous
            </span>
          </div>
        </a>

        {/* ── Links ─────────────────────────────────────────────────────── */}
        <ul className="hidden md:flex items-center gap-1 list-none">
          {[
            ['Menu',     '#menu'],
            ['Story',    '#story'],
            ['Delivery', '#delivery'],
            ['Admin',    '/admin'],
          ].map(([label, href]) => (
            <li key={label}>
              <NavLink href={href} scrolled={scrolled}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── Cart ──────────────────────────────────────────────────────── */}
        <button
          onClick={() => window.dispatchEvent(new Event('open-cart'))}
          className="group relative flex items-center gap-3 px-6 py-[11px] text-[10px] tracking-[.28em] uppercase font-medium overflow-hidden transition-all duration-500"
          style={{
            color: scrolled ? '#F9F4EC' : '#1A1208',
            background: scrolled
              ? 'linear-gradient(120deg, #1E3B2F 0%, #2D5241 100%)'
              : 'linear-gradient(120deg, #E8C77A 0%, #D4A84B 45%, #B8882A 100%)',
            boxShadow: scrolled
              ? '0 8px 24px -8px rgba(30,59,47,0.35), inset 0 1px 0 rgba(255,255,255,0.1)'
              : '0 8px 24px -8px rgba(212,168,75,0.55), inset 0 1px 0 rgba(255,255,255,0.35)',
          }}
        >
          <CartIcon />
          <span className="relative z-10">Your Box</span>

          <AnimatePresence mode="popLayout">
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="relative z-10 min-w-[22px] h-[22px] px-1.5 rounded-full font-serif text-[11px] flex items-center justify-center"
                style={{
                  background: scrolled ? '#C4501A' : '#1A1208',
                  color: scrolled ? '#F9F4EC' : '#D4A84B',
                }}
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Shimmer sweep */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </div>
    </motion.nav>
  )
}

// ═══════════════════════════════════════════════════════════════════════════

function NavLink({
  href,
  children,
  scrolled,
}: {
  href: string
  children: React.ReactNode
  scrolled: boolean
}) {
  return (
    <a
      href={href}
      className={[
        'relative inline-flex items-center px-4 py-2 text-[10px] tracking-[.3em] uppercase font-medium transition-colors duration-300 group',
        scrolled ? 'text-muted hover:text-forest' : 'text-ivory/70 hover:text-gold',
      ].join(' ')}
    >
      {children}
      <span
        className={[
          'absolute left-4 right-4 -bottom-0.5 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500',
          scrolled ? 'bg-forest' : 'bg-gold',
        ].join(' ')}
      />
    </a>
  )
}

function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="relative z-10">
      <path
        d="M2 2h2l1.3 9.2a1 1 0 0 0 1 .8h6.2a1 1 0 0 0 1-.8L15 5H4.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.5" cy="14" r="1.1" fill="currentColor" />
      <circle cx="12"  cy="14" r="1.1" fill="currentColor" />
    </svg>
  )
}
