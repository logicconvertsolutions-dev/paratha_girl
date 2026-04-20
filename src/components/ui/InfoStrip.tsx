'use client'

import { motion } from 'framer-motion'

const ITEMS = [
  {
    number: '30',
    unit:   'min',
    title:  'Delivery Windows',
    desc:   'We prepare in 30-minute slots. Maximum five parathas per window — so every piece is cooked fresh, never in bulk.',
    status: '3 of 5 slots open today',
    state:  'active' as const,
  },
  {
    number: '7',
    unit:   'km',
    title:  'Delivery Radius',
    desc:   'We deliver within seven kilometres of our North York kitchen. Addresses are geocoded and verified at checkout.',
    status: 'North York · Toronto',
    state:  'info' as const,
  },
  {
    number: '100',
    unit:   '%',
    title:  'Secure Checkout',
    desc:   'Card or Apple Pay through Stripe. Your order confirms instantly and is prepared to the slot you choose.',
    status: 'Powered by Stripe',
    state:  'active' as const,
  },
]

export function InfoStrip() {
  return (
    <section
      id="delivery"
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0F0A03 0%, #1A1208 100%)' }}
    >
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[300px] rounded-full opacity-[0.14] blur-[120px]"
        style={{ background: 'radial-gradient(closest-side, #D4A84B 0%, transparent 75%)' }}
      />

      <GrainOverlay />

      {/* Chapter marker */}
      <div className="relative max-w-[1400px] mx-auto px-8 md:px-[60px] pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-4"
        >
          <span className="text-[10px] tracking-[.4em] uppercase text-gold font-medium">
            Chapter I
          </span>
          <span className="flex-1 h-px bg-gradient-to-r from-gold/50 via-gold/20 to-transparent max-w-[280px]" />
          <span className="text-[10px] tracking-[.4em] uppercase text-ivory/40 font-medium">
            How It Works
          </span>
        </motion.div>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-8 md:px-[60px] pb-20 grid grid-cols-1 md:grid-cols-3 gap-5">
        {ITEMS.map((item, i) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: i * 0.12 }}
            className="relative p-8 border border-ivory/10 overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, rgba(249,244,236,0.04) 0%, rgba(249,244,236,0.01) 100%)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Gold corners */}
            <Corner className="top-3 left-3" />
            <Corner className="top-3 right-3" rotate={90} />
            <Corner className="bottom-3 right-3" rotate={180} />
            <Corner className="bottom-3 left-3" rotate={270} />

            {/* Oversized number */}
            <div className="flex items-baseline gap-2 mb-8">
              <span
                className="font-serif text-[72px] leading-none font-normal bg-clip-text text-transparent tracking-[-0.03em]"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #F3D488 0%, #D4A84B 50%, #B8882A 100%)',
                }}
              >
                {item.number}
              </span>
              <span className="font-serif italic text-[22px] text-gold/70">
                {item.unit}
              </span>
            </div>

            <h4 className="font-serif text-[24px] font-normal text-ivory mb-3 leading-tight tracking-[-0.01em]">
              {item.title}
            </h4>

            <p className="text-[12.5px] text-ivory/55 leading-[1.75] font-light mb-7">
              {item.desc}
            </p>

            {/* Status pill */}
            <div
              className="inline-flex items-center gap-2.5 px-3.5 py-2 border border-gold/25 text-[9px] tracking-[.3em] uppercase text-ivory/70 font-medium"
              style={{ background: 'rgba(26,18,8,0.5)' }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-70 animate-ping"
                  style={{ background: item.state === 'active' ? '#D4A84B' : '#C4501A' }}
                />
                <span
                  className="relative inline-flex rounded-full h-1.5 w-1.5"
                  style={{ background: item.state === 'active' ? '#D4A84B' : '#C4501A' }}
                />
              </span>
              {item.status}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

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
      <filter id="info-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#info-grain)" />
    </svg>
  )
}
