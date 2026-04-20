interface Props {
  /** 'dark' for dark backgrounds (gold on ink), 'light' for ivory backgrounds. */
  tone?:      'dark' | 'light'
  className?: string
  label?:     string
  detail?:    string
}

export function CertifiedBadge({
  tone = 'dark',
  className = '',
  label  = 'Food Handler Certified',
  detail = 'Toronto Public Health',
}: Props) {
  const isDark = tone === 'dark'

  return (
    <span
      className={[
        'inline-flex items-center gap-3 px-4 py-2.5 border',
        isDark ? 'border-gold/35' : 'border-forest/25',
        className,
      ].join(' ')}
      style={{
        background: isDark
          ? 'linear-gradient(120deg, rgba(26,18,8,0.55) 0%, rgba(15,10,3,0.35) 100%)'
          : 'linear-gradient(120deg, rgba(249,244,236,0.9) 0%, rgba(249,244,236,0.7) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <ShieldCheck tone={tone} />
      <span className="flex flex-col leading-tight">
        <span
          className={[
            'text-[10px] tracking-[.3em] uppercase font-medium',
            isDark ? 'text-ivory/80' : 'text-forest',
          ].join(' ')}
        >
          {label}
        </span>
        <span
          className={[
            'text-[8.5px] tracking-[.22em] uppercase mt-0.5 font-light',
            isDark ? 'text-ivory/40' : 'text-muted',
          ].join(' ')}
        >
          {detail}
        </span>
      </span>
    </span>
  )
}

function ShieldCheck({ tone }: { tone: 'dark' | 'light' }) {
  const stroke = tone === 'dark' ? '#D4A84B' : '#1E3B2F'
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ filter: tone === 'dark' ? 'drop-shadow(0 0 6px rgba(212,168,75,0.35))' : undefined }}
    >
      <path
        d="M12 2.5 L3.5 5.5 V11.5 C3.5 16.5 7.5 20.5 12 21.5 C16.5 20.5 20.5 16.5 20.5 11.5 V5.5 Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 12 L11 15 L16.5 9"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
