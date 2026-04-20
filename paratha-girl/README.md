# Paratha Girl 🫓

A premium home-food delivery web app built with **Next.js 15**, **Supabase**, **Stripe**, **Zustand**, **Framer Motion**, and **Resend Email**.

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | Next.js 15 (App Router), Tailwind CSS, Framer Motion |
| State      | Zustand (persisted cart)                      |
| Backend/DB | Supabase (PostgreSQL + RLS)                   |
| Payments   | Stripe (Payment Intents + Webhooks) + COD     |
| Email      | Resend API (Order confirmations + Admin alerts) |
| Geocoding  | OpenStreetMap Nominatim (free, no API key)    |
| Fonts      | Playfair Display + DM Sans (Google Fonts)     |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout (fonts, metadata)
│   ├── page.tsx                    # Root redirect → /storefront
│   ├── globals.css                 # Tailwind + custom animations
│   ├── storefront/
│   │   └── page.tsx                # Main landing page (hero, menu, reviews)
│   ├── admin/
│   │   ├── page.tsx                # Admin dashboard (server, auth-gated)
│   │   ├── login/page.tsx          # Admin login
│   │   └── actions.ts              # Login / logout Server Actions
│   └── api/
│       ├── checkout/actions.ts     # createPaymentIntent Server Action (COD + Card)
│       ├── webhook/route.ts        # Stripe webhook → insert order + send emails
│       ├── slots/route.ts          # GET today's delivery slots
│       ├── validate-address/route.ts # POST address → geocode + distance
│       ├── reviews/route.ts        # GET published reviews for homepage
│       ├── admin/reviews/route.ts  # Admin CRUD for reviews
│       └── admin/orders/[id]/route.ts # PATCH order status + send confirmation email
├── components/
│   ├── ui/
│   │   ├── Navbar.tsx
│   │   ├── Ticker.tsx
│   │   ├── InfoStrip.tsx
│   │   ├── Footer.tsx
│   │   ├── Logo.tsx
│   │   └── CertifiedBadge.tsx
│   ├── menu/
│   │   ├── Hero.tsx
│   │   ├── MenuSection.tsx
│   │   ├── ProductCard.tsx
│   │   ├── StorySection.tsx
│   │   └── ReviewsSection.tsx      # Customer testimonials (animated roll-in)
│   ├── cart/
│   │   ├── CartPanel.tsx           # Slide-in cart drawer
│   │   ├── AddressChecker.tsx      # Geocode + 7km validation
│   │   └── SlotPicker.tsx          # 30-min slot grid + ASAP/scheduled
│   └── admin/
│       ├── AdminLogin.tsx
│       ├── AdminDashboard.tsx      # Order table + reviews manager
│       ├── AdminPreview.tsx        # Teaser on storefront
│       └── ReviewsManager.tsx      # Add / edit / publish / delete reviews
├── lib/
│   ├── supabase.ts                 # Supabase clients
│   ├── stripe.ts                   # Stripe singleton
│   ├── distance.ts                 # Haversine + geocoding
│   ├── products.ts                 # Product data + constants
│   ├── email.ts                    # Resend email templates
│   └── utils.ts                    # Helper functions
├── store/
│   └── cart.ts                     # Zustand cart store (persisted)
└── types/
    └── index.ts                    # All shared TypeScript types
supabase/
└── migrations/
    ├── 001_initial_schema.sql      # Orders, slots, fulfillment types
    └── 002_pickup_cod_reviews.sql  # Reviews table + COD/pickup columns
```

---

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url> paratha-girl
cd paratha-girl
npm install
```

### 2. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find |
|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page, "anon public" key |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page, "service_role" key (keep secret) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_SECRET_KEY` | Same page, secret key |
| `STRIPE_WEBHOOK_SECRET` | Created when you set up the webhook (step 5) |
| `NEXT_PUBLIC_KITCHEN_LAT` | Your home latitude (e.g. `43.7615`) |
| `NEXT_PUBLIC_KITCHEN_LNG` | Your home longitude (e.g. `-79.4111`) |
| `RESEND_API_KEY` | [Resend.com](https://resend.com) → API Keys |
| `ADMIN_EMAIL` | Your email for order notifications |
| `ADMIN_PASSWORD` | Strong password for admin dashboard |

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste + run both migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_pickup_cod_reviews.sql`
3. This creates `orders`, `delivery_slots`, and `reviews` tables with sample data

