-- SB1 marketplace, moderation, delivery and contract support
create table if not exists public.sb1_safety_sanctions (
 id uuid primary key default gen_random_uuid(),
 user_key text not null,
 strike integer not null,
 reason text not null,
 started_at timestamptz not null default now(),
 until_at timestamptz,
 level text not null,
 permanent boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists idx_sb1_safety_user on public.sb1_safety_sanctions(user_key,created_at desc);

create table if not exists public.sb1_owner_alerts (
 id uuid primary key default gen_random_uuid(),
 alert_type text not null,
 user_key text,
 strike integer,
 reason text,
 level text,
 evidence_image text,
 recipients text[] default array['owner','moderators'],
 read_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists idx_sb1_owner_alerts_unread on public.sb1_owner_alerts(read_at,created_at desc);

create table if not exists public.institution_services (
 id uuid primary key default gen_random_uuid(),
 institution_id uuid,
 name text not null,
 description text,
 price numeric,
 currency text default 'USD',
 duration_minutes integer,
 active boolean default true,
 language_code text,
 created_at timestamptz default now()
);
create table if not exists public.institution_appointments (
 id uuid primary key default gen_random_uuid(),
 institution_id uuid,
 customer_id uuid,
 service_id uuid,
 scheduled_at timestamptz not null,
 status text default 'pending',
 pickup_or_delivery text,
 notes text,
 created_at timestamptz default now()
);
create index if not exists idx_inst_appointments_time on public.institution_appointments(institution_id,scheduled_at);

create table if not exists public.pharmacy_products (
 id uuid primary key default gen_random_uuid(),
 institution_id uuid,
 name text not null,
 description text,
 image_url text,
 price numeric not null default 0,
 currency text default 'USD',
 stock integer,
 prescription_required boolean default false,
 pickup_enabled boolean default true,
 delivery_enabled boolean default false,
 active boolean default true,
 language_code text,
 created_at timestamptz default now()
);
create index if not exists idx_pharmacy_products_search on public.pharmacy_products(institution_id,language_code,active);

create table if not exists public.sb1_delivery_workers (
 id uuid primary key default gen_random_uuid(),
 institution_id uuid,
 name text not null,
 phone text,
 city text,
 status text default 'active',
 notification_token text,
 created_at timestamptz default now()
);
create table if not exists public.sb1_delivery_orders (
 id uuid primary key default gen_random_uuid(),
 pharmacy_id uuid,
 worker_id uuid,
 customer_id uuid,
 status text default 'pending',
 pickup_method text default 'delivery',
 pickup_address text,
 delivery_address text,
 fee numeric default 0,
 created_at timestamptz default now()
);

create table if not exists public.sb1_electronic_contract_signatures (
 id uuid primary key default gen_random_uuid(),
 party_type text not null,
 party_id uuid,
 contract_type text not null,
 contract_version text not null,
 legal_name text not null,
 signature_text text not null,
 document_hash text,
 signed_at timestamptz not null default now(),
 ip_address text,
 user_agent text
);
create index if not exists idx_sb1_contract_party on public.sb1_electronic_contract_signatures(party_type,party_id);

create table if not exists public.sb1_translation_jobs (
 id uuid primary key default gen_random_uuid(),
 source_language text not null,
 target_language text not null,
 source_text text not null,
 corrected_text text,
 translated_text text,
 specialist_id uuid,
 question_id uuid,
 status text default 'draft',
 created_at timestamptz default now()
);