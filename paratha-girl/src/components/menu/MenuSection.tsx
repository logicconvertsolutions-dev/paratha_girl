import type { Product } from '@/types'
import { ProductCard } from './ProductCard'

interface Props {
  products: Product[]
}

export function MenuSection({ products }: Props) {
  const parathas = products.filter((p) => p.category === 'paratha')
  const drinks   = products.filter((p) => p.category === 'drink')

  return (
    <section id="menu" className="px-[60px] py-[110px]">
      {/* Masthead */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end mb-[72px] pb-10 border-b border-forest/14">
        <div>
          <p className="text-[10px] tracking-[.35em] uppercase text-gold font-medium mb-4">
            Hand-Laminated, Tawa-Cooked
          </p>
          <h2 className="font-serif text-[clamp(42px,4.5vw,68px)] font-normal leading-[.95] text-forest">
            Our <em className="italic text-spice">Menu</em>
          </h2>
        </div>
        <p className="text-[13px] text-muted leading-[1.75] font-light max-w-xs md:text-right">
          Every paratha comes with two of our classic sides — butter, yogurt, or
          pickle. The third is fifty cents.
        </p>
      </div>

      {/* Parathas */}
      <div className="flex items-center gap-4 mb-9">
        <span className="text-[11px] tracking-[.35em] uppercase text-forest font-medium">
          Parathas
        </span>
        <span className="flex-1 h-px bg-forest/15" />
        <span className="text-[10px] tracking-[.25em] uppercase text-muted">
          {parathas.length} items · $5–6
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mb-20">
        {parathas.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Drinks */}
      {drinks.length > 0 && (
        <>
          <div className="flex items-center gap-4 mb-9">
            <span className="text-[11px] tracking-[.35em] uppercase text-forest font-medium">
              Drinks
            </span>
            <span className="flex-1 h-px bg-forest/15" />
            <span className="text-[10px] tracking-[.25em] uppercase text-muted">
              {drinks.length} items
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {drinks.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
