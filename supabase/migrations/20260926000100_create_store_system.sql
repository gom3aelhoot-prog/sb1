create table if not exists public.store_products (
 id text primary key,
 name text not null,
 description text default '',
 image_url text default '',
 price numeric(12,2) not null default 0,
 currency text not null default 'USD',
 product_type text not null default 'other',
 audience text not null default 'all',
 language text not null default 'all',
 active boolean not null default true,
 stock integer,
 sort_order integer not null default 100,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.store_orders (
 id text primary key,
 reference_id text,
 items jsonb not null default '[]'::jsonb,
 amount numeric(12,2) not null default 0,
 currency text not null default 'USD',
 status text not null default 'pending',
 role text default 'client',
 created_at timestamptz not null default now(),
 paid_at timestamptz,
 updated_at timestamptz
);
alter table public.store_products enable row level security;
alter table public.store_orders enable row level security;
do $$ begin
 if not exists (select 1 from pg_policies where tablename='store_products' and policyname='store_products_public_read') then
  create policy store_products_public_read on public.store_products for select using (active=true);
 end if;
 if not exists (select 1 from pg_policies where tablename='store_orders' and policyname='store_orders_insert') then
  create policy store_orders_insert on public.store_orders for insert with check (true);
 end if;
end $$;
