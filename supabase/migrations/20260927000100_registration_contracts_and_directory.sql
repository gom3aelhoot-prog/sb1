-- SB1 registration contracts, identity tracking, and live admin directory
create table if not exists public.sb1_registration_contracts (
  id uuid primary key default gen_random_uuid(),
  registration_id text,
  account_type text not null,
  full_name text,
  email text,
  phone text,
  country_code text,
  city text,
  language_code text,
  contract_version text not null default 'SB1-2026-09',
  terms_accepted boolean not null default false,
  privacy_accepted boolean not null default false,
  medical_disclaimer_accepted boolean not null default false,
  data_processing_accepted boolean not null default false,
  signature_name text,
  signature_text text,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists sb1_registration_contracts_email_idx on public.sb1_registration_contracts(lower(email));
create index if not exists sb1_registration_contracts_phone_idx on public.sb1_registration_contracts(phone);
create index if not exists sb1_registration_contracts_country_idx on public.sb1_registration_contracts(country_code);
create index if not exists sb1_registration_contracts_created_idx on public.sb1_registration_contracts(created_at desc);

create table if not exists public.sb1_registration_directory (
  id uuid primary key default gen_random_uuid(),
  source_table text not null,
  source_id text not null,
  name text,
  email text,
  phone text,
  account_type text,
  country_code text,
  city text,
  specialty_id text,
  language_code text,
  created_at timestamptz default now(),
  last_seen_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  unique(source_table, source_id)
);
create index if not exists sb1_registration_directory_name_idx on public.sb1_registration_directory(lower(name));
create index if not exists sb1_registration_directory_email_idx on public.sb1_registration_directory(lower(email));
create index if not exists sb1_registration_directory_phone_idx on public.sb1_registration_directory(phone);
create index if not exists sb1_registration_directory_country_city_idx on public.sb1_registration_directory(country_code, city);
create index if not exists sb1_registration_directory_specialty_idx on public.sb1_registration_directory(specialty_id);
create index if not exists sb1_registration_directory_type_idx on public.sb1_registration_directory(account_type);
create index if not exists sb1_registration_directory_language_idx on public.sb1_registration_directory(language_code);
create index if not exists sb1_registration_directory_created_idx on public.sb1_registration_directory(created_at desc);

alter table public.sb1_registration_contracts enable row level security;
alter table public.sb1_registration_directory enable row level security;
drop policy if exists sb1_registration_contracts_insert on public.sb1_registration_contracts;
create policy sb1_registration_contracts_insert on public.sb1_registration_contracts for insert to anon, authenticated with check (true);
drop policy if exists sb1_registration_contracts_select on public.sb1_registration_contracts;
create policy sb1_registration_contracts_select on public.sb1_registration_contracts for select to authenticated using (true);
drop policy if exists sb1_registration_directory_select on public.sb1_registration_directory;
create policy sb1_registration_directory_select on public.sb1_registration_directory for select to authenticated using (true);
drop policy if exists sb1_registration_directory_insert on public.sb1_registration_directory;
create policy sb1_registration_directory_insert on public.sb1_registration_directory for insert to anon, authenticated with check (true);
drop policy if exists sb1_registration_directory_update on public.sb1_registration_directory;
create policy sb1_registration_directory_update on public.sb1_registration_directory for update to authenticated using (true) with check (true);

create or replace function public.sb1_sync_registration_directory() returns trigger
language plpgsql security definer set search_path=public as $$
declare
  j jsonb := to_jsonb(new);
  sid text := coalesce(j->>'id', md5(j::text));
  atype text := case tg_table_name
    when 'profiles' then coalesce(j->>'role','client')
    when 'institutions' then coalesce(j->>'type','institution')
    when 'sb1_specialist_registration_requests' then 'specialist'
    when 'sb1_delivery_workers' then 'delivery_worker'
    else tg_table_name end;
begin
  insert into public.sb1_registration_directory(source_table,source_id,name,email,phone,account_type,country_code,city,specialty_id,language_code,created_at,last_seen_at,metadata)
  values(tg_table_name,sid,j->>'name',lower(j->>'email'),j->>'phone',atype,j->>'country_code',j->>'city',j->>'specialty_id',coalesce(j->>'language_code',j->>'language'),coalesce((j->>'created_at')::timestamptz,now()),coalesce((j->>'last_seen_at')::timestamptz,null),j)
  on conflict(source_table,source_id) do update set name=excluded.name,email=excluded.email,phone=excluded.phone,account_type=excluded.account_type,country_code=excluded.country_code,city=excluded.city,specialty_id=excluded.specialty_id,language_code=excluded.language_code,last_seen_at=excluded.last_seen_at,metadata=excluded.metadata;
  return new;
end $$;

do $$ begin
  if to_regclass('public.profiles') is not null then
    drop trigger if exists sb1_sync_profiles on public.profiles;
    create trigger sb1_sync_profiles after insert or update on public.profiles for each row execute function public.sb1_sync_registration_directory();
  end if;
  if to_regclass('public.institutions') is not null then
    drop trigger if exists sb1_sync_institutions on public.institutions;
    create trigger sb1_sync_institutions after insert or update on public.institutions for each row execute function public.sb1_sync_registration_directory();
  end if;
  if to_regclass('public.sb1_specialist_registration_requests') is not null then
    drop trigger if exists sb1_sync_specialist_requests on public.sb1_specialist_registration_requests;
    create trigger sb1_sync_specialist_requests after insert or update on public.sb1_specialist_registration_requests for each row execute function public.sb1_sync_registration_directory();
  end if;
  if to_regclass('public.sb1_delivery_workers') is not null then
    drop trigger if exists sb1_sync_delivery_workers on public.sb1_delivery_workers;
    create trigger sb1_sync_delivery_workers after insert or update on public.sb1_delivery_workers for each row execute function public.sb1_sync_registration_directory();
  end if;
end $$;