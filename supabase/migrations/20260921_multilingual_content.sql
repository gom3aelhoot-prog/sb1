-- Multilingual content storage for user-generated and catalog content.
-- Existing rows remain compatible: the app falls back to the original field.

alter table public.doctors
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.questions
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.articles
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.doctor_videos
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.doctor_audio
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.courses
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.specialty_chat_rooms
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.specialty_library_items
  add column if not exists translations jsonb not null default '{}'::jsonb;

comment on column public.doctors.translations is 'JSONB language map, e.g. {"ru":{"name":"...","bio":"..."}}';
comment on column public.questions.translations is 'JSONB language map, e.g. {"ru":{"title":"...","body":"..."}}';
comment on column public.articles.translations is 'JSONB language map, e.g. {"ru":{"title":"...","excerpt":"...","body":"..."}}';
comment on column public.doctor_videos.translations is 'JSONB language map, e.g. {"ru":{"title":"...","description":"..."}}';
comment on column public.doctor_audio.translations is 'JSONB language map, e.g. {"ru":{"title":"...","description":"..."}}';
comment on column public.courses.translations is 'JSONB language map, e.g. {"ru":{"title":"...","description":"..."}}';
comment on column public.specialty_chat_rooms.translations is 'JSONB language map, e.g. {"ru":{"name":"...","description":"..."}}';
comment on column public.specialty_library_items.translations is 'JSONB language map, e.g. {"ru":{"title":"...","description":"...","source":"..."}}';
