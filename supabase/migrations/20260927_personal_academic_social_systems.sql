-- SB1 personal/academic systems: long-term packages + social privacy vault
create table if not exists public.sb1_session_packages (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  session_count integer not null check (session_count >= 2),
  regular_price numeric(12,2) not null check (regular_price >= 0),
  package_price numeric(12,2) not null check (package_price >= 0),
  discount_percent numeric(5,2) not null default 0,
  duration_days integer not null default 60,
  currency_code text not null default 'USD',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.sb1_session_package_quotes (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references public.sb1_session_packages(id) on delete cascade,
  specialist_id uuid references auth.users(id) on delete cascade,
  client_id uuid references auth.users(id) on delete cascade,
  custom_price numeric(12,2) not null,
  currency_code text not null default 'USD',
  note text,
  status text not null default 'pending',
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.sb1_social_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  item_type text not null,
  title text,
  body text,
  author text,
  created_at timestamptz not null default now(),
  unique(user_id,item_id)
);
create table if not exists public.sb1_social_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  item_type text not null,
  created_at timestamptz not null default now(),
  unique(user_id,item_id)
);
create table if not exists public.sb1_social_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.sb1_social_archive (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  item_type text not null,
  title text,
  body text,
  author text,
  created_at timestamptz not null default now(),
  unique(user_id,item_id)
);
create table if not exists public.sb1_profile_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(follower_id,profile_id)
);
create table if not exists public.sb1_profile_privacy (
  user_id uuid primary key references auth.users(id) on delete cascade,
  content_visibility text not null default 'followers' check (content_visibility in ('followers','private')),
  updated_at timestamptz not null default now()
);
create index if not exists sb1_session_packages_specialist_idx on public.sb1_session_packages(specialist_id);
create index if not exists sb1_social_saves_user_idx on public.sb1_social_saves(user_id);
create index if not exists sb1_social_likes_user_idx on public.sb1_social_likes(user_id);
create index if not exists sb1_social_archive_user_idx on public.sb1_social_archive(user_id);
create index if not exists sb1_profile_follows_profile_idx on public.sb1_profile_follows(profile_id);

alter table public.sb1_session_packages enable row level security;
alter table public.sb1_session_package_quotes enable row level security;
alter table public.sb1_social_saves enable row level security;
alter table public.sb1_social_likes enable row level security;
alter table public.sb1_social_comments enable row level security;
alter table public.sb1_social_archive enable row level security;
alter table public.sb1_profile_follows enable row level security;
alter table public.sb1_profile_privacy enable row level security;

create policy "specialists manage own packages" on public.sb1_session_packages for all to authenticated using ((select auth.uid()) = specialist_id) with check ((select auth.uid()) = specialist_id);
create policy "package owners and clients read quotes" on public.sb1_session_package_quotes for select to authenticated using ((select auth.uid()) = specialist_id or (select auth.uid()) = client_id);
create policy "specialists create package quotes" on public.sb1_session_package_quotes for insert to authenticated with check ((select auth.uid()) = specialist_id);
create policy "users manage own saves" on public.sb1_social_saves for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own likes" on public.sb1_social_likes for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own comments" on public.sb1_social_comments for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own archive" on public.sb1_social_archive for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "follow records visible to participants" on public.sb1_profile_follows for select to authenticated using ((select auth.uid()) = follower_id or (select auth.uid()) = profile_id);
create policy "users manage own follows" on public.sb1_profile_follows for insert to authenticated with check ((select auth.uid()) = follower_id);
create policy "users remove own follows" on public.sb1_profile_follows for delete to authenticated using ((select auth.uid()) = follower_id);
create policy "users manage own privacy" on public.sb1_profile_privacy for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
