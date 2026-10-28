begin;

alter table public.app_users
  add column if not exists school_names text[] not null default array[]::text[];

update public.app_users
set school_names = array[school_name]
where role = 'staff'
  and school_name <> ''
  and cardinality(school_names) = 0;

alter table public.app_users
  drop constraint if exists app_users_school_names_limit;

alter table public.app_users
  add constraint app_users_school_names_limit
  check (cardinality(school_names) <= 3);

commit;
