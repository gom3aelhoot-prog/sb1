create table if not exists public.contract_templates (
  id text primary key,
  template_key text not null,
  title text not null,
  category text not null default 'custom',
  language text not null default 'ar',
  body text not null default '',
  is_active boolean not null default true,
  disabled_until timestamptz,
  version integer not null default 1,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contract_templates_language_idx on public.contract_templates(language);
create index if not exists contract_templates_active_idx on public.contract_templates(is_active,disabled_until);
create table if not exists public.contract_deliveries (
  id uuid primary key default gen_random_uuid(),
  template_id text references public.contract_templates(id) on delete set null,
  channel text not null,
  target text,
  sent_at timestamptz not null default now(),
  sent_by uuid,
  metadata jsonb not null default '{}'::jsonb
);
create table if not exists public.contract_audit_log (
  id uuid primary key default gen_random_uuid(),
  template_id text references public.contract_templates(id) on delete set null,
  action text not null,
  version integer,
  actor_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.contract_templates enable row level security;
alter table public.contract_deliveries enable row level security;
alter table public.contract_audit_log enable row level security;
