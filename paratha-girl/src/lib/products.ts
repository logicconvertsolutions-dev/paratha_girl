import type { Product, SidesConfig } from '@/types'

// All parathas come with a choice of 2 of the 3 classic sides. Extras are 50¢.
export const PARATHA_SIDES: SidesConfig = {
  free:       2,
  options:    ['Butter', 'Yogurt', 'Pickle'],
  extraPrice: 0.5,
}

export const PRODUCTS: Product[] = [
  {
    id:          1,
    slug:        'aloo-paratha',
    name:        'Aloo Paratha',
    tagline:     'Comfort in every layer',
    description:
      'Seasoned potato stuffed inside a hand-layered whole-wheat paratha. Crisp outside, pillowy within.',
    price:       5,
    category:    'paratha',
    sides:       PARATHA_SIDES,
    badge:       'Bestseller',
    image:       '/images/product-aloo.jpg',
    available:   true,
  },
  {
    id:          2,
    slug:        'gobi-paratha',
    name:        'Gobi Paratha',
    tagline:     'Spiced cauliflower, made fresh',
    description:
      'Hand-grated cauliflower with ginger, chili, and coriander — folded into a flaky paratha.',
    price:       6,
    category:    'paratha',
    sides:       PARATHA_SIDES,
    image:       '/images/product-butter.jpg',
    available:   true,
  },
  {
    id:          3,
    slug:        'mooli-paratha',
    name:        'Mooli Paratha',
    tagline:     'Radish, zing, crunch',
    description:
      'Freshly grated daikon radish, squeezed and spiced, wrapped in a crisp tawa-cooked paratha.',
    price:       6,
    category:    'paratha',
    sides:       PARATHA_SIDES,
    image:       '/images/product-butter.jpg',
    available:   true,
  },
  {
    id:          4,
    slug:        'methi-paratha',
    name:        'Methi Paratha',
    tagline:     'Fenugreek greens, earthy warmth',
    description:
      'Fresh methi leaves kneaded into whole-wheat dough with cumin — subtly bitter, deeply warming.',
    price:       5,
    category:    'paratha',
    sides:       PARATHA_SIDES,
    image:       '/images/product-butter.jpg',
    available:   true,
  },
  {
    id:          5,
    slug:        'paneer-paratha',
    name:        'Paneer Paratha',
    tagline:     'Rich, creamy, satisfying',
    description:
      'Fresh cottage cheese blended with garam masala and cilantro, sealed inside a golden paratha.',
    price:       6,
    category:    'paratha',
    sides:       PARATHA_SIDES,
    badge:       "Chef's Pick",
    image:       '/images/product-paneer.jpg',
    available:   true,
  },
  {
    id:          6,
    slug:        'mango-lassi',
    name:        'Mango Lassi',
    tagline:     'Cold, thick, sunshine',
    description:
      'Blended Alphonso mango with yogurt and a whisper of cardamom. Served cold.',
    price:       4,
    category:    'drink',
    image:       '/images/product-butter.jpg',
    available:   true,
  },
  {
    id:          7,
    slug:        'masala-chai',
    name:        'Masala Chai',
    tagline:     'Slow-brewed, house spice',
    description:
      'Assam tea simmered with ginger, cardamom, clove, and cinnamon. Served hot.',
    price:       1.5,
    category:    'drink',
    image:       '/images/product-butter.jpg',
    available:   true,
  },
]

export const KITCHEN_COORDS = {
  lat: parseFloat(process.env.NEXT_PUBLIC_KITCHEN_LAT ?? '43.7615'),
  lng: parseFloat(process.env.NEXT_PUBLIC_KITCHEN_LNG ?? '-79.4111'),
}

export const DELIVERY_RADIUS_KM = parseFloat(
  process.env.NEXT_PUBLIC_DELIVERY_RADIUS_KM ?? '7'
)

export const MAX_PER_SLOT = 5
