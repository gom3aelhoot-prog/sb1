-- SB1 approvals, owner/supervisor chat, and pediatric specialist media library
alter table public.doctors add column if not exists approval_status text not null default 'pending';
alter table public.doctors add column if not exists approved_by uuid;
alter table public.doctors add column if not exists approved_at timestamptz;
update public.doctors set approval_status=case when is_verified=true then 'approved' else 'pending' end where approval_status is null or approval_status='';

create table if not exists public.sb1_admin_users (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null unique,
 role text not null default 'moderator' check(role in ('owner','supervisor','moderator')),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.sb1_admin_users enable row level security;

create or replace function public.sb1_is_admin()
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.sb1_admin_users where user_id=auth.uid() and active=true);
$$;

create table if not exists public.sb1_team_chat_rooms(
 id uuid primary key default gen_random_uuid(),
 name text not null,
 created_by uuid,
 room_type text not null default 'owner_team',
 created_at timestamptz not null default now()
);
create table if not exists public.sb1_team_chat_members(
 room_id uuid not null references public.sb1_team_chat_rooms(id) on delete cascade,
 user_id uuid not null,
 member_role text not null default 'specialist',
 created_at timestamptz not null default now(),
 primary key(room_id,user_id)
);
create table if not exists public.sb1_team_chat_messages(
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references public.sb1_team_chat_rooms(id) on delete cascade,
 sender_id uuid,
 sender_name text,
 body text not null,
 created_at timestamptz not null default now()
);

create table if not exists public.sb1_pediatric_library_rooms(
 id uuid primary key default gen_random_uuid(),
 name text not null,
 description text,
 specialty_id uuid,
 created_by uuid,
 is_active boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.sb1_pediatric_library_posts(
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references public.sb1_pediatric_library_rooms(id) on delete cascade,
 author_id uuid,
 title text,
 body text,
 media_url text,
 media_type text check(media_type in ('image','video','audio','file') or media_type is null),
 likes_count integer not null default 0,
 comments_count integer not null default 0,
 shares_count integer not null default 0,
 created_at timestamptz not null default now()
);
create table if not exists public.sb1_pediatric_library_comments(
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.sb1_pediatric_library_posts(id) on delete cascade,
 author_id uuid,
 body text not null,
 created_at timestamptz not null default now()
);
create table if not exists public.sb1_pediatric_library_reactions(
 post_id uuid not null references public.sb1_pediatric_library_posts(id) on delete cascade,
 user_id uuid not null,
 reaction text not null default 'like',
 created_at timestamptz not null default now(),
 primary key(post_id,user_id)
);

alter table public.sb1_team_chat_rooms enable row level security;
alter table public.sb1_team_chat_members enable row level security;
alter table public.sb1_team_chat_messages enable row level security;
alter table public.sb1_pediatric_library_rooms enable row level security;
alter table public.sb1_pediatric_library_posts enable row level security;
alter table public.sb1_pediatric_library_comments enable row level security;
alter table public.sb1_pediatric_library_reactions enable row level security;

drop policy if exists "sb1 doctors public approved" on public.doctors;
create policy "sb1 doctors public approved" on public.doctors for select using (approval_status='approved');

drop policy if exists "sb1 admin manage doctors" on public.doctors;
create policy "sb1 admin manage doctors" on public.doctors for all to authenticated using (public.sb1_is_admin()) with check (public.sb1_is_admin());

create policy "sb1 admin users self" on public.sb1_admin_users for select to authenticated using (user_id=auth.uid() or public.sb1_is_admin());

create policy "team rooms members or admins" on public.sb1_team_chat_rooms for select to authenticated using (public.sb1_is_admin() or exists(select 1 from public.sb1_team_chat_members m where m.room_id=id and m.user_id=auth.uid()));
create policy "team rooms admins create" on public.sb1_team_chat_rooms for insert to authenticated with check (public.sb1_is_admin());
create policy "team members members" on public.sb1_team_chat_members for select to authenticated using (public.sb1_is_admin() or user_id=auth.uid());
create policy "team members admins write" on public.sb1_team_chat_members for all to authenticated using (public.sb1_is_admin()) with check (public.sb1_is_admin());
create policy "team messages members" on public.sb1_team_chat_messages for select to authenticated using (public.sb1_is_admin() or exists(select 1 from public.sb1_team_chat_members m where m.room_id=room_id and m.user_id=auth.uid()));
create policy "team messages members write" on public.sb1_team_chat_messages for insert to authenticated with check (public.sb1_is_admin() or exists(select 1 from public.sb1_team_chat_members m where m.room_id=room_id and m.user_id=auth.uid()));

create policy "pediatric rooms public read" on public.sb1_pediatric_library_rooms for select using (is_active=true);
create policy "pediatric rooms admins or specialists" on public.sb1_pediatric_library_rooms for insert to authenticated with check (public.sb1_is_admin());
create policy "pediatric posts public read" on public.sb1_pediatric_library_posts for select using (true);
create policy "pediatric posts admin write" on public.sb1_pediatric_library_posts for all to authenticated using (public.sb1_is_admin()) with check (public.sb1_is_admin());
create policy "pediatric comments public read" on public.sb1_pediatric_library_comments for select using (true);
create policy "pediatric comments authenticated write" on public.sb1_pediatric_library_comments for insert to authenticated with check (auth.uid()=author_id);
create policy "pediatric reactions public read" on public.sb1_pediatric_library_reactions for select using (true);
create policy "pediatric reactions authenticated write" on public.sb1_pediatric_library_reactions for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

create index if not exists sb1_doctors_approval_idx on public.doctors(approval_status);
create index if not exists sb1_team_messages_room_idx on public.sb1_team_chat_messages(room_id,created_at);
create index if not exists sb1_pediatric_posts_room_idx on public.sb1_pediatric_library_posts(room_id,created_at);
