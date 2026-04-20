-- ============================================================
-- Paratha Girl — Supabase Schema
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Enable UUID extension ─────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Delivery Slots ────────────────────────────────────────────────────────────
create table if not exists public.delivery_slots (
  id          uuid primary key default gen_random_uuid(),
  label       text        not null,           -- "12:00 pm – 12:30 pm"
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  capacity    int         not null default 5,
  booked      int         not null default 0,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

comment on table public.delivery_slots is
  'Available 30-minute delivery windows. Max 5 parathas per slot.';

-- ── Orders ────────────────────────────────────────────────────────────────────
create type public.order_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

create table if not exists public.orders (
  id                        uuid primary key default gen_random_uuid(),
  customer_name             text        not null default '',
  customer_email            text        not null default '',
  customer_phone            text,
  delivery_address          text        not null,
  delivery_lat              numeric(10, 7),
  delivery_lng              numeric(10, 7),
  slot_id                   uuid        references public.delivery_slots(id) on delete set null,
  slot_label                text,
  items                     jsonb       not null default '[]',
  total_amount              numeric(10, 2) not null,
  status                    public.order_status not null default 'pending',
  stripe_payment_intent_id  text        unique,
  stripe_payment_status     text,
  notes                     text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

comment on table public.orders is
  'Customer orders. items is a JSONB array of {product_id, product_name, quantity, unit_price, subtotal}.';

-- ── Auto-update updated_at ────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ── Increment booked count (called from webhook) ──────────────────────────────
create or replace function public.increment_slot_booked(
  p_slot_id uuid,
  p_amount  int default 1
)
returns void language plpgsql security definer as $$
begin
  update public.delivery_slots
  set    booked = booked + p_amount
  where  id     = p_slot_id;
end;
$$;

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.delivery_slots enable row level security;
alter table public.orders         enable row level security;

-- Public can read available slots
create policy "Public can read active slots"
  on public.delivery_slots for select
  using (is_active = true);

-- Service role only for mutations (webhook + admin use supabaseAdmin which bypasses RLS)
create policy "Service role full access on slots"
  on public.delivery_slots for all
  using (auth.role() = 'service_role');

create policy "Service role full access on orders"
  on public.orders for all
  using (auth.role() = 'service_role');

-- ── Seed: Generate today's slots ──────────────────────────────────────────────
-- Re-run this daily (or set up a pg_cron job / Edge Function scheduled task)
do $$
declare
  slot_date date := current_date;
  slot_hour int;
  slot_min  int;
  slot_start timestamptz;
  slot_end   timestamptz;
  slot_label text;
begin
  -- 11:00 am – 8:00 pm in 30-min intervals
  for slot_hour in 11..19 loop
    foreach slot_min in array array[0, 30] loop
      slot_start := (slot_date::text || ' ' || lpad(slot_hour::text,2,'0') || ':' || lpad(slot_min::text,2,'0') || ':00')::timestamptz at time zone 'America/Toronto';
      slot_end   := slot_start + interval '30 minutes';

      -- Format label: "11:00 am – 11:30 am"
      slot_label := to_char(slot_start at time zone 'America/Toronto', 'HH12:MI am')
        || ' – '
        || to_char(slot_end at time zone 'America/Toronto', 'HH12:MI am');

      insert into public.delivery_slots (label, start_time, end_time, capacity, booked)
      values (slot_label, slot_start, slot_end, 5, 0)
      on conflict do nothing;
    end loop;
  end loop;
end;
$$;
