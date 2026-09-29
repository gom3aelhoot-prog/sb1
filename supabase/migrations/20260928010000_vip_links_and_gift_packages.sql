-- SB1 VIP links and customer gift packages
create table if not exists public.vip_links (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  account_type text not null default 'client' check (account_type in ('client','specialist','institution')),
  free_services integer not null default 0 check (free_services >= 0),
  free_services_remaining integer not null default 0 check (free_services_remaining >= 0),
  discount_percent numeric(5,2) not null default 0 check (discount_percent between 0 and 100),
  expires_at timestamptz,
  is_permanent boolean not null default false,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now()
);
create table if not exists public.gift_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  free_services integer not null default 0 check (free_services >= 0),
  discount_percent numeric(5,2) not null default 0 check (discount_percent between 0 and 100),
  account_type text not null default 'client' check (account_type in ('client','specialist','institution')),
  duration_days integer,
  price numeric(12,2) not null default 0,
  currency text not null default 'USD',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.gift_claims (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  package_id uuid references public.gift_packages(id),
  free_services_remaining integer not null default 0,
  discount_percent numeric(5,2) not null default 0,
  account_type text not null default 'client',
  expires_at timestamptz,
  status text not null default 'active',
  recipient_user_id uuid,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.vip_links enable row level security;
alter table public.gift_packages enable row level security;
alter table public.gift_claims enable row level security;
create policy if not exists "public active gift packages read" on public.gift_packages for select using (is_active = true);
create policy if not exists "public active gift claims read by code" on public.gift_claims for select using (status = 'active');
