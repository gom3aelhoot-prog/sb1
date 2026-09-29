-- SB1 complete page/social workspace
create table if not exists public.sb1_page_posts (
  id uuid primary key default gen_random_uuid(),
  page_id text not null,
  author_id uuid null,
  kind text not null check (kind in ('post','image','video','reel','audio')),
  body text not null default '',
  media_url text null,
  media_name text null,
  is_public boolean not null default true,
  is_medical_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_page_albums (
  id uuid primary key default gen_random_uuid(),
  page_id text not null,
  owner_id uuid null,
  name text not null,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_page_album_items (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.sb1_page_albums(id) on delete cascade,
  media_kind text not null,
  media_url text null,
  media_name text null,
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_page_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.sb1_page_posts(id) on delete cascade,
  author_id uuid null,
  author_name text not null default 'مستخدم SB1',
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_page_post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.sb1_page_posts(id) on delete cascade,
  user_id uuid null,
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_external_favorites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid null,
  page_id text not null,
  external_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_cloned_pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid null,
  page_type text not null,
  page_name text not null,
  pin text not null,
  password text not null,
  page_link text not null,
  expires_at timestamptz null,
  gifted_to text null,
  permissions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sb1_page_posts_page_created_idx on public.sb1_page_posts(page_id, created_at desc);
create index if not exists sb1_page_albums_page_created_idx on public.sb1_page_albums(page_id, created_at desc);
create index if not exists sb1_page_comments_post_created_idx on public.sb1_page_post_comments(post_id, created_at);
create index if not exists sb1_external_favorites_owner_page_idx on public.sb1_external_favorites(owner_id, page_id);

alter table public.sb1_page_posts enable row level security;
alter table public.sb1_page_albums enable row level security;
alter table public.sb1_page_album_items enable row level security;
alter table public.sb1_page_post_comments enable row level security;
alter table public.sb1_page_post_likes enable row level security;
alter table public.sb1_external_favorites enable row level security;
alter table public.sb1_cloned_pages enable row level security;

drop policy if exists "public read public page posts" on public.sb1_page_posts;
create policy "public read public page posts" on public.sb1_page_posts for select using (is_public = true);

drop policy if exists "public read public albums" on public.sb1_page_albums;
create policy "public read public albums" on public.sb1_page_albums for select using (is_public = true);

drop policy if exists "public read public album items" on public.sb1_page_album_items;
create policy "public read public album items" on public.sb1_page_album_items for select using (
  exists (select 1 from public.sb1_page_albums a where a.id = album_id and a.is_public = true)
);

drop policy if exists "signed in comment" on public.sb1_page_post_comments;
create policy "signed in comment" on public.sb1_page_post_comments for insert with check (auth.uid() is not null);

drop policy if exists "public read comments" on public.sb1_page_post_comments;
create policy "public read comments" on public.sb1_page_post_comments for select using (true);

drop policy if exists "signed in like" on public.sb1_page_post_likes;
create policy "signed in like" on public.sb1_page_post_likes for insert with check (auth.uid() is not null);

drop policy if exists "public read likes" on public.sb1_page_post_likes;
create policy "public read likes" on public.sb1_page_post_likes for select using (true);

-- External favorites and cloned-page credentials are private by design.
drop policy if exists "private external favorites" on public.sb1_external_favorites;
create policy "private external favorites" on public.sb1_external_favorites for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "private cloned pages" on public.sb1_cloned_pages;
create policy "private cloned pages" on public.sb1_cloned_pages for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
