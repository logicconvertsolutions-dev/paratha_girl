import Image from 'next/image'

interface Props {
  size?:      number
  className?: string
  priority?:  boolean
  alt?:       string
}

export function Logo({
  size = 48,
  className = '',
  priority = false,
  alt = 'Paratha Girl',
}: Props) {
  return (
    <span
      className={`relative inline-block rounded-full overflow-hidden ring-1 ring-gold/40 ${className}`}
      style={{
        width:  size,
        height: size,
        boxShadow: '0 6px 18px -6px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(212,168,75,0.15)',
      }}
    >
      <Image
        src="/images/Logo.png"
        alt={alt}
        width={size * 3}
        height={size * 3}
        priority={priority}
        quality={95}
        className="w-full h-full object-cover"
      />
    </span>
  )
}
