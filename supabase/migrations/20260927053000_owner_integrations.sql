create table if not exists public.owner_integrations (
  id uuid primary key default gen_random_uuid(),
  provider text unique not null,
  name jsonb not null default '{}'::jsonb,
  website_url text,
  dashboard_url text,
  account_label text,
  project_label text,
  status text not null default 'not_configured' check (status in ('connected','configured','available','not_configured','error')),
  enabled boolean not null default true,
  environment text not null default 'production' check (environment in ('production','preview','development')),
  config jsonb not null default '{}'::jsonb,
  secret_env_keys text[] not null default '{}',
  notes jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.owner_integrations enable row level security;
alter table public.owner_integrations force row level security;
drop policy if exists "owner reads integrations" on public.owner_integrations;
create policy "owner reads integrations" on public.owner_integrations for select using (public.sb1_can_admin('owner'));
drop policy if exists "owner writes integrations" on public.owner_integrations;
create policy "owner writes integrations" on public.owner_integrations for all using (public.sb1_can_admin('owner')) with check (public.sb1_can_admin('owner'));

insert into public.owner_integrations(provider,name,website_url,dashboard_url,account_label,project_label,status,enabled,secret_env_keys,notes)
values
('github','{"ar":"GitHub","en":"GitHub","ru":"GitHub"}','https://github.com','https://github.com/gom3aelhoot-prog/sb1','gom3aelhoot-prog','sb1','connected',true,'{}','{"ar":"مستودع المصدر الخاص بـ SB1"}'),
('vercel','{"ar":"Vercel","en":"Vercel","ru":"Vercel"}','https://vercel.com','https://vercel.com/gamynady1256-9909/sb1','gamynady1256-9909','sb1','connected',true,'{}','{"ar":"النشر والاستضافة الحالية"}'),
('supabase','{"ar":"Supabase","en":"Supabase","ru":"Supabase"}','https://supabase.com','https://supabase.com/dashboard','SB1 database/auth/storage','SB1','configured',true,'VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY','{"ar":"قاعدة البيانات والمصادقة والتخزين؛ مفاتيح الخادم لا تُعرض هنا"}'),
('stripe','{"ar":"Stripe","en":"Stripe","ru":"Stripe"}','https://stripe.com','https://dashboard.stripe.com','SB1 payments','Stripe Connect','not_configured',true,'STRIPE_SECRET_KEY,STRIPE_CONNECT_ACCOUNT_ID,SB1_PLATFORM_FEE_PERCENT,SB1_PUBLIC_URL','{"ar":"يظهر متصلاً فقط بعد إضافة مفاتيح الخادم والتحقق منها"}'),
('jitsi','{"ar":"Jitsi Meet","en":"Jitsi Meet","ru":"Jitsi Meet"}','https://meet.jit.si','https://meet.jit.si','Public rooms','SB1 video rooms','available',true,'{}','{"ar":"غرف الاجتماعات الحالية مجانية وتجريبية"}'),
('ai_provider','{"ar":"مزود الذكاء الاصطناعي","en":"AI Provider","ru":"ИИ-провайдер"}','https://platform.openai.com','https://platform.openai.com/api-keys','SB1 AI','AI API','not_configured',true,'OPENAI_API_KEY','{"ar":"لا يتم تخزين المفتاح داخل الواجهة"}'),
('messaging','{"ar":"SMS / WhatsApp","en":"SMS / WhatsApp","ru":"SMS / WhatsApp"}','https://www.twilio.com','https://console.twilio.com','SB1 notifications','Messaging','not_configured',false,'TWILIO_ACCOUNT_SID,TWILIO_AUTH_TOKEN,TWILIO_PHONE_NUMBER','{"ar":"يتطلب حساب مزود رسائل"}'),
('delivery','{"ar":"خدمات التوصيل","en":"Delivery Provider","ru":"Служба доставки"}','https://www.google.com/maps','', 'SB1 pharmacy delivery','Logistics','not_configured',false,'DELIVERY_API_KEY','{"ar":"يتطلب مزود توصيل فعلي"}')
on conflict(provider) do update set name=excluded.name,website_url=excluded.website_url,dashboard_url=excluded.dashboard_url,account_label=excluded.account_label,project_label=excluded.project_label,secret_env_keys=excluded.secret_env_keys,notes=excluded.notes,updated_at=now();

create index if not exists owner_integrations_provider_idx on public.owner_integrations(provider);