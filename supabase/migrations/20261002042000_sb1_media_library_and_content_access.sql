create table if not exists public.sb1_media_library (
  id text primary key,
  page_id text not null,
  name text not null,
  url text not null,
  kind text not null check (kind in ('image','video','audio','gif','sticker')),
  source text,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

create index if not exists sb1_media_library_page_id_created_at_idx
  on public.sb1_media_library(page_id, created_at desc);

create table if not exists public.sb1_content_access (
  id uuid primary key default gen_random_uuid(),
  content_id text not null,
  content_type text not null,
  owner_page_id text not null,
  is_paid boolean not null default false,
  price numeric(12,2) not null default 0,
  currency_code text not null default 'USD',
  created_at timestamptz not null default now()
);

create index if not exists sb1_content_access_owner_idx
  on public.sb1_content_access(owner_page_id, content_type);

create table if not exists public.sb1_content_purchases (
  id uuid primary key default gen_random_uuid(),
  content_id text not null,
  buyer_id text not null,
  purchased_at timestamptz not null default now(),
  expires_at timestamptz
);

create unique index if not exists sb1_content_purchases_unique_idx
  on public.sb1_content_purchases(content_id, buyer_id);

alter table public.sb1_media_library enable row level security;
alter table public.sb1_content_access enable row level security;
alter table public.sb1_content_purchases enable row level security;

drop policy if exists "sb1_media_library_public_read" on public.sb1_media_library;
create policy "sb1_media_library_public_read"
on public.sb1_media_library for select
using (true);

drop policy if exists "sb1_media_library_authenticated_insert" on public.sb1_media_library;
create policy "sb1_media_library_authenticated_insert"
on public.sb1_media_library for insert
to authenticated
with check (true);

drop policy if exists "sb1_content_access_public_read" on public.sb1_content_access;
create policy "sb1_content_access_public_read"
on public.sb1_content_access for select
using (true);

drop policy if exists "sb1_content_purchases_owner_read" on public.sb1_content_purchases;
create policy "sb1_content_purchases_owner_read"
on public.sb1_content_purchases for select
to authenticated
using (buyer_id = auth.uid()::text);

drop policy if exists "sb1_content_purchases_authenticated_insert" on public.sb1_content_purchases;
create policy "sb1_content_purchases_authenticated_insert"
on public.sb1_content_purchases for insert
to authenticated
with check (buyer_id = auth.uid()::text);
