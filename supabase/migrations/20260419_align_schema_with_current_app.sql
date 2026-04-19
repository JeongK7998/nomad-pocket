-- Nomad Pocket
-- Align an existing Supabase project with the current app code.
-- Safe to run on a database that was created from the older schema.sql.

create extension if not exists "pgcrypto";

-- 1) profiles
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  pin_hash    text,
  color       text,
  created_at  timestamptz not null default now()
);

-- 2) shared/master tables: add user ownership hooks used by the app
alter table if exists public.categories
  add column if not exists user_id uuid;

alter table if exists public.subcategories
  add column if not exists user_id uuid;

alter table if exists public.payment_methods
  add column if not exists user_id uuid;

alter table if exists public.regions
  add column if not exists is_active boolean default true,
  add column if not exists user_id uuid;

update public.regions
set is_active = true
where is_active is null;

alter table if exists public.regions
  alter column is_active set default true,
  alter column is_active set not null;

alter table if exists public.tags
  add column if not exists is_active boolean default true,
  add column if not exists user_id uuid;

update public.tags
set is_active = true
where is_active is null;

alter table if exists public.tags
  alter column is_active set default true,
  alter column is_active set not null;

-- 3) data tables
alter table if exists public.fixed_items
  add column if not exists user_id uuid;

alter table if exists public.transactions
  add column if not exists user_id uuid;

alter table if exists public.budgets
  add column if not exists start_date date,
  add column if not exists is_system boolean default false,
  add column if not exists user_id uuid;

update public.budgets
set is_system = false
where is_system is null;

alter table if exists public.budgets
  alter column is_system set default false,
  alter column is_system set not null;

-- 4) indexes used by the current UI and queries
create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists budgets_user_id_idx on public.budgets (user_id);

-- 5) RLS and broad MVP policies
alter table if exists public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'public_all'
  ) then
    create policy "public_all"
      on public.profiles
      for all
      using (true)
      with check (true);
  end if;
end
$$;
