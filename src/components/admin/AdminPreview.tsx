'use client'

import { motion } from 'framer-motion'

export function AdminPreview() {
  return (
    <section
      id="admin"
      className="relative mx-[32px] md:mx-[60px] mb-20 overflow-hidden"
    >
      <div
        className="relative border border-ivory/10 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F0A03 0%, #1A1208 60%, #0F0A03 100%)',
        }}
      >
        {/* Ambient gold glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-[0.14] blur-[140px]"
          style={{ background: 'radial-gradient(closest-side, #D4A84B 0%, transparent 70%)' }}
        />

        <GrainOverlay />

        {/* Gold corners */}
        <Corner className="top-4 left-4" />
        <Corner className="top-4 right-4" rotate={90} />
        <Corner className="bottom-4 right-4" rotate={180} />
        <Corner className="bottom-4 left-4" rotate={270} />

        {/* Watermark */}
        <span
          aria-hidden
          className="absolute right-[40px] top-1/2 -translate-y-1/2 font-serif italic text-[160px] font-normal text-ivory/[0.03] leading-none pointer-events-none select-none hidden lg:block tracking-[-0.03em]"
        >
          line
        </span>

        <div className="relative px-10 md:px-[72px] py-[72px] flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-[460px]"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-gold/50" />
              <p className="text-[10px] tracking-[.5em] uppercase text-gold font-medium">
                Command Center
              </p>
            </div>

            <h3 className="font-serif text-[44px] md:text-[56px] font-normal text-ivory leading-[.95] tracking-[-0.02em] mb-5">
              The{' '}
              <em
                className="italic bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(120deg, #F3D488 0%, #D4A84B 35%, #B8882A 65%, #8A6519 100%)',
                }}
              >
                line
              </em>
              <span className="text-gold">.</span>
            </h3>

            <p className="text-[13.5px] text-ivory/55 font-light leading-[1.9] mb-7">
              Password-protected order management. Every incoming order surfaces
              in a single clean view — mark it Preparing, then Out for Delivery,
              then Delivered. No clutter, no friction.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {['Live Orders', 'Slot Capacity', 'Revenue', 'Status Flow'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 border border-ivory/12 text-[9px] tracking-[.25em] uppercase text-ivory/60 font-medium"
                  style={{ background: 'rgba(249,244,236,0.02)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.a
            href="/admin"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="group relative z-10 px-10 py-5 text-[11px] tracking-[.28em] uppercase font-medium text-ink overflow-hidden transition-all duration-300 hover:-translate-y-[1px] whitespace-nowrap"
            style={{
              background:
                'linear-gradient(120deg, #E8C77A 0%, #D4A84B 45%, #B8882A 100%)',
              boxShadow:
                '0 10px 28px -8px rgba(212,168,75,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            <span className="relative z-10 flex items-center gap-3">
              Enter Dashboard
              <span className="text-[14px] leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </motion.a>
        </div>

        {/* Top gold hairline */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      </div>
    </section>
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

function GrainOverlay() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.1] mix-blend-overlay"
    >
      <filter id="preview-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#preview-grain)" />
    </svg>
  )
}
