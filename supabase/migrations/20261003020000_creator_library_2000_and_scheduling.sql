create table if not exists public.sb1_scheduled_posts (id uuid primary key default gen_random_uuid(),page_id text not null,post_type text not null,body text not null default '',media_url text,metadata jsonb not null default '{}'::jsonb,scheduled_at timestamptz not null,status text not null default 'scheduled',published_at timestamptz,created_at timestamptz not null default now());
create index if not exists sb1_scheduled_posts_due_idx on public.sb1_scheduled_posts(status,scheduled_at);
alter table public.sb1_scheduled_posts enable row level security;
drop policy if exists "scheduled posts owner read" on public.sb1_scheduled_posts;
create policy "scheduled posts owner read" on public.sb1_scheduled_posts for select to authenticated using (true);
drop policy if exists "scheduled posts owner insert" on public.sb1_scheduled_posts;
create policy "scheduled posts owner insert" on public.sb1_scheduled_posts for insert to authenticated with check (true);

alter table public.sb1_creator_library add column if not exists search_text text generated always as (lower(name || ' ' || coalesce(source,'') || ' ' || array_to_string(tags,' '))) stored;
create index if not exists sb1_creator_library_search_text_idx on public.sb1_creator_library using gin(to_tsvector('simple',search_text));

insert into public.sb1_creator_library(page_id,kind,name,url,source,thumbnail_url,tags)
select 'sb1','image','صورة جاهزة '||g,'https://picsum.photos/seed/sb1-image-'||g||'/1200/1200','Picsum','https://picsum.photos/seed/sb1-image-'||g||'/300/300',array['صورة','جاهزة',g::text] from generate_series(1,2000) g
on conflict do nothing;
insert into public.sb1_creator_library(page_id,kind,name,url,source,thumbnail_url,tags)
select 'sb1','sticker','استيكر جاهز '||g,'https://api.dicebear.com/9.x/fun-emoji/svg?seed=sb1-sticker-'||g,'DiceBear','https://api.dicebear.com/9.x/fun-emoji/svg?seed=sb1-sticker-'||g,array['استيكر','جاهز',g::text] from generate_series(1,2000) g
on conflict do nothing;
insert into public.sb1_creator_library(page_id,kind,name,url,source,thumbnail_url,tags)
select 'sb1','gif','GIF جاهز '||g,'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif?sb1='||g,'GIPHY','https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/200w.gif?sb1='||g,array['GIF','جاهز',g::text] from generate_series(1,2000) g
on conflict do nothing;
insert into public.sb1_creator_library(page_id,kind,name,url,source,thumbnail_url,tags)
select 'sb1','music','مقطع صوتي جاهز '||g,'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-'||((g-1)%16+1)||'.mp3','SoundHelix',null,array['موسيقى','صوت','جاهز',g::text] from generate_series(1,2000) g
on conflict do nothing;