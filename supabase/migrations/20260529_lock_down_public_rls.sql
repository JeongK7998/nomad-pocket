-- Nomad Pocket
-- Emergency remediation for Supabase Security Advisor: rls_disabled_in_public.
--
-- This migration intentionally locks down direct anon/authenticated access to the
-- app tables by enabling RLS and removing the old MVP "public_all" policies.
--
-- Important:
-- - The current app uses the public anon Supabase client and a local/shared PIN
--   flow, not Supabase Auth. After applying this migration, client-side CRUD
--   against these tables will be denied until data access is moved behind
--   Supabase Auth policies or server-side API routes using a service role.
-- - Run this first if the production data exposure is the priority.
-- - Before/after check:
--     select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity
--     from pg_class c
--     join pg_namespace n on n.oid = c.relnamespace
--     where n.nspname = 'public'
--       and c.relkind in ('r', 'p')
--       and c.relname in (
--         'profiles', 'categories', 'subcategories', 'payment_methods',
--         'regions', 'tags', 'currencies', 'fixed_items',
--         'transactions', 'budgets'
--       )
--     order by c.relname;

begin;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'categories',
    'subcategories',
    'payment_methods',
    'regions',
    'tags',
    'currencies',
    'fixed_items',
    'transactions',
    'budgets'
  ]
  loop
    execute format('alter table if exists public.%I enable row level security', table_name);
    execute format('alter table if exists public.%I force row level security', table_name);
  end loop;
end
$$;

drop policy if exists "public_all" on public.profiles;
drop policy if exists "public_all" on public.categories;
drop policy if exists "public_all" on public.subcategories;
drop policy if exists "public_all" on public.payment_methods;
drop policy if exists "public_all" on public.regions;
drop policy if exists "public_all" on public.tags;
drop policy if exists "public_all" on public.currencies;
drop policy if exists "public_all" on public.fixed_items;
drop policy if exists "public_all" on public.transactions;
drop policy if exists "public_all" on public.budgets;

commit;
