create table if not exists public.content_submissions (
 id uuid primary key default gen_random_uuid(),
 specialist_id uuid null,
 content_type text not null check (content_type in ('article','video','audio','book')),
 title text not null,
 description text,
 specialty_id uuid null,
 language text not null default 'ar',
 price numeric(12,2) not null default 0,
 platform_share numeric(5,2) not null default 50,
 specialist_share numeric(5,2) not null default 50,
 file_path text,
 cover_path text,
 source_url text,
 status text not null default 'pending' check (status in ('pending','approved','rejected','deleted')),
 rejection_reason text,
 reviewed_by uuid null,
 reviewed_at timestamptz null,
 created_at timestamptz not null default now()
);

alter table public.content_submissions enable row level security;
create policy "public can read approved content submissions" on public.content_submissions for select using (status='approved');
create policy "authenticated specialists can submit content" on public.content_submissions for insert to authenticated with check (status='pending');
create policy "owners can review content submissions" on public.content_submissions for update to authenticated using (true) with check (true);
create policy "owners can delete content submissions" on public.content_submissions for delete to authenticated using (true);

insert into storage.buckets (id,name,public) values ('specialist-content','specialist-content',false) on conflict (id) do nothing;
create policy "authenticated users upload specialist content" on storage.objects for insert to authenticated with check (bucket_id='specialist-content');
create policy "authenticated users read specialist content" on storage.objects for select to authenticated using (bucket_id='specialist-content');
create policy "authenticated users delete specialist content" on storage.objects for delete to authenticated using (bucket_id='specialist-content');

create index if not exists content_submissions_status_idx on public.content_submissions(status);
create index if not exists content_submissions_language_idx on public.content_submissions(language);
create index if not exists content_submissions_specialty_idx on public.content_submissions(specialty_id);
