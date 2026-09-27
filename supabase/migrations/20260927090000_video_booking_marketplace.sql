-- SB1 video booking: direct appointments + open/hidden specialist requests + bid offers + guarantee discounts
create table if not exists public.sb1_video_appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  specialist_id uuid,
  scheduled_start timestamptz not null,
  duration_minutes integer not null default 60 check (duration_minutes between 15 and 180),
  price numeric(12,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending','accepted','rejected','cancelled','completed','no_show')),
  meeting_url text,
  customer_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_video_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  specialty_slug text not null,
  language_code text not null,
  country_code text,
  visibility text not null default 'open' check (visibility in ('open','hidden')),
  problem text not null,
  specialist_requirements text,
  target_session_price numeric(12,2),
  target_currency text,
  available_time text,
  listing_days integer not null check (listing_days in (3,5,7)),
  specialist_target integer not null check (specialist_target in (5,10,15,20)),
  request_fee numeric(12,2) not null default 0,
  request_fee_currency text not null default 'USD',
  status text not null default 'pending_payment' check (status in ('pending_payment','open','expired','fulfilled','no_response','complaint_review','discount_awarded','closed')),
  min_offer_count integer not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.sb1_video_request_offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.sb1_video_requests(id) on delete cascade,
  specialist_id uuid,
  specialist_name text,
  comment text not null,
  offer_price numeric(12,2) not null,
  currency text not null,
  duration_minutes integer not null default 60,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','withdrawn')),
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_video_request_payments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.sb1_video_requests(id) on delete cascade,
  customer_id uuid,
  amount numeric(12,2) not null,
  currency text not null,
  provider text,
  provider_reference text,
  status text not null default 'pending' check (status in ('pending','paid','refunded','failed')),
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_request_guarantee_discounts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  source_request_id uuid references public.sb1_video_requests(id) on delete set null,
  reason text not null check (reason in ('no_response','target_not_reached','justified_complaint')),
  percentage integer not null default 50 check (percentage=50),
  status text not null default 'available' check (status in ('available','used','revoked')),
  admin_reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create index if not exists idx_sb1_video_requests_match on public.sb1_video_requests(specialty_slug,language_code,country_code,status);
create index if not exists idx_sb1_video_request_offers_request on public.sb1_video_request_offers(request_id);
create index if not exists idx_sb1_video_appointments_specialist_time on public.sb1_video_appointments(specialist_id,scheduled_start);

alter table public.sb1_video_appointments enable row level security;
alter table public.sb1_video_requests enable row level security;
alter table public.sb1_video_request_offers enable row level security;
alter table public.sb1_video_request_payments enable row level security;
alter table public.sb1_request_guarantee_discounts enable row level security;

drop policy if exists "sb1 appointments own access" on public.sb1_video_appointments;
create policy "sb1 appointments own access" on public.sb1_video_appointments for all using (auth.uid() = customer_id or auth.uid() = specialist_id) with check (auth.uid() = customer_id or auth.uid() = specialist_id);

drop policy if exists "sb1 requests customer access" on public.sb1_video_requests;
create policy "sb1 requests customer access" on public.sb1_video_requests for select using (auth.uid() = customer_id or visibility='open');
create policy "sb1 requests customer create" on public.sb1_video_requests for insert with check (auth.uid() = customer_id);
create policy "sb1 requests customer update" on public.sb1_video_requests for update using (auth.uid() = customer_id) with check (auth.uid() = customer_id);

drop policy if exists "sb1 request offers access" on public.sb1_video_request_offers;
create policy "sb1 request offers access" on public.sb1_video_request_offers for select using (exists(select 1 from public.sb1_video_requests r where r.id=request_id and (r.customer_id=auth.uid() or r.visibility='open')));
create policy "sb1 request offers create" on public.sb1_video_request_offers for insert with check (auth.uid() = specialist_id);

drop policy if exists "sb1 request payments customer access" on public.sb1_video_request_payments;
create policy "sb1 request payments customer access" on public.sb1_video_request_payments for all using (auth.uid() = customer_id) with check (auth.uid() = customer_id);

drop policy if exists "sb1 guarantee discounts customer access" on public.sb1_request_guarantee_discounts;
create policy "sb1 guarantee discounts customer access" on public.sb1_request_guarantee_discounts for select using (auth.uid() = customer_id);
