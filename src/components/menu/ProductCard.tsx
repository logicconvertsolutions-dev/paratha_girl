'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'framer-motion'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/types'

interface Props { product: Product }

export function ProductCard({ product }: Props) {
  const [qty,    setQty]    = useState(0)
  const [chosen, setChosen] = useState<string[]>(() =>
    // Pre-select the first `free` side options for parathas so the default
    // state is a valid combo without the customer having to configure anything.
    product.sides ? product.sides.options.slice(0, product.sides.free) : [],
  )
  const [hover, setHover] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  // ── 3D tilt on hover ──────────────────────────────────────────────────────
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]),  { stiffness: 180, damping: 16 })
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]),  { stiffness: 180, damping: 16 })
  const glareX  = useTransform(mx, [-0.5, 0.5], ['15%', '85%'])
  const glareY  = useTransform(my, [-0.5, 0.5], ['10%', '90%'])
  const glareBg = useMotionTemplate`radial-gradient(600px circle at ${glareX} ${glareY}, rgba(255,231,170,0.25), transparent 40%)`

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleMouseLeave = () => {
    setHover(false)
    mx.set(0)
    my.set(0)
  }

  // ── Side selection math ───────────────────────────────────────────────────
  // "chosen" is the buyer's current pick of the 3 options. The first `free`
  // in the original option order are included free; any beyond are extras.
  const { freeChosen, extraChosen, extraCost } = useMemo(() => {
    if (!product.sides) return { freeChosen: [], extraChosen: [], extraCost: 0 }
    const free: string[] = []
    const extra: string[] = []
    for (const opt of product.sides.options) {
      if (!chosen.includes(opt)) continue
      if (free.length < product.sides.free) free.push(opt)
      else                                   extra.push(opt)
    }
    return {
      freeChosen:  free,
      extraChosen: extra,
      extraCost:   +(extra.length * product.sides.extraPrice).toFixed(2),
    }
  }, [chosen, product.sides])

  const toggleSide = (opt: string) => {
    setChosen((prev) =>
      prev.includes(opt) ? prev.filter((s) => s !== opt) : [...prev, opt],
    )
  }

  const unitPrice = +(product.price + extraCost).toFixed(2)
  const isParatha = product.category === 'paratha'

  const handleAdd = () => {
    if (qty === 0) return
    addItem(product, qty, freeChosen, extraChosen)
    window.dispatchEvent(new Event('open-cart'))
    setQty(0)
  }

  const idLabel = String(product.id).padStart(2, '0')

  return (
    <motion.article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 1200,
      }}
      className="relative group"
    >
      <motion.div
        aria-hidden
        animate={{ opacity: hover ? 0.55 : 0.25, scaleY: hover ? 1 : 0.75 }}
        transition={{ duration: 0.5 }}
        className="absolute left-4 right-4 -bottom-8 h-14 rounded-[50%] blur-2xl"
        style={{ background: 'radial-gradient(closest-side, rgba(30,59,47,0.7), transparent)' }}
      />

      <div
        className="relative bg-ivory overflow-hidden border border-forest/[0.08]"
        style={{
          boxShadow: hover
            ? '0 40px 80px -30px rgba(30,59,47,0.35), 0 12px 24px -8px rgba(30,59,47,0.14), inset 0 1px 0 rgba(255,255,255,0.9)'
            : '0 12px 32px -12px rgba(30,59,47,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
          transition: 'box-shadow 0.5s ease',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent z-20" />

        {/* ── Image cell ───────────────────────────────────────────────── */}
        <div className="relative h-[260px] overflow-hidden bg-ink">
          <motion.div
            animate={{ scale: hover ? 1.08 : 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </motion.div>

          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, transparent 40%, rgba(10,6,0,0.6) 100%), radial-gradient(ellipse at 30% 25%, rgba(244,196,100,0.18) 0%, transparent 55%)',
            }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              background: glareBg,
              opacity: hover ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
          />

          <div className="absolute top-5 right-6 font-serif text-[82px] leading-none text-ivory/15 select-none pointer-events-none tracking-[-0.04em]">
            {idLabel}
          </div>

          {product.badge && (
            <div className="absolute top-5 left-5">
              <span
                className="relative inline-flex items-center gap-2 px-3.5 py-1.5 text-[9px] tracking-[.28em] uppercase text-ivory font-medium border border-gold/40 backdrop-blur-md"
                style={{ background: 'rgba(26,18,8,0.55)' }}
              >
                <span className="w-1 h-1 rounded-full bg-gold" />
                {product.badge}
              </span>
            </div>
          )}

          <CornerMark className="bottom-4 left-4" />
          <CornerMark className="bottom-4 right-4" rotate={90} />

          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-[10px] tracking-[.32em] uppercase text-gold/90 font-medium">
              {product.tagline}
            </p>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="relative px-7 pt-6 pb-7">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] tracking-[.32em] uppercase text-gold font-medium">
              No. {idLabel}
            </span>
            <span className="flex-1 h-px bg-forest/15" />
            <span className="text-[10px] tracking-[.22em] uppercase text-muted">
              {isParatha ? 'Made Fresh' : 'Cold · Served'}
            </span>
          </div>

          <h3 className="font-serif text-[26px] font-normal leading-[1.05] text-forest mb-3 tracking-[-0.01em]">
            {product.name.split(' ').map((word, i, arr) =>
              i === arr.length - 1 ? (
                <em key={i} className="italic text-spice"> {word}</em>
              ) : (
                <span key={i}>{i > 0 ? ' ' : ''}{word}</span>
              ),
            )}
          </h3>

          <p className="text-[12.5px] text-muted leading-[1.7] mb-5 font-light">
            {product.description}
          </p>

          {/* ── Sides picker (parathas only) ─────────────────────────── */}
          {isParatha && product.sides && (
            <div className="pt-4 mb-5 border-t border-forest/[0.08]">
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-[10px] tracking-[.32em] uppercase text-forest/70 font-medium">
                  Sides
                </p>
                <p className="text-[9px] tracking-[.2em] uppercase text-muted">
                  {product.sides.free} free · ${product.sides.extraPrice.toFixed(2)} extra
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {product.sides.options.map((opt) => {
                  const selected = chosen.includes(opt)
                  const isExtra  = extraChosen.includes(opt)
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleSide(opt)}
                      className={[
                        'relative px-2 py-2 text-[11px] tracking-[.12em] border transition-all duration-300',
                        selected
                          ? 'border-forest bg-forest text-ivory'
                          : 'border-forest/15 text-forest/70 hover:border-forest/40 bg-ivory',
                      ].join(' ')}
                    >
                      {opt}
                      {isExtra && (
                        <span
                          className="absolute -top-1 -right-1 px-1.5 py-[1px] text-[8px] tracking-[.15em] uppercase font-medium text-ink"
                          style={{
                            background:
                              'linear-gradient(120deg, #E8C77A 0%, #D4A84B 50%, #B8882A 100%)',
                          }}
                        >
                          +${product.sides!.extraPrice.toFixed(2)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {chosen.length < product.sides.free && (
                <p className="text-[10px] text-muted mt-2 italic">
                  Pick up to {product.sides.free} sides (included).
                </p>
              )}
            </div>
          )}

          {/* ── Price + qty + add ────────────────────────────────────── */}
          <div className="pt-4 border-t border-forest/[0.08]">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[9px] tracking-[.28em] uppercase text-muted mb-1">
                  Per Piece
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-[10px] text-muted leading-none">$</span>
                  <span
                    className="font-serif text-[38px] leading-none font-normal bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        'linear-gradient(135deg, #1E3B2F 0%, #2D5241 50%, #1E3B2F 100%)',
                    }}
                  >
                    {unitPrice.toFixed(2)}
                  </span>
                </div>
                {extraCost > 0 && (
                  <p className="text-[9px] text-muted/80 mt-1">
                    incl. ${extraCost.toFixed(2)} extra
                  </p>
                )}
              </div>

              <div
                className="flex items-center border border-forest/15"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)' }}
              >
                <button
                  onClick={() => setQty((q) => Math.max(0, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-9 h-9 flex items-center justify-center text-forest text-base hover:bg-forest hover:text-ivory transition-colors duration-200"
                >
                  &minus;
                </button>
                <span className="w-10 h-9 flex items-center justify-center font-serif text-base text-forest border-x border-forest/15">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-9 h-9 flex items-center justify-center text-forest text-base hover:bg-forest hover:text-ivory transition-colors duration-200"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={qty === 0}
              className="group/btn relative w-full overflow-hidden py-[14px] text-[10px] tracking-[.32em] uppercase font-medium disabled:opacity-40 disabled:pointer-events-none transition-all duration-300"
              style={{
                background: qty === 0
                  ? 'linear-gradient(120deg, #1E3B2F 0%, #2D5241 100%)'
                  : 'linear-gradient(120deg, #E8C77A 0%, #D4A84B 45%, #B8882A 100%)',
                color: qty === 0 ? '#F9F4EC' : '#1A1208',
                boxShadow: qty === 0
                  ? 'inset 0 1px 0 rgba(255,255,255,0.1)'
                  : '0 6px 20px -6px rgba(212,168,75,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {qty === 0 ? 'Select Quantity' : `Add ${qty} to Box — $${(unitPrice * qty).toFixed(2)}`}
                {qty > 0 && <span>→</span>}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function CornerMark({ className = '', rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <span
      aria-hidden
      className={`absolute w-4 h-4 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <span className="absolute top-0 left-0 w-full h-px bg-gold/60" />
      <span className="absolute top-0 left-0 w-px h-full bg-gold/60" />
    </span>
  )
}
