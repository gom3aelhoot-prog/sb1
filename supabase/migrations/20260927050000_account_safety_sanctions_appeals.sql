-- SB1 account safety enforcement, automatic escalating sanctions, owner/moderator alerts and appeals
create extension if not exists pgcrypto;

create table if not exists public.sb1_account_moderation (
  user_key text primary key,
  status text not null default 'active' check (status in ('active','suspended','deleted')),
  strike_count integer not null default 0,
  sanction_level text,
  reason text,
  suspended_until timestamptz,
  permanent boolean not null default false,
  updated_at timestamptz not null default now()
);

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
create index if not exists sb1_safety_sanctions_user_idx on public.sb1_safety_sanctions(user_key, created_at desc);

create table if not exists public.sb1_owner_alerts (
  id uuid primary key default gen_random_uuid(),
  alert_type text not null,
  user_key text not null,
  strike integer,
  reason text,
  level text,
  evidence_image text,
  recipients text[] not null default array['owner','moderators'],
  read_by jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists sb1_owner_alerts_created_idx on public.sb1_owner_alerts(created_at desc);

create table if not exists public.sb1_safety_appeals (
  id uuid primary key default gen_random_uuid(),
  user_key text not null,
  sanction_id uuid references public.sb1_safety_sanctions(id) on delete set null,
  complaint text not null,
  evidence_image text,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  reviewer_user_id uuid,
  reviewer_role text,
  reviewer_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists sb1_safety_appeals_status_idx on public.sb1_safety_appeals(status, created_at desc);

alter table public.sb1_account_moderation enable row level security;
alter table public.sb1_safety_sanctions enable row level security;
alter table public.sb1_owner_alerts enable row level security;
alter table public.sb1_safety_appeals enable row level security;

drop policy if exists "users read own moderation" on public.sb1_account_moderation;
create policy "users read own moderation" on public.sb1_account_moderation for select to authenticated using (user_key=auth.uid()::text);
drop policy if exists "admins read moderation" on public.sb1_account_moderation;
create policy "admins read moderation" on public.sb1_account_moderation for select to authenticated using (public.sb1_can_admin('moderator'));

drop policy if exists "users read own sanctions" on public.sb1_safety_sanctions;
create policy "users read own sanctions" on public.sb1_safety_sanctions for select to authenticated using (user_key=auth.uid()::text);
drop policy if exists "admins read sanctions" on public.sb1_safety_sanctions;
create policy "admins read sanctions" on public.sb1_safety_sanctions for select to authenticated using (public.sb1_can_admin('moderator'));

drop policy if exists "users create appeals" on public.sb1_safety_appeals;
create policy "users create appeals" on public.sb1_safety_appeals for insert to authenticated with check (user_key=auth.uid()::text);
drop policy if exists "users read own appeals" on public.sb1_safety_appeals;
create policy "users read own appeals" on public.sb1_safety_appeals for select to authenticated using (user_key=auth.uid()::text);
drop policy if exists "admins read appeals" on public.sb1_safety_appeals;
create policy "admins read appeals" on public.sb1_safety_appeals for select to authenticated using (public.sb1_can_admin('moderator'));

drop policy if exists "admins read alerts" on public.sb1_owner_alerts;
create policy "admins read alerts" on public.sb1_owner_alerts for select to authenticated using (public.sb1_can_admin('moderator'));

create or replace function public.sb1_record_violation(
  p_user_key text,
  p_reason text,
  p_evidence_image text default null
) returns jsonb
language plpgsql security definer set search_path=public
as $$
declare
  v_strike integer;
  v_level text;
  v_until timestamptz;
  v_permanent boolean;
  v_sanction_id uuid;
begin
  if p_user_key is null or length(trim(p_user_key))=0 then raise exception 'USER_REQUIRED'; end if;
  select coalesce(max(strike),0)+1 into v_strike from public.sb1_safety_sanctions where user_key=p_user_key;
  v_permanent := v_strike >= 4;
  if v_strike=1 then v_level:='1 hour'; v_until:=now()+interval '1 hour';
  elsif v_strike=2 then v_level:='24 hours'; v_until:=now()+interval '24 hours';
  elsif v_strike=3 then v_level:='7 days'; v_until:=now()+interval '7 days';
  else v_level:='permanent'; v_until:=null; end if;
  insert into public.sb1_safety_sanctions(user_key,strike,reason,until_at,level,permanent,evidence_image)
    values(p_user_key,v_strike,p_reason,v_until,v_level,v_permanent,p_evidence_image)
    returning id into v_sanction_id;
  insert into public.sb1_account_moderation(user_key,status,strike_count,sanction_level,reason,suspended_until,permanent,updated_at)
    values(p_user_key,case when v_permanent then 'suspended' else 'suspended' end,v_strike,v_level,p_reason,v_until,v_permanent,now())
    on conflict(user_key) do update set status='suspended',strike_count=v_strike,sanction_level=v_level,reason=p_reason,suspended_until=v_until,permanent=v_permanent,updated_at=now();
  insert into public.sb1_owner_alerts(alert_type,user_key,strike,reason,level,evidence_image)
    values('safety_violation',p_user_key,v_strike,p_reason,v_level,p_evidence_image);
  return jsonb_build_object('sanction_id',v_sanction_id,'user_key',p_user_key,'strike',v_strike,'level',v_level,'until_at',v_until,'permanent',v_permanent);
end $$;

create or replace function public.sb1_submit_safety_appeal(
  p_user_key text,
  p_complaint text,
  p_evidence_image text default null
) returns uuid
language plpgsql security definer set search_path=public
as $$
declare v_id uuid;
begin
  insert into public.sb1_safety_appeals(user_key,sanction_id,complaint,evidence_image)
  select p_user_key,id,p_complaint,p_evidence_image from public.sb1_safety_sanctions
  where user_key=p_user_key order by created_at desc limit 1
  returning id into v_id;
  if v_id is null then
    insert into public.sb1_safety_appeals(user_key,complaint,evidence_image) values(p_user_key,p_complaint,p_evidence_image) returning id into v_id;
  end if;
  insert into public.sb1_owner_alerts(alert_type,user_key,reason,level)
    values('safety_appeal',p_user_key,p_complaint,'appeal_pending');
  return v_id;
end $$;

create or replace function public.sb1_review_safety_appeal(
  p_appeal_id uuid,
  p_decision text,
  p_note text default null
) returns jsonb
language plpgsql security definer set search_path=public
as $$
declare r text; v_user text;
begin
  r:=public.sb1_admin_role();
  if r not in ('owner','moderator') then raise exception 'ADMIN_FORBIDDEN'; end if;
  if p_decision not in ('accept','reject','restore','suspend','delete') then raise exception 'BAD_DECISION'; end if;
  select user_key into v_user from public.sb1_safety_appeals where id=p_appeal_id;
  update public.sb1_safety_appeals set status=case when p_decision in ('accept','restore') then 'accepted' else 'rejected' end,
    reviewer_user_id=auth.uid(),reviewer_role=r,reviewer_note=p_note,reviewed_at=now() where id=p_appeal_id;
  if p_decision in ('accept','restore') then
    update public.sb1_account_moderation set status='active',permanent=false,suspended_until=null,sanction_level='restored',updated_at=now() where user_key=v_user;
  elsif p_decision='delete' then
    update public.sb1_account_moderation set status='deleted',permanent=true,sanction_level='deleted',updated_at=now() where user_key=v_user;
  else
    update public.sb1_account_moderation set status='suspended',sanction_level='admin_suspension',reason=coalesce(p_note,reason),updated_at=now() where user_key=v_user;
  end if;
  insert into public.sb1_owner_alerts(alert_type,user_key,reason,level)
    values('safety_appeal_reviewed',v_user,coalesce(p_note,''),p_decision);
  return jsonb_build_object('ok',true,'user_key',v_user,'decision',p_decision);
end $$;
