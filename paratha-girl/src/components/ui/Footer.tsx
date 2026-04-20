import { Logo } from '@/components/ui/Logo'
import { CertifiedBadge } from '@/components/ui/CertifiedBadge'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0F0A03 0%, #1A1208 100%)' }}
    >
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/2 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full opacity-[0.12] blur-[160px]"
        style={{ background: 'radial-gradient(closest-side, #D4A84B 0%, transparent 70%)' }}
      />

      <GrainOverlay />

      {/* Top gold hairline */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="relative max-w-[1400px] mx-auto px-8 md:px-[60px]">
        {/* ── Masthead ─────────────────────────────────────────────────── */}
        <div className="pt-24 pb-16 text-center border-b border-ivory/08">
          <p className="text-[10px] tracking-[.5em] uppercase text-gold/80 font-medium mb-8">
            Paratha · Girl · Toronto
          </p>

          <h2 className="font-serif text-[clamp(72px,10vw,160px)] leading-[.9] font-normal tracking-[-0.025em] text-ivory">
            A single
            <br />
            <em
              className="italic bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(120deg, #F3D488 0%, #D4A84B 35%, #B8882A 65%, #8A6519 100%)',
              }}
            >
              kitchen
            </em>
            <span className="text-gold">.</span>
          </h2>

          <p className="text-[13px] tracking-[.08em] text-ivory/45 mt-10 max-w-[500px] mx-auto font-light leading-[1.9]">
            Hand-laminated, tawa-cooked, delivered within seven kilometres.
            <br />
            We&rsquo;d love to make you one.
          </p>
        </div>

        {/* ── Link columns ─────────────────────────────────────────────── */}
        <div className="py-14 grid grid-cols-2 md:grid-cols-4 gap-10 border-b border-ivory/08">
          <FooterColumn
            title="Shop"
            links={[
              ['Menu',         '#menu'],
              ['Story',        '#story'],
              ['Delivery',     '#delivery'],
            ]}
          />
          <FooterColumn
            title="Kitchen"
            links={[
              ['About',        '#story'],
              ['How It Works', '#delivery'],
              ['Hours',        '#delivery'],
            ]}
          />
          <FooterColumn
            title="Contact"
            links={[
              ['hello@parathagirl.ca', 'mailto:hello@parathagirl.ca'],
              ['Instagram',            'https://instagram.com'],
              ['North York, ON',       '#'],
            ]}
          />
          <FooterColumn
            title="Operations"
            links={[
              ['Admin Portal', '/admin'],
              ['Press Kit',    '#'],
              ['Careers',      '#'],
            ]}
          />
        </div>

        {/* ── Credentials row ──────────────────────────────────────────── */}
        <div className="py-8 flex items-center justify-center gap-4 border-b border-ivory/08">
          <span className="hidden md:block flex-1 h-px bg-gradient-to-r from-transparent via-gold/20 to-gold/40 max-w-[180px]" />
          <CertifiedBadge tone="dark" />
          <span className="hidden md:block flex-1 h-px bg-gradient-to-l from-transparent via-gold/20 to-gold/40 max-w-[180px]" />
        </div>

        {/* ── Meta row ─────────────────────────────────────────────────── */}
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Logo size={96} />
            <div className="leading-tight">
              <p className="font-serif text-[20px] text-ivory">
                Paratha <span className="italic text-gold">Girl</span>
              </p>
              <p className="text-[9px] tracking-[.38em] uppercase text-ivory/50 mt-1">
                Fresh · Flaky · Famous
              </p>
            </div>
          </div>

          <p className="text-[10px] tracking-[.25em] uppercase text-ivory/35 text-center">
            &copy; {year} Paratha Girl &nbsp;·&nbsp; Toronto, Ontario &nbsp;·&nbsp; All rights reserved
          </p>

          <div className="flex gap-3">
            <SocialIcon href="https://instagram.com" label="Instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
            </SocialIcon>
            <SocialIcon href="#" label="Tiktok">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 8.2a6.7 6.7 0 0 1-4-1.3v7.5a5.6 5.6 0 1 1-5.6-5.6h.6v3a2.6 2.6 0 1 0 2 2.5V2h2.9a4 4 0 0 0 4 4v2.2z" />
              </svg>
            </SocialIcon>
            <SocialIcon href="mailto:hello@parathagirl.ca" label="Email">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 5h18v14H3z" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: [string, string][]
}) {
  return (
    <div>
      <p className="text-[10px] tracking-[.4em] uppercase text-gold font-medium mb-5">
        {title}
      </p>
      <ul className="space-y-3">
        {links.map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              className="text-[12px] tracking-[.08em] text-ivory/55 hover:text-gold transition-colors duration-300 inline-flex items-center gap-2 group"
            >
              {label}
              <span className="inline-block w-0 h-px bg-gold group-hover:w-4 transition-all duration-500" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialIcon({
  href,
  children,
  label,
}: {
  href: string
  children: React.ReactNode
  label: string
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-10 h-10 flex items-center justify-center border border-ivory/15 text-ivory/50 hover:text-gold hover:border-gold/50 transition-all duration-300"
    >
      {children}
    </a>
  )
}

function GrainOverlay() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.1] mix-blend-overlay"
    >
      <filter id="footer-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#footer-grain)" />
    </svg>
  )
}
