-- SB1 delivery system: orders, assignments, tracking, disputes, payouts and institution controls.
create extension if not exists pgcrypto;

create table if not exists public.sb1_delivery_workers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text,
  city text,
  country_code text,
  language_code text,
  status text not null default 'pending' check (status in ('pending','active','suspended','rejected')),
  documents jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_delivery_institution_settings (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid,
  enabled boolean not null default false,
  worker_policy text not null default 'all' check (worker_policy in ('all','selected','institution_workers')),
  payment_methods text[] not null default array['online','cod'],
  worker_fee_type text not null default 'fixed' check (worker_fee_type in ('fixed','percent')),
  worker_fee_value numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  service_cities text[] not null default '{}',
  documents jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.sb1_delivery_orders (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid,
  client_id uuid references auth.users(id) on delete set null,
  worker_id uuid references public.sb1_delivery_workers(id) on delete set null,
  institution_name text not null,
  institution_address text,
  customer_name text not null,
  customer_address text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  worker_fee_type text not null default 'fixed' check (worker_fee_type in ('fixed','percent')),
  worker_fee_value numeric(12,2) not null default 0,
  payment_method text not null check (payment_method in ('online','cod')),
  payment_status text not null default 'held' check (payment_status in ('held','cod_pending','released','refunded','disputed')),
  status text not null default 'created' check (status in ('created','accepted','picked_up','on_route','delivered','disputed','cancelled')),
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sb1_delivery_assignments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.sb1_delivery_orders(id) on delete cascade,
  worker_id uuid not null references public.sb1_delivery_workers(id) on delete cascade,
  status text not null default 'offered' check (status in ('offered','accepted','rejected','expired','completed')),
  offered_at timestamptz not null default now(),
  responded_at timestamptz
);

create table if not exists public.sb1_delivery_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.sb1_delivery_orders(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text not null,
  event_type text not null,
  latitude numeric(10,7),
  longitude numeric(10,7),
  note text,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_delivery_disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.sb1_delivery_orders(id) on delete cascade,
  opened_by uuid references auth.users(id) on delete set null,
  reason text not null,
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'investigating' check (status in ('investigating','resolved_client','resolved_institution','resolved_worker','dismissed')),
  resolution text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.sb1_delivery_payouts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.sb1_delivery_orders(id) on delete cascade,
  institution_amount numeric(12,2) not null default 0,
  worker_amount numeric(12,2) not null default 0,
  platform_amount numeric(12,2) not null default 0,
  status text not null default 'held' check (status in ('held','released','frozen','refunded')),
  release_reason text,
  released_at timestamptz
);

create index if not exists sb1_delivery_orders_status_idx on public.sb1_delivery_orders(status);
create index if not exists sb1_delivery_orders_worker_idx on public.sb1_delivery_orders(worker_id);
create index if not exists sb1_delivery_events_order_idx on public.sb1_delivery_events(order_id,created_at desc);
create index if not exists sb1_delivery_disputes_order_idx on public.sb1_delivery_disputes(order_id);

-- Release is intentionally a server-side operation: clients must never be able to
-- directly mark a held payout as released. Production payment provider webhooks
-- should call a privileged backend function after delivery confirmation/dispute review.
