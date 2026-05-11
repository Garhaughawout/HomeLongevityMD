-- ─────────────────────────────────────────────────────────────────────────────
-- 002: client_intake
--   Structured intake data captured via the multi-step wizard (Phase 5-6).
--   Each assessment domain is stored as JSONB so the schema can evolve
--   without requiring a migration for every sub-field change.
--   Multiple intake versions can exist per client; the highest version
--   that is 'submitted' is the canonical one used for scoring.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.client_intake (
  id                uuid        primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- ownership
  client_id         uuid        not null references public.clients (id) on delete cascade,

  -- versioning
  version           int         not null default 1,

  -- workflow
  status            text        not null default 'draft'
                      check (status in ('draft', 'submitted')),

  -- assessment domains (JSONB — schema defined in application layer)
  home_safety       jsonb,   -- lighting, hazards, bathrooms, emergency egress
  mobility          jsonb,   -- ambulation aids, stairs, fall history
  adls_iadls        jsonb,   -- bathing, dressing, meals, medication, finances
  cognition         jsonb,   -- orientation, memory, communication
  fall_risk         jsonb,   -- fear of falling, near-miss events, balance tests
  caregiver_support jsonb,   -- informal caregiver presence, hours, burnout

  -- submission
  submitted_at      timestamptz,
  submitted_by      uuid references auth.users (id) on delete set null,

  -- audit
  created_by        uuid references auth.users (id) on delete set null
);

-- updated_at trigger
create trigger client_intake_set_updated_at
  before update on public.client_intake
  for each row execute function public.set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index client_intake_client_id_idx on public.client_intake (client_id);
create index client_intake_status_idx    on public.client_intake (status);

-- Fast lookup: latest submitted intake per client
create index client_intake_submitted_idx
  on public.client_intake (client_id, version desc)
  where status = 'submitted';

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.client_intake enable row level security;

create policy "staff can select client_intake"
  on public.client_intake for select
  to authenticated
  using (true);

create policy "staff can insert client_intake"
  on public.client_intake for insert
  to authenticated
  with check (true);

create policy "staff can update client_intake"
  on public.client_intake for update
  to authenticated
  using (true)
  with check (true);

create policy "staff can delete client_intake"
  on public.client_intake for delete
  to authenticated
  using (true);
