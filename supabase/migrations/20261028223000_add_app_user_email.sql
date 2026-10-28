alter table public.app_users
  add column if not exists email text not null default '';

create unique index if not exists idx_app_users_email_unique
  on public.app_users (lower(email))
  where email <> '';
