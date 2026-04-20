'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from 'framer-motion'
import { CertifiedBadge } from '@/components/ui/CertifiedBadge'

export function Hero() {
  const ref       = useRef<HTMLDivElement>(null)
  const videoRef  = useRef<HTMLVideoElement>(null)
  const targetRef = useRef(0)
  const [mounted, setMounted] = useState(false)
  const [duration, setDuration] = useState(0)

  useEffect(() => setMounted(true), [])

  // Capture duration as soon as video is ready
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    
    // If duration is already available, set it immediately
    if (v.duration > 0) {
      setDuration(v.duration)
      return
    }
    
    // Otherwise listen for the durationchange event
    const handleDurationChange = () => {
      if (v.duration > 0) {
        setDuration(v.duration)
      }
    }
    
    v.addEventListener('durationchange', handleDurationChange)
    return () => v.removeEventListener('durationchange', handleDurationChange)
  }, [])

  // ── Scroll-linked video scrubbing ────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })
  // Heavy-damped spring smooths raw scroll into honey-like ease-out.
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.7 })

  // Stash the latest target — the rAF loop reads from the ref so we never
  // queue seeks faster than the decoder can service them.
  useMotionValueEvent(p, 'change', (v) => {
    targetRef.current = Math.min(Math.max(v, 0), 1)
  })

  // rAF-driven scrubber. Key trick: only issue a new seek once the previous
  // one has fired `seeked`. Piling up seek requests on a non-keyframe-dense
  // MP4 is what produces jumpy playback.
  useEffect(() => {
    if (!duration) return
    const video = videoRef.current
    if (!video) return

    let running  = true
    let seeking  = false
    let lastSeekTime = 0
    let rafId    = 0

    const onSeeked = () => { 
      seeking = false
    }
    const onError = () => {
      console.warn('❌ Video playback error:', video.error?.message)
    }
    
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)

    const loop = () => {
      if (!running) return
      
      // Check if we can perform a new seek
      const now = Date.now()
      const timeSinceLastSeek = now - lastSeekTime
      const canSeek = !seeking && timeSinceLastSeek > 16 // throttle seeks
      
      if (canSeek && video.readyState >= 2) {
        const target = targetRef.current * duration
        const diff   = target - video.currentTime
        // Only seek if difference is noticeable (>0.15s)
        if (Math.abs(diff) > 0.15) {
          seeking = true
          lastSeekTime = now
          try {
            video.currentTime = target
          } catch (e) {
            seeking = false
          }
        }
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
    }
  }, [duration])

  // Text parallax / fade
  const titleY       = useTransform(p, [0, 1],   [0, -80])
  const titleOpacity = useTransform(p, [0, 0.7], [1, 0.3])
  const ctaOpacity   = useTransform(p, [0, 0.7], [1, 0.3])

  return (
    <section ref={ref} className="relative bg-ink" style={{ height: '220vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden text-ivory">
        {/* ── Full-bleed scroll-scrubbed video ──────────────────────────── */}
        <video
          ref={videoRef}
          src="/images/Ghee_poured_on.mp4"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ backgroundColor: '#000' }}
        />

        {/* ── Readability overlays ──────────────────────────────────────── */}
        {/* Top darkening for masthead legibility */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(180deg, rgba(15,10,3,0.72) 0%, rgba(15,10,3,0.35) 22%, transparent 45%, transparent 60%, rgba(15,10,3,0.5) 85%, rgba(15,10,3,0.8) 100%)',
          }}
        />
        {/* Ambient gold glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-[-15%] right-[-15%] w-[900px] h-[900px] rounded-full opacity-[0.22] blur-[120px] z-10"
          style={{
            background:
              'radial-gradient(closest-side, #D4A84B 0%, #B8882A 40%, transparent 75%)',
          }}
        />
        {/* Edge vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(15,10,3,0.6) 100%)',
          }}
        />

        <GrainOverlay />

        {/* Gold hairline beneath navbar */}
        <div className="absolute top-[85px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent z-20" />

        {/* ══════════════════════════════════════════════════════════════
            Content — sits above the video
        ══════════════════════════════════════════════════════════════ */}
        <div className="relative h-full flex flex-col items-center z-20">
          {/* ── Masthead block (top third) ────────────────────────────── */}
          <div className="w-full flex flex-col items-center pt-[110px] md:pt-[130px] px-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.8 }}
              style={mounted ? { opacity: titleOpacity } : undefined}
              className="flex items-center gap-4 mb-6"
            >
              <span className="block w-10 h-px bg-gradient-to-r from-transparent to-gold" />
              <span className="text-[10px] tracking-[.45em] uppercase text-gold/90 font-medium">
                Toronto · Est. 2024
              </span>
              <span className="block w-10 h-px bg-gradient-to-l from-transparent to-gold" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.9 }}
              style={
                mounted
                  ? { y: titleY, opacity: titleOpacity, textShadow: '0 4px 24px rgba(0,0,0,0.55)' }
                  : { textShadow: '0 4px 24px rgba(0,0,0,0.55)' }
              }
              className="font-serif text-[clamp(48px,6.5vw,104px)] font-normal leading-[.92] tracking-[-0.025em] text-ivory text-center mb-3"
            >
              The art of{' '}
              <em
                className="italic bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(120deg, #F3D488 0%, #D4A84B 35%, #B8882A 65%, #8A6519 100%)',
                }}
              >
                paratha
              </em>
              <span className="text-gold">.</span>
            </motion.h1>
          </div>

          {/* ── Bottom block — CTAs + badge (bottom third) ─────────────── */}
          <div className="mt-auto w-full flex flex-col items-center pb-16 px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              style={mounted ? { opacity: ctaOpacity } : undefined}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <button
                onClick={() =>
                  document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="group relative overflow-hidden px-9 py-[16px] text-[11px] tracking-[.28em] uppercase font-medium text-ink"
                style={{
                  background:
                    'linear-gradient(120deg, #E8C77A 0%, #D4A84B 45%, #B8882A 100%)',
                  boxShadow:
                    '0 8px 30px -8px rgba(212,168,75,0.55), inset 0 1px 0 rgba(255,255,255,0.35)',
                }}
              >
                <span className="relative z-10">Build Your Box</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>

              <button
                onClick={() =>
                  document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="group px-9 py-[16px] text-[11px] tracking-[.28em] uppercase font-medium text-ivory border border-ivory/30 hover:border-gold hover:text-gold transition-colors duration-500 backdrop-blur-sm bg-ink/20"
              >
                Our Story
                <span className="inline-block ml-3 transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.8 }}
              style={mounted ? { opacity: ctaOpacity } : undefined}
              className="mt-6 flex justify-center"
            >
              <CertifiedBadge tone="dark" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════

function GrainOverlay() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.14] mix-blend-overlay z-10"
    >
      <filter id="hero-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#hero-grain)" />
    </svg>
  )
}
