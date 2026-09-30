-- SB1 stories and page media storage
create table if not exists public.sb1_page_stories (
  id uuid primary key default gen_random_uuid(),
  page_id text not null,
  owner_id uuid null,
  body text not null default '',
  media_url text null,
  media_kind text null check (media_kind in ('image','video')),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index if not exists sb1_page_stories_page_expiry_idx
  on public.sb1_page_stories(page_id, expires_at desc);

alter table public.sb1_page_stories enable row level security;

drop policy if exists "public read active stories" on public.sb1_page_stories;
create policy "public read active stories"
on public.sb1_page_stories for select
using (is_public = true and expires_at > now());

drop policy if exists "authenticated create stories" on public.sb1_page_stories;
create policy "authenticated create stories"
on public.sb1_page_stories for insert
with check (auth.uid() is not null and (owner_id is null or owner_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('sb1-page-media','sb1-page-media',true)
on conflict (id) do update set public = true;

drop policy if exists "sb1 page media public read" on storage.objects;
create policy "sb1 page media public read"
on storage.objects for select
using (bucket_id = 'sb1-page-media');

drop policy if exists "sb1 page media authenticated upload" on storage.objects;
create policy "sb1 page media authenticated upload"
on storage.objects for insert
with check (bucket_id = 'sb1-page-media' and auth.uid() is not null);

drop policy if exists "sb1 page media authenticated update" on storage.objects;
create policy "sb1 page media authenticated update"
on storage.objects for update
using (bucket_id = 'sb1-page-media' and auth.uid() is not null)
with check (bucket_id = 'sb1-page-media' and auth.uid() is not null);

drop policy if exists "sb1 page media authenticated delete" on storage.objects;
create policy "sb1 page media authenticated delete"
on storage.objects for delete
using (bucket_id = 'sb1-page-media' and auth.uid() is not null);
