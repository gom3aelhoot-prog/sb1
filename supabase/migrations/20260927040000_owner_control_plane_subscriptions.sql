-- SB1 owner control plane, command audit, subscriptions, doctor recommendation ads
create extension if not exists pgcrypto;

create table if not exists public.admin_command_catalog (
  id uuid primary key default gen_random_uuid(),
  command_key text unique not null,
  names jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  required_role text not null default 'owner',
  action_key text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_command_audit (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid,
  actor_email text,
  actor_role text,
  command_text text not null,
  command_key text,
  action_key text,
  target_type text,
  target_id text,
  payload jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  status text not null default 'success',
  created_at timestamptz not null default now()
);

create table if not exists public.admin_role_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text,
  role text not null default 'moderator',
  permissions jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  granted_by uuid,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name jsonb not null default '{}'::jsonb,
  duration_months int not null,
  price_usd numeric(12,2) not null default 0,
  daily_questions int not null default 0,
  weekly_questions int not null default 0,
  paid_events int not null default 0,
  paid_books int not null default 0,
  courses int not null default 0,
  video_minutes int not null default 0,
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plan_id uuid not null references public.subscription_plans(id),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active',
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.doctor_recommendation_products (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  pricing_model text not null default 'duration',
  price_usd numeric(12,2) not null default 0,
  included_recommendations int not null default 0,
  duration_days int not null default 0,
  included_selected_clients int not null default 0,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.doctor_recommendation_campaigns (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null,
  product_id uuid not null references public.doctor_recommendation_products(id),
  status text not null default 'active',
  target_languages text[] not null default '{}',
  target_countries text[] not null default '{}',
  budget_usd numeric(12,2) not null default 0,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.doctor_recommendation_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.doctor_recommendation_campaigns(id),
  customer_user_id uuid,
  selected_doctor boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.admin_command_catalog enable row level security;
alter table public.admin_command_audit enable row level security;
alter table public.admin_role_grants enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.doctor_recommendation_products enable row level security;
alter table public.doctor_recommendation_campaigns enable row level security;
alter table public.doctor_recommendation_events enable row level security;

drop policy if exists "public read active subscription plans" on public.subscription_plans;
create policy "public read active subscription plans" on public.subscription_plans for select using (is_active=true);
drop policy if exists "public read active recommendation products" on public.doctor_recommendation_products;
create policy "public read active recommendation products" on public.doctor_recommendation_products for select using (is_active=true);

create or replace function public.sb1_admin_role()
returns text language sql stable security definer set search_path=public
as $$ select coalesce((select role from public.admin_role_grants where user_id=auth.uid() and is_active=true limit 1),'') $$;

create or replace function public.sb1_can_admin(required text)
returns boolean language sql stable security definer set search_path=public
as $$ select case when required='moderator' then public.sb1_admin_role() in ('moderator','owner') when required='owner' then public.sb1_admin_role()='owner' else false end $$;

create or replace function public.execute_admin_command(
  p_command_text text,
  p_command_key text,
  p_action_key text,
  p_target_type text default null,
  p_target_id text default null,
  p_payload jsonb default '{}'::jsonb
) returns jsonb
language plpgsql security definer set search_path=public
as $$
declare r text:=public.sb1_admin_role(); result jsonb:='{}'::jsonb;
begin
  if r not in ('owner','moderator') then
    insert into public.admin_command_audit(actor_user_id,actor_email,actor_role,command_text,command_key,action_key,target_type,target_id,payload,status)
    values(auth.uid(),auth.email(),r,p_command_text,p_command_key,p_action_key,p_target_type,p_target_id,p_payload,'denied');
    raise exception 'ADMIN_FORBIDDEN';
  end if;
  if p_action_key in ('grant_moderator','revoke_moderator','delete_user','change_payment_rules','change_site_settings','hide_section','maintenance_mode','create_store_product','update_store_product','delete_content','delete_institution','issue_warning','issue_fine','issue_reward','link_records','change_prices') and r<>'owner' then
    raise exception 'OWNER_ONLY';
  end if;
  case p_action_key
    when 'hide_section' then update public.site_settings set updated_at=now() where id=1; result:=jsonb_build_object('ok',true,'action','hide_section');
    when 'maintenance_mode' then update public.site_settings set updated_at=now() where id=1; result:=jsonb_build_object('ok',true,'action','maintenance_mode');
    when 'delete_content' then execute format('delete from %I where id=$1',p_target_type) using p_target_id; result:=jsonb_build_object('ok',true,'deleted',p_target_id);
    when 'delete_institution' then execute format('delete from %I where id=$1',p_target_type) using p_target_id; result:=jsonb_build_object('ok',true,'deleted',p_target_id);
    when 'change_prices' then result:=jsonb_build_object('ok',true,'payload',p_payload);
    when 'create_store_product' then result:=jsonb_build_object('ok',true,'payload',p_payload);
    when 'update_store_product' then result:=jsonb_build_object('ok',true,'payload',p_payload);
    when 'issue_warning' then result:=jsonb_build_object('ok',true,'warning',p_payload);
    when 'issue_fine' then result:=jsonb_build_object('ok',true,'fine',p_payload);
    when 'issue_reward' then result:=jsonb_build_object('ok',true,'reward',p_payload);
    when 'link_records' then result:=jsonb_build_object('ok',true,'link',p_payload);
    else result:=jsonb_build_object('ok',true,'accepted',true,'action',p_action_key);
  end case;
  insert into public.admin_command_audit(actor_user_id,actor_email,actor_role,command_text,command_key,action_key,target_type,target_id,payload,result,status)
  values(auth.uid(),auth.email(),r,p_command_text,p_command_key,p_action_key,p_target_type,p_target_id,p_payload,result,'success');
  return result;
end $$;

insert into public.subscription_plans(code,name,duration_months,price_usd,daily_questions,weekly_questions,paid_events,paid_books,courses,video_minutes,features,sort_order)
values
('monthly','{"ar":"شهري","en":"Monthly","ru":"Ежемесячно"}',1,9.99,3,15,1,1,1,60,'["أسئلة يومية","كتاب مدفوع","ندوة مدفوعة","دورة"]',1),
('quarterly','{"ar":"3 أشهر","en":"3 Months","ru":"3 месяца"}',3,24.99,5,30,3,3,2,180,'["أسئلة أكثر","كتب","ندوات","دورات"]',2),
('half_year','{"ar":"6 أشهر","en":"6 Months","ru":"6 месяцев"}',6,44.99,8,50,6,6,4,360,'["مزايا موسعة"]',3),
('yearly','{"ar":"سنوي","en":"Yearly","ru":"Ежегодно"}',12,79.99,12,80,12,12,8,720,'["كل المزايا الأساسية"]',4)
on conflict(code) do update set price_usd=excluded.price_usd,duration_months=excluded.duration_months;

insert into public.doctor_recommendation_products(code,name,description,pricing_model,price_usd,included_recommendations,duration_days,included_selected_clients,sort_order)
values
('rec_100','{"ar":"اقتراح الطبيب — 100 ظهور","en":"Doctor recommendation — 100 impressions"}','{"ar":"ظهور الطبيب ضمن اقتراحات العملاء","en":"Doctor recommendation placement"}','recommendations',19,100,0,0,1),
('rec_30d','{"ar":"اقتراح الطبيب — 30 يوماً","en":"Doctor recommendation — 30 days"}','{"ar":"ظهور الطبيب في الاقتراحات لمدة شهر","en":"One month placement"}','duration',29,0,30,0,2),
('rec_50clients','{"ar":"اقتراح الطبيب — 50 عميلاً مختاراً","en":"Doctor recommendation — 50 selected clients"}','{"ar":"الدفع حسب العملاء الذين اختاروا الطبيب","en":"Pay per selected client"}','selected_clients',39,0,0,50,3)
on conflict(code) do update set price_usd=excluded.price_usd;

insert into public.admin_command_catalog(command_key,names,description,required_role,action_key) values
('hide_section','{"ar":["اخف القسم","اخفي القسم"],"en":["hide section"],"ru":["скрыть раздел"],"ka":["განყოფილების დამალვა"]}','{"ar":"إخفاء قسم مؤقتاً"}','owner','hide_section'),
('maintenance_mode','{"ar":["ارفع الموقع مؤقتا","صيانة"],"en":["maintenance mode"],"ru":["режим обслуживания"],"ka":["ტექნიკური რეჟიმი"]}','{"ar":"وضع الصيانة"}','owner','maintenance_mode'),
('delete_content','{"ar":["احذف المحتوى","احذف المقال"],"en":["delete content"],"ru":["удалить контент"],"ka":["კონტენტის წაშლა"]}','{"ar":"حذف محتوى محدد"}','owner','delete_content'),
('delete_institution','{"ar":["احذف المؤسسة"],"en":["delete institution"],"ru":["удалить учреждение"],"ka":["დაწესებულების წაშლა"]}','{"ar":"حذف مؤسسة"}','owner','delete_institution'),
('issue_warning','{"ar":["انذر المستخدم","تحذير"],"en":["warn user"],"ru":["предупредить"],"ka":["გაფრთხილება"]}','{"ar":"إصدار إنذار"}','moderator','issue_warning'),
('issue_fine','{"ar":["غرامة","فرض غرامة"],"en":["fine"],"ru":["штраф"],"ka":["ჯარიმა"]}','{"ar":"تسجيل غرامة"}','owner','issue_fine'),
('issue_reward','{"ar":["اعط مكافأة","مكافأة"],"en":["reward"],"ru":["награда"],"ka":["ჯილდო"]}','{"ar":"منح مكافأة"}','owner','issue_reward'),
('create_store_product','{"ar":["أنشئ منتج","منتج جديد"],"en":["create store product"],"ru":["создай товар"],"ka":["შექმენი პროდუქტი"]}','{"ar":"إنشاء منتج في المتجر"}','owner','create_store_product'),
('change_prices','{"ar":["غير السعر","عدل السعر"],"en":["change price"],"ru":["изменить цену"],"ka":["ფასის შეცვლა"]}','{"ar":"تغيير الأسعار"}','owner','change_prices'),
('link_records','{"ar":["اربط هذا بهذا"],"en":["link records"],"ru":["связать"],"ka":["დაკავშირება"]}','{"ar":"ربط سجلات"}','owner','link_records'),
('grant_moderator','{"ar":["اعط صلاحية مشرف"],"en":["grant moderator"],"ru":["назначить модератора"],"ka":["მოდერატორის დანიშვნა"]}','{"ar":"منح صلاحية مشرف"}','owner','grant_moderator'),
('revoke_moderator','{"ar":["الغ صلاحية المشرف"],"en":["revoke moderator"],"ru":["отозвать модератора"],"ka":["მოდერატორის გაუქმება"]}','{"ar":"إلغاء صلاحية مشرف"}','owner','revoke_moderator')
on conflict(command_key) do nothing;

alter table public.admin_command_audit force row level security;
drop policy if exists "owner reads admin audit" on public.admin_command_audit;
create policy "owner reads admin audit" on public.admin_command_audit for select using (public.sb1_can_admin('owner'));
