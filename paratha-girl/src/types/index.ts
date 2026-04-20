// ─── Product ─────────────────────────────────────────────────────────────────
export type ProductCategory = 'paratha' | 'drink'

export interface SidesConfig {
  free:       number      // how many sides are included in the price
  options:    string[]    // e.g. ['Butter', 'Yogurt', 'Pickle']
  extraPrice: number      // price per extra side beyond the free count
}

export interface Product {
  id:          number
  slug:        string
  name:        string
  tagline:     string
  description: string
  price:       number
  category:    ProductCategory
  sides?:      SidesConfig
  badge?:      string
  image:       string
  available:   boolean
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
// A line represents a unique (product, sides, extras) combination. Two lines
// may share the same product when the buyer wants different side pairings.
export interface CartItem {
  lineId:   string
  product:  Product
  quantity: number
  sides:    string[]   // free sides chosen from product.sides.options
  extras:   string[]   // additional sides at extraPrice each
}

export interface CartState {
  items:      CartItem[]
  hydrated:   boolean
  addItem:    (
    product:  Product,
    quantity: number,
    sides?:   string[],
    extras?:  string[],
  ) => void
  removeItem: (lineId: string) => void
  updateQty:  (lineId: string, quantity: number) => void
  clearCart:  () => void
  total:      () => number
  totalItems: () => number
  setHydrated: (hydrated: boolean) => void
}

// Cost of one line, used both client and server.
export function lineTotal(item: CartItem): number {
  const extraPrice = item.product.sides?.extraPrice ?? 0
  const unit = item.product.price + extraPrice * item.extras.length
  return +(unit * item.quantity).toFixed(2)
}

// ─── Slot (legacy, unused in new flow — kept for type compat) ───────────────
export interface DeliverySlot {
  id:         string
  label:      string
  start_time: string
  capacity:   number
  booked:     number
  available:  boolean
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type FulfillmentType = 'pickup' | 'delivery'
export type PaymentMethod   = 'stripe' | 'cod'

export interface OrderItem {
  product_id:   number
  product_name: string
  quantity:     number
  unit_price:   number        // includes per-piece extras cost
  subtotal:     number
  sides:        string[]
  extras:       string[]
}

export interface Order {
  id:                        string
  customer_name:             string
  customer_email:            string
  customer_phone:            string
  fulfillment_type:          FulfillmentType
  delivery_address:          string | null
  delivery_lat:              number | null
  delivery_lng:              number | null
  scheduled_for:             string | null      // ISO; null = ASAP
  payment_method:            PaymentMethod
  items:                     OrderItem[]
  total_amount:              number
  status:                    OrderStatus
  stripe_payment_intent_id?: string | null
  stripe_payment_status?:    string | null
  notes?:                    string | null
  created_at:                string
  updated_at:                string
  // legacy — still present in DB but unused in new flow
  slot_id?:                  string | null
  slot_label?:               string | null
}

// ─── Checkout ────────────────────────────────────────────────────────────────
export interface CheckoutItemPayload {
  product_id: number
  quantity:   number
  sides:      string[]
  extras:     string[]
}

export interface CheckoutPayload {
  items:            CheckoutItemPayload[]
  customer_name:    string
  customer_email:   string
  customer_phone:   string
  fulfillment_type: FulfillmentType
  delivery_address: string | null
  delivery_lat:     number | null
  delivery_lng:     number | null
  scheduled_for:    string | null
  payment_method:   PaymentMethod
  slot_id?:         string
  notes?:           string
}

export interface CreatePaymentIntentResult {
  clientSecret:    string
  paymentIntentId: string
  amount:          number
}

export interface CreateCodOrderResult {
  orderId: string
  amount:  number
}

// ─── Address Validation ───────────────────────────────────────────────────────
export interface AddressValidationResult {
  valid:      boolean
  distanceKm: number
  address:    string
  lat:        number
  lng:        number
  message:    string
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export interface Review {
  id:            string
  name:          string
  location:      string | null
  rating:        number          // 1..5
  body:          string
  is_published:  boolean
  created_at:    string
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export interface AdminStats {
  today_orders:    number
  today_revenue:   number
  pending_count:   number
  preparing_count: number
}
