-- ============================================================
-- Paratha Girl — Migration 002
-- Adds pickup/delivery + COD + immediate/scheduled orders, plus a reviews table.
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Orders: new columns ──────────────────────────────────────────────────────
alter table public.orders
  add column if not exists fulfillment_type text not null default 'delivery',
  add column if not exists payment_method   text not null default 'stripe',
  add column if not exists scheduled_for    timestamptz;

-- Valid enum-like values
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'orders_fulfillment_type_check') then
    alter table public.orders
      add constraint orders_fulfillment_type_check
      check (fulfillment_type in ('pickup', 'delivery'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'orders_payment_method_check') then
    alter table public.orders
      add constraint orders_payment_method_check
      check (payment_method in ('stripe', 'cod'));
  end if;
end $$;

-- Pickup orders don't have a delivery address, so make it nullable.
alter table public.orders alter column delivery_address drop not null;

-- slot_id is already nullable (it references delivery_slots on delete set null),
-- and the app no longer writes to it. No change needed.

comment on column public.orders.fulfillment_type is 'pickup | delivery';
comment on column public.orders.payment_method   is 'stripe | cod';
comment on column public.orders.scheduled_for    is 'If null, the order is ASAP. Otherwise scheduled for this time.';

-- ── Reviews table ────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  location     text,
  rating       int  not null check (rating between 1 and 5),
  body         text not null,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

comment on table public.reviews is 'Customer testimonials managed from the admin dashboard.';

alter table public.reviews enable row level security;

drop policy if exists "Public can read published reviews" on public.reviews;
create policy "Public can read published reviews"
  on public.reviews for select
  using (is_published = true);

drop policy if exists "Service role full access on reviews" on public.reviews;
create policy "Service role full access on reviews"
  on public.reviews for all
  using (auth.role() = 'service_role');

-- ── Seed a few sample reviews (idempotent) ───────────────────────────────────
insert into public.reviews (name, location, rating, body, is_published)
select * from (values
  ('Priya S.',   'North York',  5, 'The aloo paratha tastes like my nani''s. Delivered still warm. I''ve ordered four times in two weeks.', true),
  ('Daniel K.',  'Scarborough', 5, 'Lamination is next level. Crisp shell, soft centre, and the yoghurt is actually thick. Will be back.',      true),
  ('Aisha R.',   'Thornhill',   5, 'Ordered the paneer paratha for a Sunday brunch. Kids fought over the last one. High praise.',               true),
  ('Marcus T.',  'Etobicoke',   4, 'Great flavour, portion is generous. Pickup was smooth and the mango lassi was cold and thick.',             true)
) as v(name, location, rating, body, is_published)
where not exists (select 1 from public.reviews limit 1);
