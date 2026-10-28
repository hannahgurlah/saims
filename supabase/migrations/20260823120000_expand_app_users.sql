alter table public.app_users
  add column if not exists last_name text not null default '',
  add column if not exists first_name text not null default '',
  add column if not exists middle_name text not null default '',
  add column if not exists status text not null default 'active';

alter table public.app_users drop constraint if exists app_users_role_check;
alter table public.app_users add constraint app_users_role_check check (role in ('admin', 'manager', 'staff'));
alter table public.app_users drop constraint if exists app_users_status_check;
alter table public.app_users add constraint app_users_status_check check (status in ('active', 'inactive'));
