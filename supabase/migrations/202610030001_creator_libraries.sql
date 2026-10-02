create table if not exists public.sb1_creator_library (
  id uuid primary key default gen_random_uuid(),
  page_id text not null,
  kind text not null check (kind in ('music','sticker','gif','emoji','font')),
  name text not null,
  url text,
  thumbnail_url text,
  source text,
  source_id text,
  tags text[] default '{}',
  duration numeric,
  metadata jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists sb1_creator_library_page_kind_idx
  on public.sb1_creator_library(page_id, kind, created_at desc);
create index if not exists sb1_creator_library_tags_idx
  on public.sb1_creator_library using gin(tags);

alter table public.sb1_creator_library enable row level security;

drop policy if exists "creator library public read" on public.sb1_creator_library;
create policy "creator library public read"
  on public.sb1_creator_library for select
  using (is_public = true);

drop policy if exists "creator library authenticated insert" on public.sb1_creator_library;
create policy "creator library authenticated insert"
  on public.sb1_creator_library for insert
  to authenticated
  with check (true);

drop policy if exists "creator library authenticated update" on public.sb1_creator_library;
create policy "creator library authenticated update"
  on public.sb1_creator_library for update
  to authenticated
  using (true)
  with check (true);
