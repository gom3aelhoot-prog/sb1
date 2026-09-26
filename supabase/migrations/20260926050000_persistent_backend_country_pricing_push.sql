-- SB1 persistent backend, country pricing, consultation requests, replies and push notifications.
-- This migration adds only the infrastructure requested for persistent requests/push and country-based pricing.

create table if not exists public.country_service_prices (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  service_type text not null,
  currency_code text not null,
  currency_symbol text not null,
  price_usd numeric(12,2) not null check (price_usd >= 0),
  local_price numeric(14,2) not null check (local_price >= 0),
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(country_code, service_type)
);
alter table public.country_service_prices enable row level security;
drop policy if exists "public read country service prices" on public.country_service_prices;
create policy "public read country service prices" on public.country_service_prices for select to anon, authenticated using (is_active = true);
drop policy if exists "public manage country service prices" on public.country_service_prices;
create policy "public manage country service prices" on public.country_service_prices for all to anon, authenticated using (true) with check (true);

create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete set null,
  patient_name text not null,
  patient_id uuid,
  specialty_id uuid references public.specialties(id) on delete set null,
  country_code text not null,
  language_code text not null,
  service_type text not null default 'question',
  price_usd numeric(12,2) not null default 0,
  local_price numeric(14,2) not null default 0,
  currency_code text not null default 'USD',
  duration_days integer not null default 7 check (duration_days between 1 and 90),
  specialists_limit integer not null default 5 check (specialists_limit between 1 and 100),
  answers_limit integer not null default 3 check (answers_limit between 1 and 20),
  response_speed text not null default 'standard' check (response_speed in ('standard','fast','instant')),
  status text not null default 'pending' check (status in ('pending','active','answered','closed','expired','cancelled')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.consultation_requests enable row level security;
drop policy if exists "public read consultation requests" on public.consultation_requests;
create policy "public read consultation requests" on public.consultation_requests for select to anon, authenticated using (true);
drop policy if exists "public create consultation requests" on public.consultation_requests;
create policy "public create consultation requests" on public.consultation_requests for insert to anon, authenticated with check (true);
drop policy if exists "public update consultation requests" on public.consultation_requests;
create policy "public update consultation requests" on public.consultation_requests for update to anon, authenticated using (true) with check (true);

create table if not exists public.consultation_request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.consultation_requests(id) on delete cascade,
  sender_type text not null check (sender_type in ('patient','specialist','system')),
  sender_id uuid,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.consultation_request_messages enable row level security;
drop policy if exists "public crud consultation request messages" on public.consultation_request_messages;
create policy "public crud consultation request messages" on public.consultation_request_messages for all to anon, authenticated using (true) with check (true);

create table if not exists public.question_followups (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  answer_id uuid,
  sender_type text not null check (sender_type in ('patient','specialist')),
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.question_followups enable row level security;
drop policy if exists "public crud question followups" on public.question_followups;
create policy "public crud question followups" on public.question_followups for all to anon, authenticated using (true) with check (true);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_id uuid,
  language_code text,
  country_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "public create push subscriptions" on public.push_subscriptions;
create policy "public create push subscriptions" on public.push_subscriptions for insert to anon, authenticated with check (true);
drop policy if exists "public update push subscriptions" on public.push_subscriptions;
create policy "public update push subscriptions" on public.push_subscriptions for update to anon, authenticated using (true) with check (true);
drop policy if exists "public delete push subscriptions" on public.push_subscriptions;
create policy "public delete push subscriptions" on public.push_subscriptions for delete to anon, authenticated using (true);
drop policy if exists "public read own push subscriptions" on public.push_subscriptions;
create policy "public read own push subscriptions" on public.push_subscriptions for select to anon, authenticated using (true);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  notification_type text not null,
  title text not null,
  body text not null,
  reference_id text,
  language_code text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
drop policy if exists "public crud notifications" on public.notifications;
create policy "public crud notifications" on public.notifications for all to anon, authenticated using (true) with check (true);

create index if not exists consultation_requests_status_expires_idx on public.consultation_requests(status, expires_at);
create index if not exists consultation_requests_country_service_idx on public.consultation_requests(country_code, service_type, created_at desc);
create index if not exists consultation_request_messages_request_created_idx on public.consultation_request_messages(request_id, created_at);
create index if not exists question_followups_question_created_idx on public.question_followups(question_id, created_at);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
create index if not exists push_subscriptions_country_language_idx on public.push_subscriptions(country_code, language_code);

-- Country pricing seed: local prices are explicit per country and service.
-- Service types cover the existing paid SB1 services without changing their pages.
insert into public.country_service_prices(country_code,service_type,currency_code,currency_symbol,price_usd,local_price)
values
('SA','question','SAR','ر.س',9,33.75),('SA','session','SAR','ر.س',25,93.75),('SA','course','SAR','ر.س',19,71.25),('SA','test','SAR','ر.س',5,18.75),('SA','subscription','SAR','ر.س',9.99,37.46),
('AE','question','AED','د.إ',10,36.70),('AE','session','AED','د.إ',28,102.76),('AE','course','AED','د.إ',21,77.07),('AE','test','AED','د.إ',6,22.02),('AE','subscription','AED','د.إ',11,40.37),
('EG','question','EGP','ج.م',7,339.50),('EG','session','EGP','ج.م',20,970.00),('EG','course','EGP','ج.م',15,727.50),('EG','test','EGP','ج.م',4,194.00),('EG','subscription','EGP','ج.م',8,388.00),
('IQ','question','IQD','ع.د',7,9170),('IQ','session','IQD','ع.د',20,26200),('IQ','course','IQD','ع.د',15,19650),('IQ','test','IQD','ع.د',4,5240),('IQ','subscription','IQD','ع.د',8,10480),
('JO','question','JOD','د.ا',8,5.68),('JO','session','JOD','د.ا',22,15.62),('JO','course','JOD','د.ا',16,11.36),('JO','test','JOD','د.ا',5,3.55),('JO','subscription','JOD','د.ا',9,6.39),
('KW','question','KWD','د.ك',9,2.79),('KW','session','KWD','د.ك',27,8.37),('KW','course','KWD','د.ك',20,6.20),('KW','test','KWD','د.ك',6,1.86),('KW','subscription','KWD','د.ك',10,3.10),
('LB','question','LBP','ل.ل',5,447500),('LB','session','LBP','ل.ل',18,1611000),('LB','course','LBP','ل.ل',13,1163500),('LB','test','LBP','ل.ل',3,268500),('LB','subscription','LBP','ل.ل',7,626500),
('LY','question','LYD','ل.د',6,29.10),('LY','session','LYD','ل.د',18,87.30),('LY','course','LYD', 'ل.د',14,67.90),('LY','test','LYD','ل.د',4,19.40),('LY','subscription','LYD','ل.د',8,38.80),
('MA','question','MAD','د.م',6,59.70),('MA','session','MAD','د.م',18,179.10),('MA','course','MAD','د.م',14,139.30),('MA','test','MAD','د.م',4,39.80),('MA','subscription','MAD','د.م',8,79.60),
('OM','question','OMR','ر.ع',9,3.51),('OM','session','OMR','ر.ع',28,10.92),('OM','course','OMR','ر.ع',21,8.19),('OM','test','OMR','ر.ع',6,2.34),('OM','subscription','OMR','ر.ع',11,4.29),
('PS','question','ILS','₪',8,29.60),('PS','session','ILS','₪',24,88.80),('PS','course','ILS','₪',18,66.60),('PS','test','ILS','₪',5,18.50),('PS','subscription','ILS','₪',10,37.00),
('QA','question','QAR','ر.ق',9,32.76),('QA','session','QAR','ر.ق',26,94.64),('QA','course','QAR','ر.ق',20,72.80),('QA','test','QAR','ر.ق',6,21.84),('QA','subscription','QAR','ر.ق',11,40.04),
('SY','question','SYP','ل.س',5,65000),('SY','session','SYP','ل.س',15,195000),('SY','course','SYP','ل.س',12,156000),('SY','test','SYP','ل.س',3,39000),('SY','subscription','SYP','ل.س',7,91000),
('TN','question','TND','د.ت',6,18.60),('TN','session','TND','د.ت',18,55.80),('TN','course','TND','د.ت',14,43.40),('TN','test','TND','د.ت',4,12.40),('TN','subscription','TND','د.ت',8,24.80),
('YE','question','YER','ر.ي',5,1250),('YE','session','YER','ر.ي',15,3750),('YE','course','YER','ر.ي',12,3000),('YE','test','YER','ر.ي',3,750),('YE','subscription','YER','ر.ي',7,1750),
('DZ','question','DZD','د.ج',6,804),('DZ','session','DZD','د.ج',18,2412),('DZ','course','DZD','د.ج',14,1876),('DZ','test','DZD','د.ج',4,536),('DZ','subscription','DZD','د.ج',8,1072),
('BH','question','BHD','د.ب',9,3.42),('BH','session','BHD','د.ب',28,10.64),('BH','course','BHD','د.ب',21,7.98),('BH','test','BHD','د.ب',6,2.28),('BH','subscription','BHD','د.ب',11,4.18),
('MR','question','MRU','أ.م',5,197.50),('MR','session','MRU','أ.م',15,592.50),('MR','course','MRU','أ.م',12,474.00),('MR','test','MRU','أ.م',3,118.50),('MR','subscription','MRU','أ.م',7,276.50),
('SD','question','SDG','ج.س',5,2750),('SD','session','SDG','ج.س',15,8250),('SD','course','SDG','ج.س',12,6600),('SD','test','SDG','ج.س',3,1650),('SD','subscription','SDG','ج.س',7,3850),
('SO','question','SOS','S.Sh',5,2850),('SO','session','SOS','S.Sh',15,8550),('SO','course','SOS','S.Sh',12,6840),('SO','test','SOS','S.Sh',3,1710),('SO','subscription','SOS','S.Sh',7,3990),
('KM','question','KMF','CF',5,2200),('KM','session','KMF','CF',15,6600),('KM','course','KMF','CF',12,5280),('KM','test','KMF','CF',3,1320),('KM','subscription','KMF','CF',7,3080),
('DJ','question','DJF','Fdj',5,900),('DJ','session','DJF','Fdj',15,2700),('DJ','course','DJF','Fdj',12,2160),('DJ','test','DJF','Fdj',3,540),('DJ','subscription','DJF','Fdj',7,1260)
on conflict(country_code,service_type) do update set currency_code=excluded.currency_code,currency_symbol=excluded.currency_symbol,price_usd=excluded.price_usd,local_price=excluded.local_price,updated_at=now();

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='consultation_requests') then alter publication supabase_realtime add table public.consultation_requests; end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='consultation_request_messages') then alter publication supabase_realtime add table public.consultation_request_messages; end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='question_followups') then alter publication supabase_realtime add table public.question_followups; end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='notifications') then alter publication supabase_realtime add table public.notifications; end if;
end $$;


do $$
begin
  if to_regclass('public.profiles') is not null then
    alter table public.profiles add column if not exists country_code text;
    alter table public.profiles add column if not exists language_code text;
  end if;
  if to_regclass('public.doctors') is not null then
    alter table public.doctors add column if not exists country_code text;
    alter table public.doctors add column if not exists language_code text;
  end if;
  if to_regclass('public.institutions') is not null then
    alter table public.institutions add column if not exists country_code text;
    alter table public.institutions add column if not exists language_code text;
  end if;
end $$;
