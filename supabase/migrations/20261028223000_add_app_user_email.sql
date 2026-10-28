create table if not exists public.app_users (
  id text primary key,
  username text not null unique,
  password_hash text not null,
  role text not null default 'staff' check (role in ('admin', 'manager', 'staff')),
  school_name text not null default '',
  last_name text not null default '',
  first_name text not null default '',
  middle_name text not null default '',
  email text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_users add column if not exists last_name text not null default '';
alter table public.app_users add column if not exists first_name text not null default '';
alter table public.app_users add column if not exists middle_name text not null default '';
alter table public.app_users add column if not exists email text not null default '';
alter table public.app_users add column if not exists status text not null default 'active';

create unique index if not exists idx_app_users_email_unique
  on public.app_users (lower(email))
  where email <> '';

alter table public.app_users enable row level security;
