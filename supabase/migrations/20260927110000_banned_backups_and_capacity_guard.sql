-- SB1 protection layer: banned-content backups, owner restore overrides, capacity alerts
create extension if not exists pgcrypto;

create table if not exists public.sb1_banned_backups_registry (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_id text not null,
  source_table text,
  source_file_path text,
  backup_file_path text,
  backup_cover_path text,
  snapshot jsonb not null default '{}'::jsonb,
  screenshot_data_url text,
  block_reason text,
  blocked_by text not null default 'smart-moderation',
  blocked_at timestamptz not null default now(),
  restored_by uuid,
  restored_at timestamptz,
  restored boolean not null default false,
  owner_override boolean not null default false,
  automated_moderation_exempt boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists sb1_banned_backups_registry_target_idx on public.sb1_banned_backups_registry(content_type,content_id);
create index if not exists sb1_banned_backups_registry_blocked_idx on public.sb1_banned_backups_registry(blocked_at desc);

create table if not exists public.sb1_capacity_events (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'capacity-monitor',
  metric_type text not null,
  metric_value numeric,
  threshold numeric,
  unit text,
  severity text not null default 'warning' check (severity in ('info','warning','critical')),
  report jsonb not null default '{}'::jsonb,
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists sb1_capacity_events_created_idx on public.sb1_capacity_events(created_at desc);

insert into storage.buckets(id,name,public)
values('sb1-banned-backups','sb1-banned-backups',false)
on conflict(id) do nothing;

alter table public.sb1_banned_backups_registry enable row level security;
alter table public.sb1_capacity_events enable row level security;

drop policy if exists "owner reads banned backups" on public.sb1_banned_backups_registry;
create policy "owner reads banned backups" on public.sb1_banned_backups_registry for select to authenticated using (public.sb1_can_admin('owner'));
drop policy if exists "owner writes banned backups" on public.sb1_banned_backups_registry;
create policy "owner writes banned backups" on public.sb1_banned_backups_registry for insert to authenticated with check (public.sb1_can_admin('owner'));
drop policy if exists "owner updates banned backups" on public.sb1_banned_backups_registry;
create policy "owner updates banned backups" on public.sb1_banned_backups_registry for update to authenticated using (public.sb1_can_admin('owner')) with check (public.sb1_can_admin('owner'));

drop policy if exists "owner reads capacity events" on public.sb1_capacity_events;
create policy "owner reads capacity events" on public.sb1_capacity_events for select to authenticated using (public.sb1_can_admin('owner'));
drop policy if exists "owner writes capacity events" on public.sb1_capacity_events;
create policy "owner writes capacity events" on public.sb1_capacity_events for insert to authenticated with check (public.sb1_can_admin('owner'));
drop policy if exists "owner updates capacity events" on public.sb1_capacity_events;
create policy "owner updates capacity events" on public.sb1_capacity_events for update to authenticated using (public.sb1_can_admin('owner')) with check (public.sb1_can_admin('owner'));

drop policy if exists "owner reads banned backup objects" on storage.objects;
create policy "owner reads banned backup objects" on storage.objects for select to authenticated using (bucket_id='sb1-banned-backups' and public.sb1_can_admin('owner'));
drop policy if exists "owner uploads banned backup objects" on storage.objects;
create policy "owner uploads banned backup objects" on storage.objects for insert to authenticated with check (bucket_id='sb1-banned-backups' and public.sb1_can_admin('owner'));
drop policy if exists "owner updates banned backup objects" on storage.objects;
create policy "owner updates banned backup objects" on storage.objects for update to authenticated using (bucket_id='sb1-banned-backups' and public.sb1_can_admin('owner'));
drop policy if exists "owner deletes banned backup objects" on storage.objects;
create policy "owner deletes banned backup objects" on storage.objects for delete to authenticated using (bucket_id='sb1-banned-backups' and public.sb1_can_admin('owner'));

create or replace function public.sb1_create_banned_backup(
  p_content_type text,
  p_content_id text,
  p_source_table text default null,
  p_source_file_path text default null,
  p_snapshot jsonb default '{}'::jsonb,
  p_screenshot_data_url text default null,
  p_block_reason text default null,
  p_blocked_by text default 'smart-moderation'
) returns uuid
language plpgsql security definer set search_path=public
as $$
declare v_id uuid;
begin
  if public.sb1_admin_role() not in ('owner','moderator') then raise exception 'ADMIN_FORBIDDEN'; end if;
  if public.sb1_is_owner_restored_content(p_content_type,p_content_id) then
    select id into v_id from public.sb1_banned_backups_registry where content_type=p_content_type and content_id=p_content_id and restored=true order by restored_at desc limit 1;
    return v_id;
  end if;
  insert into public.sb1_banned_backups_registry(content_type,content_id,source_table,source_file_path,snapshot,screenshot_data_url,block_reason,blocked_by)
  values(p_content_type,p_content_id,p_source_table,p_source_file_path,coalesce(p_snapshot,'{}'),p_screenshot_data_url,p_block_reason,coalesce(p_blocked_by,'smart-moderation'))
  returning id into v_id;
  insert into public.owner_control_audit(action,target_type,target_id,actor_user_id,details)
  values('banned_content_backup',p_content_type,p_content_id,auth.uid(),jsonb_build_object('registry_id',v_id,'reason',p_block_reason,'source_file_path',p_source_file_path));
  return v_id;
end $$;

create or replace function public.sb1_restore_banned_content(p_registry_id uuid)
returns jsonb
language plpgsql security definer set search_path=public
as $$
declare r public.sb1_banned_backups_registry%rowtype;
begin
  if public.sb1_admin_role() <> 'owner' then raise exception 'OWNER_FORBIDDEN'; end if;
  select * into r from public.sb1_banned_backups_registry where id=p_registry_id for update;
  if not found then raise exception 'BACKUP_NOT_FOUND'; end if;
  update public.sb1_banned_backups_registry
    set restored=true,restored_by=auth.uid(),restored_at=now(),owner_override=true,automated_moderation_exempt=true
    where id=p_registry_id;
  insert into public.owner_control_audit(action,target_type,target_id,actor_user_id,details)
    values('owner_restore_banned_content',r.content_type,r.content_id,auth.uid(),jsonb_build_object('registry_id',p_registry_id,'automated_moderation_exempt',true));
  insert into public.owner_content_controls(content_type,content_id,publication_status,metadata,updated_by,updated_at)
    values(r.content_type,r.content_id,'published',jsonb_build_object('owner_override',true,'automated_moderation_exempt',true,'restored_registry_id',p_registry_id),auth.uid(),now())
    on conflict(content_type,content_id) do update set publication_status='published',metadata=owner_content_controls.metadata || jsonb_build_object('owner_override',true,'automated_moderation_exempt',true,'restored_registry_id',p_registry_id),updated_by=auth.uid(),updated_at=now();
  return jsonb_build_object('ok',true,'content_type',r.content_type,'content_id',r.content_id,'automated_moderation_exempt',true);
end $$;

create or replace function public.sb1_is_owner_restored_content(p_content_type text,p_content_id text)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.sb1_banned_backups_registry
    where content_type=p_content_type and content_id=p_content_id
      and restored=true and owner_override=true and automated_moderation_exempt=true
  );
$$;

create or replace function public.sb1_record_capacity_metric(
  p_metric_type text,
  p_metric_value numeric,
  p_threshold numeric,
  p_unit text default '%',
  p_report jsonb default '{}'::jsonb
) returns uuid
language plpgsql security definer set search_path=public
as $$
declare v_id uuid; v_severity text;
begin
  if public.sb1_admin_role() not in ('owner','moderator') then raise exception 'ADMIN_FORBIDDEN'; end if;
  v_severity:=case when p_metric_value >= p_threshold then 'critical' when p_metric_value >= p_threshold*0.85 then 'warning' else 'info' end;
  insert into public.sb1_capacity_events(metric_type,metric_value,threshold,unit,severity,report)
  values(p_metric_type,p_metric_value,p_threshold,p_unit,v_severity,coalesce(p_report,'{}'))
  returning id into v_id;
  if v_severity in ('warning','critical') then
    insert into public.sb1_owner_alerts(alert_type,user_key,reason,level)
    values('capacity_pressure','system','Storage/server pressure detected','capacity_'||v_severity);
  end if;
  return v_id;
end $$;

grant execute on function public.sb1_create_banned_backup(text,text,text,text,jsonb,text,text,text) to authenticated;
grant execute on function public.sb1_restore_banned_content(uuid) to authenticated;
grant execute on function public.sb1_is_owner_restored_content(text,text) to authenticated;
grant execute on function public.sb1_record_capacity_metric(text,numeric,numeric,text,jsonb) to authenticated;

-- Automatic registry entry whenever a content submission becomes rejected/deleted.
create or replace function public.sb1_capture_rejected_submission()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  if new.status in ('rejected','deleted') and coalesce(old.status,'pending') not in ('rejected','deleted') then
    insert into public.sb1_banned_backups_registry(content_type,content_id,source_table,source_file_path,backup_cover_path,snapshot,block_reason,blocked_by)
    values(new.content_type,new.id::text,'content_submissions',new.file_path,new.cover_path,
      jsonb_build_object('id',new.id,'specialist_id',new.specialist_id,'title',new.title,'description',new.description,'specialty_id',new.specialty_id,'language',new.language,'price',new.price,'platform_share',new.platform_share,'specialist_share',new.specialist_share,'source_url',new.source_url,'status',new.status,'rejection_reason',new.rejection_reason,'created_at',new.created_at,'reviewed_at',new.reviewed_at),
      coalesce(new.rejection_reason,'content moderation'), 'smart-moderation');
  end if;
  return new;
end $$;

drop trigger if exists trg_sb1_capture_rejected_submission on public.content_submissions;
create trigger trg_sb1_capture_rejected_submission
after update of status on public.content_submissions
for each row execute function public.sb1_capture_rejected_submission();

-- Add size metadata for capacity reporting where available.
alter table public.content_submissions add column if not exists file_size_bytes bigint;
alter table public.content_submissions add column if not exists media_hash text;
create index if not exists content_submissions_media_hash_idx on public.content_submissions(media_hash);


create or replace function public.sb1_capacity_snapshot(
  p_storage_limit_gb numeric default 100,
  p_db_limit_gb numeric default 20
) returns jsonb
language plpgsql security definer set search_path=public
as $$
declare
  v_storage_bytes numeric := 0;
  v_db_bytes numeric := pg_database_size(current_database());
  v_storage_pct numeric := 0;
  v_db_pct numeric := 0;
  v_duplicate_count bigint := 0;
  v_report jsonb;
begin
  if public.sb1_admin_role() not in ('owner','moderator') then raise exception 'ADMIN_FORBIDDEN'; end if;
  select coalesce(sum(coalesce((metadata->>'size')::numeric,0)),0) into v_storage_bytes from storage.objects;
  v_storage_pct := case when p_storage_limit_gb > 0 then (v_storage_bytes/(p_storage_limit_gb*1024*1024*1024))*100 else 0 end;
  v_db_pct := case when p_db_limit_gb > 0 then (v_db_bytes/(p_db_limit_gb*1024*1024*1024))*100 else 0 end;
  select count(*) into v_duplicate_count from (
    select media_hash from public.content_submissions where media_hash is not null and media_hash<>'' group by media_hash having count(*)>1
  ) d;
  v_report:=jsonb_build_object(
    'storage_bytes',v_storage_bytes,
    'storage_gb',round((v_storage_bytes/1024/1024/1024)::numeric,3),
    'storage_limit_gb',p_storage_limit_gb,
    'storage_percent',round(v_storage_pct,2),
    'database_bytes',v_db_bytes,
    'database_gb',round((v_db_bytes/1024/1024/1024)::numeric,3),
    'database_limit_gb',p_db_limit_gb,
    'database_percent',round(v_db_pct,2),
    'duplicate_media_groups',v_duplicate_count,
    'generated_at',now()
  );
  if greatest(v_storage_pct,v_db_pct) >= 85 then
    insert into public.sb1_capacity_events(metric_type,metric_value,threshold,unit,severity,report)
    values('storage_or_database_pressure',greatest(v_storage_pct,v_db_pct),85,'percent',
      case when greatest(v_storage_pct,v_db_pct)>=95 then 'critical' else 'warning' end,v_report);
  end if;
  return v_report;
end $$;
grant execute on function public.sb1_capacity_snapshot(numeric,numeric) to authenticated;


create or replace function public.sb1_owner_restore_submission_row()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  if new.status in ('rejected','deleted') and exists(
    select 1 from public.sb1_banned_backups_registry b
    where b.content_type=new.content_type and b.content_id=new.id::text
      and b.restored=true and b.owner_override=true and b.automated_moderation_exempt=true
  ) then
    new.status:='approved';
    new.rejection_reason:=null;
    new.reviewed_at:=now();
  end if;
  return new;
end $$;

drop trigger if exists trg_sb1_owner_restore_submission_row on public.content_submissions;
create trigger trg_sb1_owner_restore_submission_row
before update of status on public.content_submissions
for each row execute function public.sb1_owner_restore_submission_row();
