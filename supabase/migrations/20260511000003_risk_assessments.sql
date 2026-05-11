-- ─────────────────────────────────────────────────────────────────────────────
-- 003: risk_assessments
--   Persisted scoring output computed from a submitted client_intake.
--   Domain scores are stored as smallint columns for easy aggregation;
--   the full weighted breakdown goes in score_details JSONB.
--   scoring_version allows the engine to be versioned without losing history.
--
--   Risk categories (aggregate_score thresholds defined in application layer):
--     low | moderate | high | very_high | unsafe_independent
-- ─────────────────────────────────────────────────────────────────────────────

create table public.risk_assessments (
  id                      uuid        primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  -- lineage
  client_id               uuid        not null references public.clients (id)       on delete cascade,
  intake_id               uuid                 references public.client_intake (id) on delete set null,

  -- engine version for reproducibility
  scoring_version         text        not null default '1.0',

  -- domain scores (0-100 scale, application-enforced)
  home_safety_score       smallint    not null check (home_safety_score       between 0 and 100),
  mobility_score          smallint    not null check (mobility_score          between 0 and 100),
  adls_iadls_score        smallint    not null check (adls_iadls_score        between 0 and 100),
  cognition_score         smallint    not null check (cognition_score         between 0 and 100),
  fall_risk_score         smallint    not null check (fall_risk_score         between 0 and 100),
  caregiver_support_score smallint    not null check (caregiver_support_score between 0 and 100),

  -- aggregate
  aggregate_score         smallint    not null check (aggregate_score         between 0 and 100),
  risk_category           text        not null
                            check (risk_category in (
                              'low', 'moderate', 'high', 'very_high', 'unsafe_independent'
                            )),

  -- full scoring breakdown for auditability / UI display
  score_details           jsonb,

  -- audit
  created_by              uuid references auth.users (id) on delete set null
);

-- updated_at trigger
create trigger risk_assessments_set_updated_at
  before update on public.risk_assessments
  for each row execute function public.set_updated_at();

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index risk_assessments_client_id_idx    on public.risk_assessments (client_id);
create index risk_assessments_intake_id_idx    on public.risk_assessments (intake_id);
create index risk_assessments_risk_category_idx on public.risk_assessments (risk_category);

-- Dashboard: high-risk alert queries
create index risk_assessments_high_risk_idx
  on public.risk_assessments (client_id, created_at desc)
  where risk_category in ('high', 'very_high', 'unsafe_independent');

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table public.risk_assessments enable row level security;

create policy "staff can select risk_assessments"
  on public.risk_assessments for select
  to authenticated
  using (true);

create policy "staff can insert risk_assessments"
  on public.risk_assessments for insert
  to authenticated
  with check (true);

create policy "staff can update risk_assessments"
  on public.risk_assessments for update
  to authenticated
  using (true)
  with check (true);

create policy "staff can delete risk_assessments"
  on public.risk_assessments for delete
  to authenticated
  using (true);
