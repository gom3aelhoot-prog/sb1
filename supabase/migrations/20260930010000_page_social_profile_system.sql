-- SB1 page social/profile foundation requested by owner
create table if not exists public.sb1_pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  page_type text not null check (page_type in ('specialist','delivery_worker','institution','client','service_other')),
  display_name text not null,
  bio text,
  country_code text,
  city text,
  currency_code text,
  is_public boolean not null default true,
  is_owner_child_page boolean not null default false,
  parent_page_id uuid references public.sb1_pages(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists sb1_pages_owner_idx on public.sb1_pages(owner_id);
create index if not exists sb1_pages_type_idx on public.sb1_pages(page_type);

create table if not exists public.sb1_page_albums (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.sb1_pages(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  media_type text not null default 'mixed' check (media_type in ('images','video','audio','mixed')),
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists sb1_page_albums_page_idx on public.sb1_page_albums(page_id);

create table if not exists public.sb1_page_posts (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.sb1_pages(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  post_type text not null default 'post' check (post_type in ('post','video','reel','audio','article','share')),
  body text,
  media_url text,
  external_url text,
  external_provider text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists sb1_page_posts_page_idx on public.sb1_page_posts(page_id,created_at desc);

create table if not exists public.sb1_social_sources (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.sb1_pages(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  external_url text not null,
  display_title text,
  safe_display_name text,
  private_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_private_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_url text not null,
  provider text,
  title text,
  created_at timestamptz not null default now()
);
create index if not exists sb1_private_favorites_user_idx on public.sb1_private_favorites(user_id);

create table if not exists public.sb1_page_clones (
  id uuid primary key default gen_random_uuid(),
  source_page_id uuid not null references public.sb1_pages(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  page_id uuid references public.sb1_pages(id) on delete set null,
  gift_recipient text,
  expires_at timestamptz,
  permissions jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active','gifted','expired','revoked')),
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_page_settings (
  page_id uuid primary key references public.sb1_pages(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.sb1_page_comments (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.sb1_pages(id) on delete cascade,
  post_id uuid references public.sb1_page_posts(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  display_name text,
  is_anonymous boolean not null default false,
  body text not null,
  is_transparent_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_page_reactions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.sb1_pages(id) on delete cascade,
  post_id uuid references public.sb1_page_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  reaction_type text not null check (reaction_type in ('like','heart')),
  created_at timestamptz not null default now()
);

alter table public.sb1_pages enable row level security;
alter table public.sb1_page_albums enable row level security;
alter table public.sb1_page_posts enable row level security;
alter table public.sb1_social_sources enable row level security;
alter table public.sb1_private_favorites enable row level security;
alter table public.sb1_page_clones enable row level security;
alter table public.sb1_page_settings enable row level security;
alter table public.sb1_page_comments enable row level security;
alter table public.sb1_page_reactions enable row level security;

create policy "public pages" on public.sb1_pages for select using (is_public=true or auth.uid()=owner_id or public.sb1_can_admin('moderator'));
create policy "owner pages write" on public.sb1_pages for all to authenticated using (auth.uid()=owner_id or public.sb1_can_admin('moderator')) with check (auth.uid()=owner_id or public.sb1_can_admin('moderator'));
create policy "public albums" on public.sb1_page_albums for select using (is_public=true or auth.uid()=owner_id or public.sb1_can_admin('moderator'));
create policy "owner albums write" on public.sb1_page_albums for all to authenticated using (auth.uid()=owner_id or public.sb1_can_admin('moderator')) with check (auth.uid()=owner_id or public.sb1_can_admin('moderator'));
create policy "public posts" on public.sb1_page_posts for select using (is_public=true or auth.uid()=owner_id or public.sb1_can_admin('moderator'));
create policy "owner posts write" on public.sb1_page_posts for all to authenticated using (auth.uid()=owner_id or public.sb1_can_admin('moderator')) with check (auth.uid()=owner_id or public.sb1_can_admin('moderator'));
create policy "private favorites" on public.sb1_private_favorites for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "page settings private" on public.sb1_page_settings for all to authenticated using (auth.uid()=owner_id or public.sb1_can_admin('moderator')) with check (auth.uid()=owner_id or public.sb1_can_admin('moderator'));
create policy "public comments" on public.sb1_page_comments for select using (true);
create policy "comments write" on public.sb1_page_comments for insert to authenticated with check (auth.uid()=author_id or author_id is null);
create policy "public reactions" on public.sb1_page_reactions for select using (true);
create policy "reactions write" on public.sb1_page_reactions for insert to authenticated with check (auth.uid()=user_id);
create policy "own clone records" on public.sb1_page_clones for select to authenticated using (auth.uid()=owner_id or public.sb1_can_admin('moderator'));
create policy "clone records write" on public.sb1_page_clones for all to authenticated using (auth.uid()=owner_id or public.sb1_can_admin('moderator')) with check (auth.uid()=owner_id or public.sb1_can_admin('moderator'));
create policy "social sources owner only" on public.sb1_social_sources for all to authenticated using (auth.uid()=owner_id or public.sb1_can_admin('moderator')) with check (auth.uid()=owner_id or public.sb1_can_admin('moderator'));

comment on table public.sb1_private_favorites is 'Private to the account; never exposed as public page data.';
comment on table public.sb1_social_sources is 'External provider metadata is owner-only; public pages may expose only safe embedded media.';
comment on table public.sb1_page_clones is 'Clone records copy page type/structure and permissions metadata, never source posts, favorites, courses or articles.';
