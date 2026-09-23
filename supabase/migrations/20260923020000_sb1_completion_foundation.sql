/*
 SB1 completion foundation — transactional controls, marketplace, verification,
 tracking, sessions/bids, referrals, media, secure downloads, owner controls,
 monitoring and supervisor-room primitives.

 This migration adds the missing platform-level data model without replacing
 the local-design UI or the existing 11-language platform.
*/

create extension if not exists pgcrypto;

-- 1) Question pricing + signup promotion controls
create table if not exists question_pricing_rules (
  id uuid primary key default gen_random_uuid(),
  country_code text,
  currency_code text not null default 'USD',
  base_price numeric(12,2) not null default 0,
  duration_days integer not null default 7,
  notification_reach integer not null default 10,
  min_answers integer not null default 1,
  max_answers integer not null default 3,
  response_speed text not null default 'standard',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists signup_promotions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_percent numeric(5,2) not null default 10,
  max_uses integer,
  used_count integer not null default 0,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into signup_promotions(code, discount_percent)
values ('SB1-FIRST-SIGNUP', 10)
on conflict (code) do nothing;

-- 2) Payment hold / split / compensation
create table if not exists payment_holds (
  id uuid primary key default gen_random_uuid(),
  reference_type text not null,
  reference_id uuid,
  payer_email text,
  gross_amount numeric(12,2) not null default 0,
  currency_code text not null default 'USD',
  platform_amount numeric(12,2) not null default 0,
  provider_amount numeric(12,2) not null default 0,
  agent_amount numeric(12,2) not null default 0,
  held_amount numeric(12,2) not null default 0,
  released_amount numeric(12,2) not null default 0,
  status text not null default 'held',
  compensation_amount numeric(12,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  released_at timestamptz
);

create table if not exists compensation_rules (
  id uuid primary key default gen_random_uuid(),
  event_type text unique not null,
  percent numeric(5,2) not null default 50,
  max_amount numeric(12,2),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into compensation_rules(event_type, percent)
values ('provider_no_show',50),('service_failure',50),('late_cancellation',50)
on conflict (event_type) do nothing;

create table if not exists discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  percent numeric(5,2),
  fixed_amount numeric(12,2),
  currency_code text,
  max_uses integer,
  used_count integer not null default 0,
  expires_at timestamptz,
  reason text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3) Marketplace + protected contact reveal
create table if not exists marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  owner_email text,
  listing_type text not null,
  title text not null,
  description text,
  category text,
  price numeric(12,2),
  currency_code text not null default 'USD',
  sale_or_rent text not null default 'sale',
  location text,
  phone_protected boolean not null default true,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists marketplace_phone_reveals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references marketplace_listings(id) on delete cascade,
  requester_email text,
  payment_hold_id uuid references payment_holds(id) on delete set null,
  revealed_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists marketplace_messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references marketplace_listings(id) on delete cascade,
  sender_email text,
  recipient_email text,
  body text not null,
  created_at timestamptz not null default now()
);

-- 4) Live delivery/service tracking
create table if not exists tracking_sessions (
  id uuid primary key default gen_random_uuid(),
  reference_type text not null,
  reference_id uuid,
  customer_email text,
  worker_id uuid references delivery_workers(id) on delete set null,
  status text not null default 'pending',
  current_lat numeric(10,7),
  current_lng numeric(10,7),
  last_seen_at timestamptz,
  eta_minutes integer,
  created_at timestamptz not null default now()
);

create table if not exists tracking_events (
  id uuid primary key default gen_random_uuid(),
  tracking_session_id uuid not null references tracking_sessions(id) on delete cascade,
  event_type text not null,
  latitude numeric(10,7),
  longitude numeric(10,7),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 5) Doctor/facility verification and contract lifecycle
