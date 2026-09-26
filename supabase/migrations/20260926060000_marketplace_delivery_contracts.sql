-- SB1: pharmacy delivery accounts, institution media/reviews, legal acceptance and service operations.
create table if not exists public.delivery_workers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  email text not null,
  phone text,
  country_code text,
  language_code text,
  vehicle_type text,
  status text not null default 'pending' check (status in ('pending','active','suspended','inactive')),
  documents jsonb not null default '[]'::jsonb,
  contract_id uuid references public.contracts(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists delivery_workers_country_status_idx on public.delivery_workers(country_code,status);

create table if not exists public.pharmacy_orders (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid,
  customer_email text,
  customer_name text,
  country_code text,
  language_code text,
  fulfillment_type text not null default 'pickup' check (fulfillment_type in ('pickup','handover','delivery')),
  pickup_location text,
  delivery_address text,
  requested_pickup_at timestamptz,
  status text not null default 'pending' check (status in ('pending','paid','preparing','ready','assigned','out_for_delivery','completed','cancelled')),
  subtotal numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency_code text not null default 'USD',
  payment_status text not null default 'pending',
  delivery_worker_id uuid references public.delivery_workers(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.pharmacy_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.pharmacy_orders(id) on delete cascade,
  product_id uuid,
  product_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.institution_media (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid,
  media_type text not null check (media_type in ('image','video')),
  media_url text not null,
  language_code text,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.institution_reviews (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid,
  customer_email text,
  rating integer not null check (rating between 1 and 5),
  body text,
  language_code text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.institution_complaints (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid,
  customer_email text,
  category text not null,
  body text not null,
  status text not null default 'open' check (status in ('open','under_review','resolved','rejected')),
  resolution text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.contract_acceptances (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid references public.contracts(id) on delete cascade,
  subject_type text not null,
  subject_id uuid,
  subject_email text,
  language_code text not null default 'ar',
  signature_name text not null,
  signed_at timestamptz not null default now(),
  ip_hash text,
  terms_version integer not null default 1
);

create table if not exists public.institution_jobs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid,
  title text not null,
  description text,
  location text,
  job_type text,
  salary_range text,
  requirements text,
  language_code text not null default 'ar',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists pharmacy_orders_status_idx on public.pharmacy_orders(status,created_at desc);
create index if not exists institution_media_idx on public.institution_media(institution_id,sort_order);
create index if not exists institution_reviews_idx on public.institution_reviews(institution_id,created_at desc);
create index if not exists institution_complaints_idx on public.institution_complaints(institution_id,status);
create index if not exists institution_jobs_idx on public.institution_jobs(institution_id,is_active,created_at desc);

alter table public.delivery_workers enable row level security;
alter table public.pharmacy_orders enable row level security;
alter table public.pharmacy_order_items enable row level security;
alter table public.institution_media enable row level security;
alter table public.institution_reviews enable row level security;
alter table public.institution_complaints enable row level security;
alter table public.contract_acceptances enable row level security;
alter table public.institution_jobs enable row level security;

do $$
declare t text;
begin
  foreach t in array array['delivery_workers','pharmacy_orders','pharmacy_order_items','institution_media','institution_reviews','institution_complaints','contract_acceptances','institution_jobs'] loop
    execute format('drop policy if exists "sb1 public catalog access %s" on public.%I',t,t);
    execute format('create policy "sb1 public catalog access %s" on public.%I for all to anon, authenticated using (true) with check (true)',t,t);
  end loop;
end $$;

do $$
begin
  if to_regclass('public.tracking_sessions') is not null then
    if not exists (select 1 from pg_constraint where conname='tracking_sessions_worker_id_fkey') then
      alter table public.tracking_sessions add constraint tracking_sessions_worker_id_fkey foreign key(worker_id) references public.delivery_workers(id) on delete set null;
    end if;
  end if;
end $$;
