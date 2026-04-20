const ITEMS = [
  { label: 'Classic Butter Paratha', ornament: '01' },
  { label: 'Spiced Aloo Paratha',    ornament: '02' },
  { label: 'Paneer Masala Paratha',  ornament: '03' },
  { label: 'Delivered Within 7km',   ornament: '✦' },
  { label: 'Limited Slots Daily',    ornament: '∞' },
  { label: 'Fresh From Our Kitchen', ornament: '✦' },
]

export function Ticker() {
  const all = [...ITEMS, ...ITEMS]

  return (
    <div
      className="relative overflow-hidden whitespace-nowrap select-none py-[18px]"
      style={{ background: 'linear-gradient(180deg, #1A1208 0%, #0F0A03 100%)' }}
    >
      {/* Gold top + bottom hairlines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

      {/* Edge fade masks */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10"
        style={{ background: 'linear-gradient(90deg, #1A1208 0%, transparent 100%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10"
        style={{ background: 'linear-gradient(270deg, #1A1208 0%, transparent 100%)' }}
      />

      <div className="ticker-track">
        {all.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-[52px]">
            <span className="flex items-center gap-4">
              <span className="font-serif italic text-[13px] text-gold/80">
                {item.ornament}
              </span>
              <span className="text-[11px] tracking-[.3em] uppercase text-ivory/70 font-medium">
                {item.label}
              </span>
            </span>
            <span className="text-gold/50 text-[8px]">◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
