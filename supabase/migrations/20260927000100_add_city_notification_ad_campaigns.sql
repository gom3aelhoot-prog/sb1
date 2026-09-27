-- SB1 city-targeted notification advertising campaigns
create table if not exists public.sb1_audience_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text,
  email text,
  role text not null default 'client',
  country_code text not null,
  city text not null,
  language_code text not null default 'ar',
  last_seen_at timestamptz,
  notification_enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_sb1_audience_city on public.sb1_audience_profiles(country_code,city);
create index if not exists idx_sb1_audience_last_seen on public.sb1_audience_profiles(last_seen_at);
create table if not exists public.sb1_notification_campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser_user_id uuid,
  advertiser_role text not null,
  institution_id uuid,
  title text not null,
  body text not null,
  destination_url text,
  country_code text not null,
  city text not null,
  audience_mode text not null default 'all_registered',
  requested_recipients integer not null default 0,
  duration_days integer not null default 1,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  base_daily_price numeric(12,2) not null default 5,
  price_per_recipient numeric(12,4) not null default 0.01,
  price_per_open numeric(12,4) not null default 0.08,
  price_per_purchase numeric(12,2) not null default 1,
  budget_cap numeric(12,2),
  status text not null default 'draft',
  created_at timestamptz not null default now()
);
create index if not exists idx_sb1_campaign_city on public.sb1_notification_campaigns(country_code,city,status);
create table if not exists public.sb1_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.sb1_notification_campaigns(id) on delete cascade,
  audience_profile_id uuid not null references public.sb1_audience_profiles(id) on delete cascade,
  sent_at timestamptz,
  delivered_at timestamptz,
  opened_at timestamptz,
  destination_clicked_at timestamptz,
  purchase_at timestamptz,
  purchase_id text,
  charged_send numeric(12,4) not null default 0,
  charged_open numeric(12,4) not null default 0,
  charged_purchase numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique(campaign_id,audience_profile_id)
);
create index if not exists idx_sb1_delivery_campaign on public.sb1_notification_deliveries(campaign_id);
create index if not exists idx_sb1_delivery_audience on public.sb1_notification_deliveries(audience_profile_id);
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists last_seen_at timestamptz;
alter table public.institutions add column if not exists city text;
alter table public.institutions add column if not exists owner_user_id uuid;
alter table public.sb1_audience_profiles enable row level security;
alter table public.sb1_notification_campaigns enable row level security;
alter table public.sb1_notification_deliveries enable row level security;
create policy if not exists "sb1 audience authenticated read" on public.sb1_audience_profiles for select to authenticated using (true);
create policy if not exists "sb1 audience own insert" on public.sb1_audience_profiles for insert to authenticated with check (user_id = auth.uid() or user_id is null);
create policy if not exists "sb1 audience own update" on public.sb1_audience_profiles for update to authenticated using (user_id = auth.uid() or user_id is null);
create policy if not exists "sb1 campaigns authenticated read" on public.sb1_notification_campaigns for select to authenticated using (true);
create policy if not exists "sb1 campaigns authenticated insert" on public.sb1_notification_campaigns for insert to authenticated with check (advertiser_user_id = auth.uid() or advertiser_user_id is null);
create policy if not exists "sb1 campaigns owner update" on public.sb1_notification_campaigns for update to authenticated using (advertiser_user_id = auth.uid() or advertiser_user_id is null);
create policy if not exists "sb1 deliveries recipient read" on public.sb1_notification_deliveries for select to authenticated using (
  audience_profile_id in (select id from public.sb1_audience_profiles where user_id = auth.uid())
  or campaign_id in (select id from public.sb1_notification_campaigns where advertiser_user_id = auth.uid())
);
create policy if not exists "sb1 deliveries insert" on public.sb1_notification_deliveries for insert to authenticated with check (
  campaign_id in (select id from public.sb1_notification_campaigns where advertiser_user_id = auth.uid() or advertiser_user_id is null)
);
create policy if not exists "sb1 deliveries recipient update" on public.sb1_notification_deliveries for update to authenticated using (
  audience_profile_id in (select id from public.sb1_audience_profiles where user_id = auth.uid())
);
