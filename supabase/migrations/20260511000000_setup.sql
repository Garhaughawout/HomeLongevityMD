-- ─────────────────────────────────────────────────────────────────────────────
-- 000: shared setup
--   • Shared trigger function that keeps updated_at current on every UPDATE.
--     All tables that carry an updated_at column reference this function.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
