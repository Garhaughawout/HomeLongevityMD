-- ─────────────────────────────────────────────────────────────────────────────
-- 001: clients
--   Core CRM entity.  One row per person being assessed for aging-in-place
--   services.  Status drives list filtering and KPI rollups.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.clients (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null    default now(),
  updated_at    timestamptz not null    default now(),

  -- identity
  full_name     text        not null,
  email         text,
  phone         text,
  date_of_birth date,

  -- address
  address_line1 text,
  address_line2 text,
  city          text,
  state         char(2),
  zip           text,

  -- workflow
  status        text        not null    default 'active'
                  check (status in ('active', 'inactive', 'archived')),

  -- audit
  created_by    uuid        references auth.users (id) on delete set null
);

-- updated_at trigger
create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index clients_status_idx     on public.clients (status);
create index clients_full_name_idx  on public.clients (lower(full_name));
create index clients_created_by_idx on public.clients (created_by);

-- ── RLS ───────────────────────────────────────────────────────────────────────
-- Single-tenant staff app: any authenticated user can do everything.
-- Tighten to role-based policies when multi-staff roles land.

alter table public.clients enable row level security;

create policy "staff can select clients"
  on public.clients for select
  to authenticated
  using (true);

create policy "staff can insert clients"
  on public.clients for insert
  to authenticated
  with check (true);

create policy "staff can update clients"
  on public.clients for update
  to authenticated
  using (true)
  with check (true);

create policy "staff can delete clients"
  on public.clients for delete
  to authenticated
  using (true);
