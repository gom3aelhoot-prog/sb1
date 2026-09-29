-- SB1 private face verification capture: three camera frames, no external face-matching service
create table if not exists public.sb1_face_verification_submissions (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references auth.users(id) on delete cascade,
  applicant_type text not null check (applicant_type in ('specialist','institution','delivery_worker','service_other')),
  full_name text not null,
  email text not null,
  phone text,
  license_number text,
  frame_1_path text not null,
  frame_2_path text not null,
  frame_3_path text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists sb1_face_verification_applicant_idx on public.sb1_face_verification_submissions(applicant_id);
create index if not exists sb1_face_verification_status_idx on public.sb1_face_verification_submissions(status);

alter table public.sb1_face_verification_submissions enable row level security;

create policy "face verification applicant insert"
on public.sb1_face_verification_submissions for insert to authenticated
with check (auth.uid()=applicant_id);

create policy "face verification owner admin read"
on public.sb1_face_verification_submissions for select to authenticated
using (public.sb1_can_admin('moderator'));

create policy "face verification owner admin update"
on public.sb1_face_verification_submissions for update to authenticated
using (public.sb1_can_admin('moderator'))
with check (public.sb1_can_admin('moderator'));

insert into storage.buckets (id,name,public)
values ('sb1-face-verification','sb1-face-verification',false)
on conflict (id) do nothing;

create policy "face verification upload own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id='sb1-face-verification'
  and (storage.foldername(name))[1]=auth.uid()::text
);

create policy "face verification read owner admin"
on storage.objects for select to authenticated
using (
  bucket_id='sb1-face-verification'
  and (
    public.sb1_can_admin('moderator')
  )
);

comment on table public.sb1_face_verification_submissions is 'Three private applicant camera frames for manual owner/moderator review only. No external face-matching service is used.';
