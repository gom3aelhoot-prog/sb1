-- SB1 content marketplace, interactions and cover-image library
create extension if not exists pgcrypto;

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid references auth.users(id) on delete set null,
  specialty_id uuid references public.specialties(id) on delete set null,
  content_type text not null check (content_type in ('article','video','audio','book','course','session','other')),
  language_code text not null,
  title text not null,
  description text,
  body text,
  cover_url text,
  file_url text,
  is_paid boolean not null default false,
  price numeric(12,2) not null default 0,
  currency_code text not null default 'USD',
  offer_duration_days integer,
  buyers_count integer not null default 0,
  views_count integer not null default 0,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  shares_count integer not null default 0,
  downloads_count integer not null default 0,
  status text not null default 'draft' check (status in ('draft','pending','approved','rejected')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists content_items_language_idx on public.content_items(language_code);
create index if not exists content_items_specialty_idx on public.content_items(specialty_id);
create index if not exists content_items_type_idx on public.content_items(content_type);
create index if not exists content_items_status_idx on public.content_items(status);

create table if not exists public.content_pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  buyer_count integer not null check (buyer_count > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  currency_code text not null default 'USD',
  created_at timestamptz not null default now()
);
create index if not exists content_pricing_tiers_content_idx on public.content_pricing_tiers(content_item_id);

create table if not exists public.content_purchases (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  buyer_id uuid references auth.users(id) on delete set null,
  quantity integer not null default 1,
  amount numeric(12,2) not null default 0,
  currency_code text not null default 'USD',
  payment_reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists content_purchases_content_idx on public.content_purchases(content_item_id);

create table if not exists public.content_interactions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  interaction_type text not null check (interaction_type in ('view','like','favorite','comment','share','download','publish')),
  body text,
  created_at timestamptz not null default now()
);
create index if not exists content_interactions_content_idx on public.content_interactions(content_item_id);
create index if not exists content_interactions_user_idx on public.content_interactions(user_id);

create table if not exists public.content_image_library (
  id uuid primary key default gen_random_uuid(),
  specialty_id uuid references public.specialties(id) on delete cascade,
  language_code text not null default 'en',
  image_url text not null,
  title text not null,
  search_text text not null,
  image_number integer not null,
  created_at timestamptz not null default now(),
  unique(specialty_id, image_number, language_code)
);
create index if not exists content_image_library_specialty_idx on public.content_image_library(specialty_id);
create index if not exists content_image_library_search_idx on public.content_image_library using gin(to_tsvector('simple', search_text));

create table if not exists public.specialist_content_store_tiers (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid references auth.users(id) on delete set null,
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  buyer_count integer not null check (buyer_count > 0),
  total_price numeric(12,2) not null check (total_price >= 0),
  currency_code text not null default 'USD',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.content_submissions add column if not exists cover_library_id uuid references public.content_image_library(id) on delete set null;
alter table public.content_submissions add column if not exists offer_duration_days integer;
alter table public.content_submissions add column if not exists buyers_count integer not null default 0;

alter table public.content_items enable row level security;
alter table public.content_pricing_tiers enable row level security;
alter table public.content_purchases enable row level security;
alter table public.content_interactions enable row level security;
alter table public.content_image_library enable row level security;
alter table public.specialist_content_store_tiers enable row level security;

drop policy if exists "public approved content" on public.content_items;
create policy "public approved content" on public.content_items for select using (status='approved');

drop policy if exists "public image library" on public.content_image_library;
create policy "public image library" on public.content_image_library for select using (true);

drop policy if exists "public pricing tiers" on public.content_pricing_tiers;
create policy "public pricing tiers" on public.content_pricing_tiers for select using (true);

drop policy if exists "public content interactions read" on public.content_interactions;
create policy "public content interactions read" on public.content_interactions for select using (true);

drop policy if exists "authenticated content interactions write" on public.content_interactions;
create policy "authenticated content interactions write" on public.content_interactions for insert to authenticated with check (auth.uid() = user_id or user_id is null);

drop policy if exists "own purchases read" on public.content_purchases;
create policy "own purchases read" on public.content_purchases for select to authenticated using (auth.uid() = buyer_id);

drop policy if exists "public store tiers" on public.specialist_content_store_tiers;
create policy "public store tiers" on public.specialist_content_store_tiers for select using (active=true);

insert into public.content_image_library (specialty_id,language_code,image_url,title,search_text,image_number)
select s.id, 'multi',
  'https://loremflickr.com/900/600/medical,health,'||replace(s.name,' ','-')||'?lock='||((row_number() over())::bigint),
  'SB1 cover '||s.name||' #'||g.n,
  lower(coalesce(s.name,'medical')||' medical health cover '||g.n),
  g.n
from public.specialties s
cross join generate_series(1,500) g(n)
on conflict (specialty_id,image_number,language_code) do nothing;
