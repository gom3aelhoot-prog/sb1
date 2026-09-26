-- SB1 free text consultation workflow
create table if not exists free_text_sessions (
  id text primary key,
  patient_name text not null,
  patient_age integer not null check (patient_age >= 18),
  specialty_id uuid references specialties(id) on delete set null,
  requested_doctor_id uuid references doctors(id) on delete set null,
  assigned_doctor_id uuid references doctors(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','active','ended','closed','rejected')),
  max_messages integer not null default 20 check (max_messages = 20),
  message_count integer not null default 0 check (message_count between 0 and 20),
  close_reason text,
  created_at timestamptz default now(),
  accepted_at timestamptz,
  closed_at timestamptz
);
alter table free_text_sessions enable row level security;
drop policy if exists "anon_select_free_text_sessions" on free_text_sessions;
create policy "anon_select_free_text_sessions" on free_text_sessions for select to anon,authenticated using (true);
drop policy if exists "anon_insert_free_text_sessions" on free_text_sessions;
create policy "anon_insert_free_text_sessions" on free_text_sessions for insert to anon,authenticated with check (patient_age >= 18 and max_messages = 20);
drop policy if exists "anon_update_free_text_sessions" on free_text_sessions;
create policy "anon_update_free_text_sessions" on free_text_sessions for update to anon,authenticated using (true) with check (true);

create table if not exists free_text_session_messages (
 id uuid primary key default gen_random_uuid(),
 session_id text not null references free_text_sessions(id) on delete cascade,
 sender_type text not null check (sender_type in ('patient','doctor')),
 body text not null,
 message_number integer not null check (message_number between 1 and 20),
 created_at timestamptz default now()
);
alter table free_text_session_messages enable row level security;
drop policy if exists "anon_crud_free_text_session_messages" on free_text_session_messages;
create policy "anon_crud_free_text_session_messages" on free_text_session_messages for all to anon,authenticated using (true) with check (true);

create table if not exists free_text_session_change_requests (
 id uuid primary key default gen_random_uuid(),
 session_id text not null references free_text_sessions(id) on delete cascade,
 reason text not null,
 status text not null default 'pending',
 created_at timestamptz default now()
);
alter table free_text_session_change_requests enable row level security;
drop policy if exists "anon_crud_free_text_session_changes" on free_text_session_change_requests;
create policy "anon_crud_free_text_session_changes" on free_text_session_change_requests for all to anon,authenticated using (true) with check (true);

create table if not exists free_text_session_reviews (
 id uuid primary key default gen_random_uuid(),
 session_id text not null references free_text_sessions(id) on delete cascade,
 rating integer not null check (rating between 1 and 5),
 body text not null,
 created_at timestamptz default now()
);
alter table free_text_session_reviews enable row level security;
drop policy if exists "anon_crud_free_text_session_reviews" on free_text_session_reviews;
create policy "anon_crud_free_text_session_reviews" on free_text_session_reviews for all to anon,authenticated using (true) with check (true);