### 4. Set Up Resend Email

1. Sign up at [resend.com](https://resend.com)
2. Create an API key and add to `.env.local` as `RESEND_API_KEY`
3. For **development**: Use the test domain `onboarding@resend.dev` (no verification needed)
4. For **production**: Verify your domain at resend.com/domains and update the from address

### 5. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Set Up Stripe Webhook (local testing)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the webhook signing secret printed by the CLI into `STRIPE_WEBHOOK_SECRET`.

### 7. Deploy

```bash
# Vercel (recommended)
npx vercel --prod
```

Set all environment variables in the Vercel dashboard.

For Stripe webhooks, add your production URL:
`https://yourdomain.com/api/webhook` — event: `payment_intent.succeeded`

---

## Key Features

### 💳 Flexible Checkout
- **Dual Payment Methods**: Stripe card payments + Cash on Delivery (COD)
- **Fulfillment Options**: Home delivery (validated 7km radius) + Pickup
- **Order Scheduling**: ASAP or scheduled for specific 30-minute slots
- **Max Capacity**: 5 parathas per slot, enforced server-side via Supabase RPC

### 🌍 Smart Delivery
- Address geocoded server-side using OpenStreetMap Nominatim (no API key)
- Haversine formula calculates distance from kitchen
- Delivery radius configurable via `.env.local`
- Rejects orders outside service area with clear error message

### 📧 Email Notifications
- **Customer Receives**: Order confirmation + tracking link + payment details
- **Admin Alerts**: New order notification when customer places order
- **Status Updates**: Confirmation email sent when admin marks order as "confirmed"
- Powered by **Resend API** with HTML templates
- Non-blocking: Email errors don't prevent order creation

### ⭐ Customer Reviews
- **Public Reviews Section**: 5-star testimonials with animated roll-in
- **Admin Management**: Add/edit/publish/delete reviews from admin dashboard
- **Flexible Display**: Show/hide reviews per review
- Reviews stored in Supabase with RLS policies

### 🎛️ Admin Dashboard
- **Order Management**: Real-time order table with revenue stats
- **Status Workflow**: Click badge to advance: Pending → Confirmed → Preparing → Out for Delivery → Delivered
- **Testimonials**: Manage customer reviews directly from dashboard
- **Password Protected**: HTTP-only cookie-based authentication
- **Real-Time**: Auto-updates as orders are placed

### 🛒 Smart Cart
- **Persistent State**: Cart saved to localStorage via Zustand
- **Real-Time Validation**: Capacity checks on slot selection
- **Address Validation**: Live geocoding as customer types
- **Flexible Timing**: Choose ASAP or specific delivery slot

### 🎨 Premium UI/UX
- Custom serif fonts (Playfair Display) + sans-serif (DM Sans)
- Framer Motion animations throughout (hero, reviews, admin)
- Responsive design (mobile-first)
- Dark-themed admin with ambient glows + grain texture
- Loading states + error handling

---

## Database Schema

### Orders Table
```sql
orders (
  id uuid primary key,
  customer_name text,
  customer_email text,
  delivery_address text,        -- nullable for pickup
  items jsonb,                   -- {product_name, quantity, price}
  total_amount decimal,
  payment_method 'stripe' | 'cod',
  fulfillment_type 'delivery' | 'pickup',
  scheduled_for timestamptz,    -- null = ASAP
  status text,                   -- pending, confirmed, preparing, out_for_delivery, delivered, cancelled
  slot_id uuid references delivery_slots,
  created_at timestamptz
)
```

### Reviews Table
```sql
reviews (
  id uuid primary key,
  name text,
  location text,
  rating int (1-5),
  body text,
  is_published boolean,
  created_at timestamptz
)
```

---

## Customisation

### Change the menu items
Edit [src/lib/products.ts](src/lib/products.ts) — update name, price, description, image URL.

### Change kitchen location
Update `NEXT_PUBLIC_KITCHEN_LAT`, `NEXT_PUBLIC_KITCHEN_LNG`, `NEXT_PUBLIC_DELIVERY_RADIUS_KM` in `.env.local`.

### Modify email templates
Edit [src/lib/email.ts](src/lib/email.ts) — change subject lines, HTML layout, or add custom fields.

### Customize review display
Edit [src/components/menu/ReviewsSection.tsx](src/components/menu/ReviewsSection.tsx) — adjust grid layout, animation timing, or styling.

### Add more delivery slots
Re-run the seed block in [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql), or set up a Supabase Edge Function with pg_cron to generate slots daily.

### Replace admin auth
The current admin uses a simple password cookie. For production, replace with:
- Supabase Auth (magic link or OAuth)
- NextAuth.js
- Clerk

---

## API Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/checkout/actions.ts` | `POST` | Create payment intent (COD or Stripe) |
| `/api/webhook` | `POST` | Stripe payment success → insert order + emails |
| `/api/slots` | `GET` | Fetch today's delivery slots + capacity |
| `/api/validate-address` | `POST` | Geocode address + validate distance |
| `/api/reviews` | `GET` | Fetch published reviews for homepage |
| `/api/admin/reviews` | `GET/POST/PATCH/DELETE` | Manage reviews (auth required) |
| `/api/admin/orders/[id]` | `PATCH` | Update order status (auth required) |

---

## Troubleshooting

### Emails not sending (Resend 403 error)
**Problem**: "Domain is not verified" error
- **Solution**: 
  - For **dev**: Use test domain `onboarding@resend.dev` (no verification needed)
  - For **prod**: Verify your domain at [resend.com/domains](https://resend.com/domains), then update `from` address in `src/lib/email.ts`
  - **Test mode**: Resend test keys can only send to `logicconvert@gmail.com` — update `ADMIN_EMAIL` accordingly

### Delivery validation failing
**Problem**: "Address is outside delivery area" even though it's nearby
- **Solution**: 
  - Verify `NEXT_PUBLIC_KITCHEN_LAT` and `NEXT_PUBLIC_KITCHEN_LNG` are correct
  - Check `NEXT_PUBLIC_DELIVERY_RADIUS_KM` (default 7km)
  - Test with [maps.google.com](https://maps.google.com) to confirm coordinates

### Admin login not working
**Problem**: Password rejected
- **Solution**: 
  - Verify `ADMIN_PASSWORD` in `.env.local` matches what you entered
  - Check browser cookies: admin auth is stored as `admin_authed` HTTP-only cookie
  - Try incognito mode to rule out old cookie conflicts

### TypeScript errors in build
**Problem**: `Type 'X' is not assignable to type 'Y'`
- **Solution**: 
  - Run `npm run build` to see full errors
  - Most common: params type mismatch in dynamic routes (must be `Promise<{id: string}>`)
  - Clear `.next` folder: `rm -rf .next && npm run build`

### Stripe webhook not firing locally
**Problem**: Orders created but webhook doesn't trigger
- **Solution**: 
  - Verify Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhook`
  - Copy the signing secret from CLI into `STRIPE_WEBHOOK_SECRET`
  - Use Stripe dashboard test cards: `4242 4242 4242 4242`
  - Check logs: `npx stripe logs` to see webhook delivery

### Reviews not showing on homepage
**Problem**: ReviewsSection displays "Loading reviews..." indefinitely
- **Solution**: 
  - Check `/api/reviews` endpoint: `curl http://localhost:3000/api/reviews`
  - Verify `is_published = true` in database for reviews
  - Check browser console for fetch errors

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check (no emit) |

---

## License

Private — Paratha Girl, Toronto ON.
