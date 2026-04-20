'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const STATS = [
  { value: '5',    label: 'Max Per Slot',      detail: 'Per 30-min window' },
  { value: '7km',  label: 'Delivery Radius',   detail: 'From our kitchen' },
  { value: '3',    label: 'Paratha Varieties', detail: 'Each one signature' },
  { value: '100%', label: 'Home Cooked',       detail: 'No shortcuts, ever' },
]

export function StorySection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], ['-6%', '12%'])
  const copyY  = useTransform(scrollYProgress, [0, 1], ['4%', '-4%'])

  return (
    <section
      id="story"
      ref={sectionRef}
      className="relative bg-ink text-ivory overflow-hidden"
    >
      {/* ── Ambient gold glow ─────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 right-0 w-[700px] h-[700px] rounded-full opacity-[0.16] blur-[140px]"
        style={{
          background:
            'radial-gradient(closest-side, #D4A84B 0%, #B8882A 40%, transparent 75%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-[0.22] blur-[140px]"
        style={{
          background:
            'radial-gradient(closest-side, #2D5241 0%, #1E3B2F 50%, transparent 80%)',
        }}
      />

      {/* ── Grain ────────────────────────────────────────────────────────── */}
      <GrainOverlay />

      {/* ── Chapter marker ────────────────────────────────────────────────── */}
      <div className="relative max-w-[1400px] mx-auto px-8 md:px-[60px] pt-24 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-4"
        >
          <span className="text-[10px] tracking-[.4em] uppercase text-gold font-medium">
            Chapter II
          </span>
          <span className="flex-1 h-px bg-gradient-to-r from-gold/50 via-gold/20 to-transparent max-w-[280px]" />
          <span className="text-[10px] tracking-[.4em] uppercase text-ivory/40 font-medium">
            The Kitchen
          </span>
        </motion.div>
      </div>

      {/* ── Main editorial grid ───────────────────────────────────────────── */}
      <div className="relative max-w-[1400px] mx-auto px-8 md:px-[60px] pb-28 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14 items-center">
        {/* ── Image (left, 6 cols) ──────────────────────────────────────── */}
        <motion.div
          style={{ y: imageY }}
          className="md:col-span-6 relative"
        >
          <div className="relative h-[520px] md:h-[620px] overflow-hidden border border-gold/20 group">
            <Image
              src="/images/story-kitchen.jpg"
              alt="Paratha cooked on cast-iron tawa"
              fill
              className="object-cover transition-transform duration-[2.5s] ease-out group-hover:scale-[1.06]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {/* Cinematic gradient */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, transparent 30%, rgba(10,6,0,0.5) 100%), radial-gradient(ellipse at 25% 20%, rgba(244,196,100,0.2) 0%, transparent 55%)',
              }}
            />

            {/* Corner marks */}
            <Corner className="top-4 left-4" />
            <Corner className="top-4 right-4" rotate={90} />
            <Corner className="bottom-4 right-4" rotate={180} />
            <Corner className="bottom-4 left-4" rotate={270} />

            {/* Image caption */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute bottom-6 left-6 right-6"
            >
              <p className="text-[9px] tracking-[.4em] uppercase text-gold mb-2">
                Plate No. 01
              </p>
              <p className="font-serif text-[18px] text-ivory leading-tight">
                Dough folded seven times — the only way to a true
                <em className="italic text-gold"> lachha</em>.
              </p>
            </motion.div>
          </div>

          {/* ── Floating attribution card ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="absolute -bottom-8 -right-6 md:-right-10 p-5 border border-gold/30 max-w-[240px]"
            style={{
              background: 'rgba(26,18,8,0.75)',
              backdropFilter: 'blur(18px)',
              boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <p className="text-[9px] tracking-[.32em] uppercase text-gold mb-2">Chef</p>
            <p className="font-serif text-[20px] italic text-ivory leading-tight mb-1">
              Paratha Girl
            </p>
            <p className="text-[11px] text-ivory/55 leading-[1.6]">
              One kitchen. One pair of hands. A lifetime of recipes.
            </p>
          </motion.div>
        </motion.div>

        {/* ── Copy (right, 6 cols) ──────────────────────────────────────── */}
        <motion.div
          style={{ y: copyY }}
          className="md:col-span-6 md:pl-8"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="text-[10px] tracking-[.4em] uppercase text-gold font-medium mb-6"
          >
            The Story
          </motion.p>

          <motion.h3
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-serif text-[clamp(38px,4.5vw,64px)] font-normal leading-[.98] text-ivory mb-8 tracking-[-0.02em]"
          >
            Cooked with
            <br />
            <em
              className="italic bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(120deg, #D4A84B 0%, #F3D488 35%, #B8882A 65%, #8A6519 100%)',
              }}
            >
              intention
            </em>
            <span className="text-gold">.</span>
          </motion.h3>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-px w-20 bg-gold/60 origin-left mb-8"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-[15px] text-ivory/65 leading-[1.9] font-light mb-10 max-w-[500px]"
          >
            Every paratha begins as a ball of dough, rolled by hand, layered with
            cold-pressed ghee, and cooked on a cast-iron tawa until it reaches
            that impossible moment — blistered, buttered, alive. No frozen
            shortcuts. No production lines. Just a kitchen, a pair of hands, and
            the way it&rsquo;s always been done.
          </motion.p>

          {/* ── Stats grid ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 mb-12">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: 0.4 + i * 0.08 }}
                className="relative p-5 border border-ivory/10 overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, rgba(249,244,236,0.04) 0%, rgba(249,244,236,0.01) 100%)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* Gold corner accent */}
                <span className="absolute top-0 left-0 w-6 h-px bg-gold/50" />
                <span className="absolute top-0 left-0 h-6 w-px bg-gold/50" />

                <p
                  className="font-serif text-[40px] leading-none font-normal bg-clip-text text-transparent mb-2"
                  style={{
                    backgroundImage:
                      'linear-gradient(135deg, #F3D488 0%, #D4A84B 50%, #B8882A 100%)',
                  }}
                >
                  {s.value}
                </p>
                <p className="text-[10px] tracking-[.25em] uppercase text-ivory/70 font-medium mb-1">
                  {s.label}
                </p>
                <p className="text-[10px] text-ivory/40 tracking-[.05em]">
                  {s.detail}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ── CTA ─────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center gap-6"
          >
            <button
              onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative overflow-hidden px-9 py-[16px] text-[11px] tracking-[.28em] uppercase font-medium text-ink"
              style={{
                background:
                  'linear-gradient(120deg, #E8C77A 0%, #D4A84B 45%, #B8882A 100%)',
                boxShadow:
                  '0 8px 30px -8px rgba(212,168,75,0.55), inset 0 1px 0 rgba(255,255,255,0.35)',
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Order Now
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            <span className="text-[10px] tracking-[.28em] uppercase text-ivory/40">
              Fresh batches daily
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Bottom chapter marker ─────────────────────────────────────────── */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════

function Corner({ className = '', rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <span
      aria-hidden
      className={`absolute w-5 h-5 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <span className="absolute top-0 left-0 w-full h-px bg-gold/70" />
      <span className="absolute top-0 left-0 w-px h-full bg-gold/70" />
    </span>
  )
}

function GrainOverlay() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.14] mix-blend-overlay"
    >
      <filter id="story-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#story-grain)" />
    </svg>
  )
}
