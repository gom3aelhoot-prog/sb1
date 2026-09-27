-- SB1: strict separation between public community notifications and private account notifications.
create table if not exists public.global_notifications (
 id uuid primary key default gen_random_uuid(),
 kind text not null default 'community',
 title text not null,
 body text not null,
 href text,
 language_code text not null default 'ar',
 created_at timestamptz not null default now()
);

create table if not exists public.private_notifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null default 'account',
 title text not null,
 body text not null,
 href text,
 language_code text not null default 'ar',
 created_at timestamptz not null default now(),
 read_at timestamptz
);

create index if not exists global_notifications_language_created_idx on public.global_notifications(language_code,created_at desc);
create index if not exists private_notifications_user_created_idx on public.private_notifications(user_id,created_at desc);

alter table public.global_notifications enable row level security;
alter table public.private_notifications enable row level security;

drop policy if exists "global notifications are publicly readable" on public.global_notifications;
create policy "global notifications are publicly readable" on public.global_notifications for select using (true);

drop policy if exists "private notifications owner read" on public.private_notifications;
create policy "private notifications owner read" on public.private_notifications for select using (auth.uid() = user_id);

drop policy if exists "private notifications owner mark read" on public.private_notifications;
create policy "private notifications owner mark read" on public.private_notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Inserts/administrative fan-out should be done by trusted server/admin code, never by anonymous clients.
revoke insert, delete on public.private_notifications from anon, authenticated;
revoke insert, update, delete on public.global_notifications from anon, authenticated;
