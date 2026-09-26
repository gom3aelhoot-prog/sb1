-- SB1 content-scale foundation
-- Capacity target: up to 1,000,000 catalog entries PER TYPE.
-- This migration does NOT create fake/million rows. It only prepares the schema
-- and storage organization so the catalog can grow without loading the whole
-- collection into the browser.

create table if not exists public.sb1_content_capacity (
  content_type text primary key check (content_type in ('video','audio','book','article')),
  target_capacity bigint not null default 1000000,
  created_at timestamptz not null default now()
);

insert into public.sb1_content_capacity(content_type,target_capacity)
values
 ('video',1000000),
 ('audio',1000000),
 ('book',1000000),
 ('article',1000000)
on conflict (content_type) do update
set target_capacity=excluded.target_capacity;

-- Large-catalog lookup indexes.
create index if not exists articles_specialty_created_idx
  on public.articles (specialty_id, created_at desc);

create index if not exists doctor_videos_specialty_created_idx
  on public.doctor_videos (specialty_id, created_at desc);

create index if not exists doctor_audio_specialty_created_idx
  on public.doctor_audio (specialty_id, created_at desc);

create index if not exists specialty_library_type_created_idx
  on public.specialty_library_items (item_type, specialty_id, created_at desc);

-- Multilingual JSONB searches use containment queries in the application.
create index if not exists articles_translations_gin_idx
  on public.articles using gin (translations jsonb_path_ops);

create index if not exists doctor_videos_translations_gin_idx
  on public.doctor_videos using gin (translations jsonb_path_ops);

create index if not exists doctor_audio_translations_gin_idx
  on public.doctor_audio using gin (translations jsonb_path_ops);

create index if not exists specialty_library_translations_gin_idx
  on public.specialty_library_items using gin (translations jsonb_path_ops);

-- Moderated uploads: optimized for language/type/specialty feeds.
create index if not exists content_submissions_approved_feed_idx
  on public.content_submissions (language, content_type, specialty_id, created_at desc)
  where status='approved';

create index if not exists content_submissions_pending_review_idx
  on public.content_submissions (status, created_at desc);

-- Separate buckets keep large media from being mixed with ordinary application data.
insert into storage.buckets (id,name,public)
values
 ('sb1-videos','sb1-videos',false),
 ('sb1-audio','sb1-audio',false),
 ('sb1-books','sb1-books',false)
on conflict (id) do nothing;

-- Upload/read policies for the new private content buckets.
drop policy if exists "authenticated users upload sb1 content" on storage.objects;
create policy "authenticated users upload sb1 content"
on storage.objects for insert to authenticated
with check (bucket_id in ('sb1-videos','sb1-audio','sb1-books'));

drop policy if exists "authenticated users read sb1 content" on storage.objects;
create policy "authenticated users read sb1 content"
on storage.objects for select to authenticated
using (bucket_id in ('sb1-videos','sb1-audio','sb1-books'));

drop policy if exists "authenticated users delete sb1 content" on storage.objects;
create policy "authenticated users delete sb1 content"
on storage.objects for delete to authenticated
using (bucket_id in ('sb1-videos','sb1-audio','sb1-books'));

comment on table public.sb1_content_capacity is
  'SB1 architectural target: up to 1,000,000 entries for each content type. This table stores capacity targets only; it does not seed content.';
