-- SB1 commerce wallet, cart, wishlist and rewards
create table if not exists public.sb1_wallets (
  id uuid primary key default gen_random_uuid(),
  account_key text not null unique,
  currency_code text not null default 'USD',
  balance numeric(14,2) not null default 0 check (balance >= 0),
  rewards_points integer not null default 0 check (rewards_points >= 0),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  account_key text not null,
  transaction_type text not null check (transaction_type in ('topup','purchase','refund','reward','withdrawal','adjustment')),
  amount numeric(14,2) not null,
  currency_code text not null default 'USD',
  reference_type text,
  reference_id text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_rewards_ledger (
  id uuid primary key default gen_random_uuid(),
  account_key text not null,
  points integer not null,
  reason text not null,
  reference_type text,
  reference_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.sb1_cart_items (
  id uuid primary key default gen_random_uuid(),
  account_key text not null,
  item_type text not null,
  item_id text not null,
  name text not null,
  image_url text,
  unit_price numeric(14,2) not null default 0,
  currency_code text not null default 'USD',
  quantity integer not null default 1 check (quantity > 0),
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(account_key,item_type,item_id)
);

create table if not exists public.sb1_wishlist_items (
  id uuid primary key default gen_random_uuid(),
  account_key text not null,
  item_type text not null,
  item_id text not null,
  name text,
  image_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(account_key,item_type,item_id)
);

create table if not exists public.sb1_commerce_orders (
  id uuid primary key default gen_random_uuid(),
  account_key text not null,
  category text not null,
  status text not null default 'pending' check (status in ('pending','paid','preparing','shipped','completed','cancelled','refunded')),
  payment_method text not null default 'wallet',
  payment_status text not null default 'pending',
  subtotal numeric(14,2) not null default 0,
  delivery_fee numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  currency_code text not null default 'USD',
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sb1_wallets enable row level security;
alter table public.sb1_wallet_transactions enable row level security;
alter table public.sb1_rewards_ledger enable row level security;
alter table public.sb1_cart_items enable row level security;
alter table public.sb1_wishlist_items enable row level security;
alter table public.sb1_commerce_orders enable row level security;

do $$ begin
  drop policy if exists "sb1 wallet public access" on public.sb1_wallets;
  create policy "sb1 wallet public access" on public.sb1_wallets for all to anon,authenticated using (true) with check (true);
  drop policy if exists "sb1 wallet transactions public access" on public.sb1_wallet_transactions;
  create policy "sb1 wallet transactions public access" on public.sb1_wallet_transactions for all to anon,authenticated using (true) with check (true);
  drop policy if exists "sb1 rewards public access" on public.sb1_rewards_ledger;
  create policy "sb1 rewards public access" on public.sb1_rewards_ledger for all to anon,authenticated using (true) with check (true);
  drop policy if exists "sb1 cart public access" on public.sb1_cart_items;
  create policy "sb1 cart public access" on public.sb1_cart_items for all to anon,authenticated using (true) with check (true);
  drop policy if exists "sb1 wishlist public access" on public.sb1_wishlist_items;
  create policy "sb1 wishlist public access" on public.sb1_wishlist_items for all to anon,authenticated using (true) with check (true);
  drop policy if exists "sb1 commerce orders public access" on public.sb1_commerce_orders;
  create policy "sb1 commerce orders public access" on public.sb1_commerce_orders for all to anon,authenticated using (true) with check (true);
end $$;

create index if not exists sb1_wallet_transactions_account_created_idx on public.sb1_wallet_transactions(account_key,created_at desc);
create index if not exists sb1_rewards_account_created_idx on public.sb1_rewards_ledger(account_key,created_at desc);
create index if not exists sb1_cart_account_idx on public.sb1_cart_items(account_key);
create index if not exists sb1_wishlist_account_idx on public.sb1_wishlist_items(account_key);
create index if not exists sb1_orders_account_created_idx on public.sb1_commerce_orders(account_key,created_at desc);

create or replace function public.sb1_wallet_spend(p_account_key text,p_amount numeric,p_currency text,p_reference_type text,p_reference_id text,p_description text)
returns jsonb
language plpgsql
security definer
as $$
declare w public.sb1_wallets;
begin
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  select * into w from public.sb1_wallets where account_key=p_account_key for update;
  if not found then raise exception 'wallet not found'; end if;
  if w.balance < p_amount then raise exception 'insufficient wallet balance'; end if;
  update public.sb1_wallets set balance=balance-p_amount,updated_at=now() where account_key=p_account_key;
  insert into public.sb1_wallet_transactions(account_key,transaction_type,amount,currency_code,reference_type,reference_id,description)
  values(p_account_key,'purchase',-p_amount,p_currency,p_reference_type,p_reference_id,p_description);
  return jsonb_build_object('ok',true,'balance',w.balance-p_amount);
end $$;

create or replace function public.sb1_wallet_reward(p_account_key text,p_points integer,p_reason text,p_reference_type text,p_reference_id text)
returns jsonb
language plpgsql
security definer
as $$
begin
  insert into public.sb1_wallets(account_key) values(p_account_key)
  on conflict(account_key) do nothing;
  update public.sb1_wallets set rewards_points=rewards_points+p_points,updated_at=now() where account_key=p_account_key;
  insert into public.sb1_rewards_ledger(account_key,points,reason,reference_type,reference_id)
  values(p_account_key,p_points,p_reason,p_reference_type,p_reference_id);
  return jsonb_build_object('ok',true);
end $$;


create or replace function public.sb1_wallet_credit(p_account_key text,p_amount numeric,p_currency text,p_reference_type text,p_reference_id text,p_description text)
returns jsonb
language plpgsql
security definer
as $$
declare b numeric;
begin
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  if exists(select 1 from public.sb1_wallet_transactions where reference_type=p_reference_type and reference_id=p_reference_id and transaction_type='topup') then
    select balance into b from public.sb1_wallets where account_key=p_account_key;
    return jsonb_build_object('ok',true,'duplicate',true,'balance',coalesce(b,0));
  end if;
  insert into public.sb1_wallets(account_key,currency_code,balance,rewards_points) values(p_account_key,p_currency,0,0)
  on conflict(account_key) do nothing;
  update public.sb1_wallets set balance=balance+p_amount,currency_code=p_currency,updated_at=now() where account_key=p_account_key returning balance into b;
  insert into public.sb1_wallet_transactions(account_key,transaction_type,amount,currency_code,reference_type,reference_id,description)
  values(p_account_key,'topup',p_amount,p_currency,p_reference_type,p_reference_id,p_description);
  return jsonb_build_object('ok',true,'balance',b,'amount',p_amount);
end $$;