create table if not exists verification_requests (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_email text,
  subject_id uuid,
  status text not null default 'submitted',
  documents jsonb not null default '[]'::jsonb,
  face_verification_status text not null default 'pending',
  contract_status text not null default 'pending',
  e_signature jsonb,
  reviewer_email text,
  reviewer_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists facility_verification_requests (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references institutions(id) on delete cascade,
  status text not null default 'submitted',
  documents jsonb not null default '[]'::jsonb,
  contract_status text not null default 'pending',
  e_signature jsonb,
  reviewer_email text,
  reviewer_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  contract_type text not null,
  subject_type text not null,
  subject_id uuid,
  version integer not null default 1,
  content text not null default '',
  status text not null default 'draft',
  signed_at timestamptz,
  signed_by text,
  created_at timestamptz not null default now()
);

-- 6) Long-term sessions, direct booking, hidden/open bids
create table if not exists session_requests (
  id uuid primary key default gen_random_uuid(),
  customer_email text,
  specialty_key text,
  provider_id uuid,
  package_name text,
  duration_days integer,
  request_type text not null default 'direct',
  budget numeric(12,2),
  currency_code text not null default 'USD',
  compensation_percent numeric(5,2) not null default 50,
  status text not null default 'open',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists session_bids (
  id uuid primary key default gen_random_uuid(),
  session_request_id uuid not null references session_requests(id) on delete cascade,
  provider_id uuid,
  provider_email text,
  amount numeric(12,2) not null default 0,
  currency_code text not null default 'USD',
  is_hidden boolean not null default false,
  note text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- 7) Complaints, provider penalties and AI-assisted review records
create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  reporter_email text,
  subject_type text not null,
  subject_id uuid,
  category text not null,
  body text not null,
  ai_summary text,
  ai_risk_level text,
  status text not null default 'open',
  resolution text,
  compensation_amount numeric(12,2) not null default 0,
  discount_code_id uuid references discount_codes(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists provider_penalties (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid,
  provider_email text,
  reason text not null,
  severity text not null default 'warning',
  points integer not null default 1,
  complaint_id uuid references complaints(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 8) Affiliate tree + campaigns
create table if not exists affiliate_nodes (
  id uuid primary key default gen_random_uuid(),
  affiliate_email text not null,
  parent_id uuid references affiliate_nodes(id) on delete set null,
  referral_code text unique not null,
  level integer not null default 0,
  clicks integer not null default 0,
  signups integer not null default 0,
  paid_conversions integer not null default 0,
  earned_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null,
  subject text,
  body text,
  locale text not null default 'ar',
  scheduled_at timestamptz,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 9) Media bank, badges and specialist assistant sessions
create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_email text,
  asset_type text not null,
  title text not null,
  storage_path text,
  mime_type text,
  tags text[] not null default '{}',
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists specialist_badges (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid,
  badge_key text not null,
  label jsonb not null default '{}'::jsonb,
  issued_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true
);

create table if not exists specialist_ai_sessions (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid,
  provider_email text,
  purpose text not null,
  messages jsonb not null default '[]'::jsonb,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10) Paid content secure downloads
create table if not exists secure_download_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text unique not null,
  user_email text,
  content_type text not null,
  content_id uuid,
  expires_at timestamptz not null,
  max_downloads integer not null default 1,
  download_count integer not null default 0,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_secure_download_expiry on secure_download_tokens(expires_at);

-- 11) Owner controls, backups, monitoring and supervisor room
create table if not exists owner_controls (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists content_backups (
  id uuid primary key default gen_random_uuid(),
  source_table text not null,
  source_id uuid,
  snapshot jsonb not null,
  reason text,
  created_at timestamptz not null default now(),
  restored_at timestamptz
);

create table if not exists system_health_events (
  id uuid primary key default gen_random_uuid(),
  component text not null,
  severity text not null default 'info',
  status text not null default 'open',
  message text not null,
  provider text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists supervisor_rooms (
  id uuid primary key default gen_random_uuid(),
  room_type text not null,
  title text not null,
  watermark text not null default 'sb1.com',
  locale text not null default 'ar',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists supervisor_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references supervisor_rooms(id) on delete cascade,
  sender_role text not null,
  sender_email text,
  body text not null,
  created_at timestamptz not null default now()
);

-- 12) Tax, gifts and owner payment sandbox configuration
create table if not exists owner_tax_profiles (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  legal_name text,
  tax_number text,
  address text,
  currency_code text not null default 'USD',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists gifts (
  id uuid primary key default gen_random_uuid(),
  sender_email text,
  recipient_email text,
  gift_type text not null,
  amount numeric(12,2) not null default 0,
  currency_code text not null default 'USD',
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists payment_sandbox_configs (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null,
  environment text not null default 'sandbox',
  enabled boolean not null default false,
  public_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 13) Notifications scope
create table if not exists notification_channels (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  channel_type text not null default 'global',
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 14) Watermark defaults / owner feature switches
insert into owner_controls(key,value)
values
 ('platform_watermark','{"text":"sb1.com","enabled":true}'),
 ('first_signup_discount','{"percent":10,"code":"SB1-FIRST-SIGNUP"}'),
 ('weekly_compounder','{"rate":0.05,"enabled":true}'),
 ('platform_content_revenue','{"platform_owned_share_percent":100}'),
 ('session_compensation','{"default_percent":50}'),
 ('secure_downloads','{"enabled":true}')
on conflict (key) do nothing;

-- 15) Helpful indexes
create index if not exists idx_payment_holds_status on payment_holds(status,created_at desc);
create index if not exists idx_tracking_events_session on tracking_events(tracking_session_id,created_at desc);
create index if not exists idx_verification_status on verification_requests(status,submitted_at desc);
create index if not exists idx_facility_verification_status on facility_verification_requests(status,submitted_at desc);
create index if not exists idx_session_requests_status on session_requests(status,created_at desc);
create index if not exists idx_session_bids_request on session_bids(session_request_id,created_at desc);
create index if not exists idx_complaints_status on complaints(status,created_at desc);
create index if not exists idx_health_events_status on system_health_events(status,created_at desc);
create index if not exists idx_notifications_user on notification_channels(user_email,created_at desc);

-- 16) RLS: public read for catalog/status tables; mutations go through controlled RPCs.
do $$
declare
  t text;
begin
  foreach t in array array[
    'question_pricing_rules','signup_promotions','payment_holds','compensation_rules',
    'discount_codes','marketplace_listings','marketplace_phone_reveals','marketplace_messages',
    'tracking_sessions','tracking_events','verification_requests','facility_verification_requests',
    'contracts','session_requests','session_bids','complaints','provider_penalties',
    'affiliate_nodes','marketing_campaigns','media_assets','specialist_badges','specialist_ai_sessions',
    'secure_download_tokens','owner_controls','content_backups','system_health_events',
    'supervisor_rooms','supervisor_messages','owner_tax_profiles','gifts','payment_sandbox_configs',
    'notification_channels'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "sb1_public_select" on %I', t);
    execute format('create policy "sb1_public_select" on %I for select to anon, authenticated using (true)', t);
  end loop;
end $$;

-- 17) Atomic split calculator used by payment workflows.
create or replace function sb1_calculate_split(
  p_gross numeric,
  p_platform_percent numeric default 10,
  p_provider_percent numeric default 85,
  p_agent_percent numeric default 5
)
returns json
language plpgsql
immutable
as $$
begin
  if p_gross < 0 or p_platform_percent < 0 or p_provider_percent < 0 or p_agent_percent < 0 then
    raise exception 'Amounts and percentages must be non-negative';
  end if;
  if round(p_platform_percent + p_provider_percent + p_agent_percent,2) <> 100 then
    raise exception 'Split percentages must total 100';
  end if;
  return json_build_object(
    'gross', p_gross,
    'platform', round(p_gross * p_platform_percent / 100,2),
    'provider', round(p_gross * p_provider_percent / 100,2),
    'agent', round(p_gross * p_agent_percent / 100,2)
  );
end;
$$;

grant execute on function sb1_calculate_split(numeric,numeric,numeric,numeric) to anon, authenticated;

-- 18) Secure download token issuing/consumption.
create or replace function sb1_issue_download_token(
  p_user_email text,
  p_content_type text,
  p_content_id uuid,
  p_ttl_minutes integer default 30,
  p_max_downloads integer default 1
)
returns text
language plpgsql
security definer
set search_path=public
as $$
declare
  v_token text := encode(gen_random_bytes(32),'hex');
begin
  insert into secure_download_tokens(token_hash,user_email,content_type,content_id,expires_at,max_downloads)
  values (encode(digest(v_token,'sha256'),'hex'),p_user_email,p_content_type,p_content_id,
          now() + make_interval(mins=>greatest(1,p_ttl_minutes)),greatest(1,p_max_downloads));
  return v_token;
end;
$$;

create or replace function sb1_consume_download_token(p_token text)
returns json
language plpgsql
security definer
set search_path=public
as $$
declare v_row secure_download_tokens;
begin
  select * into v_row
  from secure_download_tokens
  where token_hash=encode(digest(p_token,'sha256'),'hex')
    and revoked_at is null
    and expires_at > now()
    and download_count < max_downloads
  for update;

  if not found then
    return json_build_object('valid',false,'reason','expired_or_exhausted');
  end if;

  update secure_download_tokens
  set download_count=download_count+1
  where id=v_row.id;

  return json_build_object(
    'valid',true,'content_type',v_row.content_type,'content_id',v_row.content_id,
    'user_email',v_row.user_email,'remaining_downloads',v_row.max_downloads-v_row.download_count-1
  );
end;
$$;

grant execute on function sb1_issue_download_token(text,text,uuid,integer,integer) to anon, authenticated;
grant execute on function sb1_consume_download_token(text) to anon, authenticated;
