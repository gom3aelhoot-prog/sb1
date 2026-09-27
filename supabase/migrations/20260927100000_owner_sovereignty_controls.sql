-- SB1 owner sovereignty control plane
create table if not exists public.owner_content_controls (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_id text not null,
  publication_status text not null default 'published' check (publication_status in ('draft','published','hidden','blocked','deleted')),
  billing_mode text not null default 'free' check (billing_mode in ('free','paid')),
  base_price numeric(12,2) not null default 0,
  currency text not null default 'USD',
  country_prices jsonb not null default '{}'::jsonb,
  country_currencies jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  updated_by uuid,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(content_type,content_id)
);
create index if not exists owner_content_controls_type_idx on public.owner_content_controls(content_type,publication_status);

create table if not exists public.owner_account_exceptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  account_type text not null check (account_type in ('doctor','specialist','clinic','lab','radiology','facility','pharmacy','delivery','other')),
  display_name text,
  skip_contracts boolean not null default false,
  skip_document_verification boolean not null default false,
  skip_digital_signature boolean not null default false,
  active boolean not null default true,
  notes text,
  granted_by uuid,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index if not exists owner_account_exceptions_user_idx on public.owner_account_exceptions(user_id,active);

create table if not exists public.owner_control_audit (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  target_type text,
  target_id text,
  actor_user_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.owner_content_controls enable row level security;
alter table public.owner_account_exceptions enable row level security;
alter table public.owner_control_audit enable row level security;
drop policy if exists "owner content controls read" on public.owner_content_controls;
create policy "owner content controls read" on public.owner_content_controls for select using (public.sb1_can_admin('owner'));
drop policy if exists "owner exceptions read" on public.owner_account_exceptions;
create policy "owner exceptions read" on public.owner_account_exceptions for select using (public.sb1_can_admin('owner'));
drop policy if exists "owner audit read" on public.owner_control_audit;
create policy "owner audit read" on public.owner_control_audit for select using (public.sb1_can_admin('owner'));

create or replace function public.sb1_owner_set_content_control(
  p_content_type text,p_content_id text,p_publication_status text,p_billing_mode text,
  p_base_price numeric default 0,p_currency text default 'USD',
  p_country_prices jsonb default '{}'::jsonb,p_country_currencies jsonb default '{}'::jsonb,p_metadata jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path=public as $$
begin
 if not public.sb1_can_admin('owner') then raise exception 'OWNER_FORBIDDEN'; end if;
 if p_content_type is null or p_content_id is null then raise exception 'CONTENT_TARGET_REQUIRED'; end if;
 if p_publication_status not in ('draft','published','hidden','blocked','deleted') then raise exception 'BAD_PUBLICATION_STATUS'; end if;
 if p_billing_mode not in ('free','paid') then raise exception 'BAD_BILLING_MODE'; end if;
 insert into public.owner_content_controls(content_type,content_id,publication_status,billing_mode,base_price,currency,country_prices,country_currencies,metadata,updated_by,updated_at)
 values(p_content_type,p_content_id,p_publication_status,p_billing_mode,greatest(coalesce(p_base_price,0),0),upper(coalesce(p_currency,'USD')),coalesce(p_country_prices,'{}'),coalesce(p_country_currencies,'{}'),coalesce(p_metadata,'{}'),auth.uid(),now())
 on conflict(content_type,content_id) do update set publication_status=excluded.publication_status,billing_mode=excluded.billing_mode,base_price=excluded.base_price,currency=excluded.currency,country_prices=excluded.country_prices,country_currencies=excluded.country_currencies,metadata=excluded.metadata,updated_by=auth.uid(),updated_at=now();
 insert into public.owner_control_audit(action,target_type,target_id,actor_user_id,details) values('content_control',p_content_type,p_content_id,auth.uid(),jsonb_build_object('publication_status',p_publication_status,'billing_mode',p_billing_mode,'base_price',p_base_price,'currency',p_currency,'country_prices',p_country_prices,'country_currencies',p_country_currencies));
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.sb1_owner_set_account_control(
 p_user_id uuid default null,p_email text default null,p_account_type text default 'other',p_display_name text default null,
 p_skip_contracts boolean default true,p_skip_document_verification boolean default true,p_skip_digital_signature boolean default true,
 p_active boolean default true,p_notes text default null
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if not public.sb1_can_admin('owner') then raise exception 'OWNER_FORBIDDEN'; end if;
 insert into public.owner_account_exceptions(user_id,email,account_type,display_name,skip_contracts,skip_document_verification,skip_digital_signature,active,notes,granted_by)
 values(p_user_id,p_email,p_account_type,p_display_name,p_skip_contracts,p_skip_document_verification,p_skip_digital_signature,p_active,p_notes,auth.uid())
 returning id into v_id;
 insert into public.owner_control_audit(action,target_type,target_id,actor_user_id,details) values('account_exception',p_account_type,coalesce(p_user_id::text,p_email),auth.uid(),jsonb_build_object('skip_contracts',p_skip_contracts,'skip_document_verification',p_skip_document_verification,'skip_digital_signature',p_skip_digital_signature,'display_name',p_display_name));
 return jsonb_build_object('ok',true,'exception_id',v_id);
end $$;

create or replace function public.sb1_owner_set_account_status(p_user_key text,p_status text,p_reason text default null)
returns jsonb language plpgsql security definer set search_path=public as $$
begin
 if not public.sb1_can_admin('owner') then raise exception 'OWNER_FORBIDDEN'; end if;
 if p_status not in ('active','suspended','deleted') then raise exception 'BAD_STATUS'; end if;
 insert into public.sb1_account_moderation(user_key,status,reason,permanent,updated_at)
 values(p_user_key,p_status,p_reason,p_status='deleted',now())
 on conflict(user_key) do update set status=excluded.status,reason=excluded.reason,permanent=excluded.permanent,updated_at=now();
 insert into public.owner_control_audit(action,target_type,target_id,actor_user_id,details) values('account_status', 'account',p_user_key,auth.uid(),jsonb_build_object('status',p_status,'reason',p_reason));
 return jsonb_build_object('ok',true,'status',p_status);
end $$;

grant execute on function public.sb1_owner_set_content_control(text,text,text,text,numeric,text,jsonb,jsonb,jsonb) to authenticated;
grant execute on function public.sb1_owner_set_account_control(uuid,text,text,text,boolean,boolean,boolean,boolean,text) to authenticated;
grant execute on function public.sb1_owner_set_account_status(text,text,text) to authenticated;