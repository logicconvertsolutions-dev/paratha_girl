# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

The actual Next.js project lives in a nested subdirectory: `paratha-girl/paratha-girl/`. All commands below must be run from that inner directory (where `package.json` lives).

## Commands

```bash
npm run dev         # Next.js dev server on :3000
npm run build       # Production build
npm run start       # Serve production build
npm run lint        # next lint (ESLint 9 + eslint-config-next)
npm run type-check  # tsc --noEmit (strict mode, no emit)
```

There is no test runner configured. When verifying changes, run `npm run type-check` and `npm run lint`.

For local Stripe webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/webhook
```
Paste the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

Supabase schema lives in [supabase/migrations/001_initial_schema.sql](supabase/migrations/001_initial_schema.sql) — run it manually in the Supabase SQL Editor (there is no migration CLI wired up).

## Architecture

**Next.js 15 App Router + React 19** with the `@/*` import alias pointing at [src/](src/).

### Three Supabase clients (one file, three uses)
[src/lib/supabase.ts](src/lib/supabase.ts) exports:
- `supabaseBrowser` — anon key, for client components
- `createServerSupabase()` — cookie-bound SSR client for Server Actions / Route Handlers (subject to RLS)
- `supabaseAdmin` — **service role key, bypasses RLS**, server-only. Used by the Stripe webhook and admin dashboard. Never import this from a client component.

RLS policies only allow public `select` on `delivery_slots` where `is_active = true`; all writes must go through `supabaseAdmin`.

### Checkout flow (two-phase: intent → webhook)
Money and slot capacity are both validated twice — once synchronously before payment, once asynchronously on the webhook. Understand both halves before touching either.

1. Client calls `createPaymentIntent` Server Action in [src/app/api/checkout/actions.ts](src/app/api/checkout/actions.ts). It re-derives prices from the server-side `PRODUCTS` constant (client-sent prices are ignored), checks `isWithinDeliveryZone` via Haversine, and reads the slot's remaining capacity. On success it returns a Stripe `clientSecret`.
2. Client completes payment with Stripe Elements.
3. Stripe POSTs `payment_intent.succeeded` to [src/app/api/webhook/route.ts](src/app/api/webhook/route.ts). The webhook re-parses `metadata.items_json`, inserts an `orders` row, and calls the `increment_slot_booked` Postgres RPC (atomic server-side increment — do not replace with a read-modify-write).

Order details the webhook needs (items, slot_id, delivery_address) are carried through Stripe's `metadata` field on the PaymentIntent. Keep payload sizes in mind — Stripe metadata is capped.

### Capacity rule
`MAX_PER_SLOT = 5` parathas per 30-minute window ([src/lib/products.ts](src/lib/products.ts)). Enforced in three places — keep them in sync:
- DB column default `delivery_slots.capacity = 5`
- Server validation in `createPaymentIntent`
- Client rendering in the slot picker

### Product catalog is code, not DB
[src/lib/products.ts](src/lib/products.ts) is the source of truth for menu items. The DB stores only orders and delivery slots; product IDs/names/prices referenced by `orders.items` (JSONB) are denormalized snapshots. To change the menu, edit the constant — no migration needed.

### Cart state
[src/store/cart.ts](src/store/cart.ts) — Zustand with `persist` middleware under localStorage key `paratha-girl-cart`. Client-only (`'use client'`). The cart is never sent as authoritative data; the server re-looks-up products by id.

### Admin auth
Intentionally minimal: a single `ADMIN_PASSWORD` env var compared in [src/app/admin/actions.ts](src/app/admin/actions.ts), which sets an `admin_authed=true` HTTP-only cookie (8h TTL). [src/app/admin/page.tsx](src/app/admin/page.tsx) checks the cookie and redirects to `/admin/login` if missing. The README flags this as replaceable for production (Supabase Auth / NextAuth / Clerk).

### Geocoding
[src/lib/distance.ts](src/lib/distance.ts) calls OpenStreetMap Nominatim with a 1-hour `next.revalidate` cache. Nominatim has a ~1 req/s rate limit and requires a User-Agent — both are respected. Only call `geocodeAddress` from server code.

## Environment variables

See [.env.local.example](.env.local.example). Required at runtime (app will throw on cold start if missing): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `ADMIN_PASSWORD`. `NEXT_PUBLIC_KITCHEN_LAT/LNG` have fallbacks (Toronto) but should be set explicitly.
