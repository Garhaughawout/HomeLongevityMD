-- ─────────────────────────────────────────────────────────────────────────────
-- Align the database schema with what the application code reads and writes.
--
-- Several columns and tables were added to types/database.ts (and, for the
-- quote outcome/adjustment tables, created via the dashboard) without ever
-- flowing through migrations. This migration closes every gap found in the
-- 2026-07-01 schema audit:
--
--   1. quotes: suggestion-tracking columns written by createQuote /
--      updateQuote / regenerateQuote (quote creation was failing without them)
--   2. risk_assessments: adl_iadl_score written by persistAssessment
--      (intake submission was failing without it)
--   3. quote_outcomes / quote_adjustments: formalised as migrations so the
--      schema can be rebuilt from scratch; missing FKs added
--   4. quote_outcomes.quote_id: unique index required by the
--      upsert ... onConflict "quote_id" in recordQuoteOutcome
--   5. activity_log: event_type check widened to allow quote_deleted
--   6. RLS enabled with staff policies on the two quote ML tables
--
-- Everything is guarded (if not exists / do-blocks) so it is safe to run on
-- the live database where some of these objects already exist.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. quotes: suggestion tracking for ML training ──────────────────────────

alter table public.quotes
  add column if not exists suggested_base_fee   numeric,
  add column if not exists suggested_multiplier numeric,
  add column if not exists suggested_plan_fee   numeric,
  add column if not exists suggested_services   jsonb,
  add column if not exists human_adjusted_at    timestamptz;

comment on column public.quotes.suggested_base_fee is
  'Base fee suggested by the pricing engine at creation time (ML training).';
comment on column public.quotes.suggested_multiplier is
  'Risk multiplier suggested by the pricing engine at creation time (ML training).';
comment on column public.quotes.suggested_plan_fee is
  'Total plan fee suggested by the pricing engine at creation time (ML training).';
comment on column public.quotes.suggested_services is
  'Services list suggested by the pricing engine at creation time (ML training).';
comment on column public.quotes.human_adjusted_at is
  'Set when the human deviated from the engine suggestion (ML training).';

-- ── 2. risk_assessments: adl_iadl_score ──────────────────────────────────────

alter table public.risk_assessments
  add column if not exists adl_iadl_score smallint
    check (adl_iadl_score between 0 and 100);

comment on column public.risk_assessments.adl_iadl_score is
  '0-100 risk score from the ADLs & IADLs section. Replaces legacy adls_iadls_score.';

-- ── 3. quote_outcomes / quote_adjustments: formalise as migrations ───────────
-- These already exist on the live database (dashboard-created); the create
-- statements are for rebuilding from scratch. Constraints are added
-- separately below so the live tables get them too.

create table if not exists public.quote_outcomes (
  id                   uuid        primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  quote_id             uuid        not null,
  client_id            uuid        not null,
  outcome              text        not null
                         check (outcome in ('accepted', 'declined', 'expired', 'withdrawn')),
  outcome_at           timestamptz not null default now(),
  decline_reason       text
                         check (decline_reason in (
                           'price_too_high', 'price_too_low_suspicion', 'chose_competitor',
                           'different_services_needed', 'insurance_covers_it', 'family_decision',
                           'timing_not_right', 'client_unresponsive', 'other')),
  competitor_name      text,
  competitor_price     numeric,
  client_feedback      text,
  adjusted_final_price numeric,
  recorded_by          uuid        references auth.users (id) on delete set null
);

create table if not exists public.quote_adjustments (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  quote_id      uuid        not null,
  field_changed text        not null
                  check (field_changed in (
                    'base_plan_fee', 'risk_multiplier', 'plan_fee',
                    'services_included', 'valid_until')),
  old_value     jsonb,
  new_value     jsonb,
  reason_code   text
                  check (reason_code in (
                    'client_budget_constraint', 'competitive_adjustment',
                    'service_scope_change', 'family_negotiation',
                    'clinical_judgment_override', 'error_correction', 'other')),
  reason_note   text,
  adjusted_by   uuid        references auth.users (id) on delete set null
);

-- ── 4. unique index required by recordQuoteOutcome's upsert ─────────────────

create unique index if not exists quote_outcomes_quote_id_key
  on public.quote_outcomes (quote_id);

-- ── 5. missing foreign keys ──────────────────────────────────────────────────
-- on delete cascade so deleteQuote keeps working once the FKs exist.

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'quote_outcomes_quote_id_fkey') then
    alter table public.quote_outcomes
      add constraint quote_outcomes_quote_id_fkey
      foreign key (quote_id) references public.quotes (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'quote_outcomes_client_id_fkey') then
    alter table public.quote_outcomes
      add constraint quote_outcomes_client_id_fkey
      foreign key (client_id) references public.clients (id) on delete cascade;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'quote_adjustments_quote_id_fkey') then
    alter table public.quote_adjustments
      add constraint quote_adjustments_quote_id_fkey
      foreign key (quote_id) references public.quotes (id) on delete cascade;
  end if;
end
$$;

-- ── 6. activity_log: allow quote_deleted ─────────────────────────────────────
-- Drop whatever check currently constrains event_type (name may vary between
-- the migration-built and live schemas), then re-add with the full list.

do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.activity_log'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%event_type%'
  loop
    execute format('alter table public.activity_log drop constraint %I', c.conname);
  end loop;
end
$$;

alter table public.activity_log
  add constraint activity_log_event_type_check
  check (event_type in (
    'client_created', 'client_updated', 'client_status_changed',
    'intake_saved', 'intake_submitted', 'assessment_persisted',
    'quote_generated', 'quote_sent', 'quote_accepted', 'quote_declined',
    'quote_deleted',
    'note_created', 'note_updated', 'note_deleted'));

-- ── 7. RLS for the quote ML tables (same staff policies as other tables) ────

alter table public.quote_outcomes    enable row level security;
alter table public.quote_adjustments enable row level security;

drop policy if exists "staff can select quote_outcomes" on public.quote_outcomes;
drop policy if exists "staff can insert quote_outcomes" on public.quote_outcomes;
drop policy if exists "staff can update quote_outcomes" on public.quote_outcomes;
drop policy if exists "staff can delete quote_outcomes" on public.quote_outcomes;

create policy "staff can select quote_outcomes" on public.quote_outcomes
  for select to authenticated using (auth.uid() is not null);
create policy "staff can insert quote_outcomes" on public.quote_outcomes
  for insert to authenticated with check (auth.uid() is not null);
create policy "staff can update quote_outcomes" on public.quote_outcomes
  for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff can delete quote_outcomes" on public.quote_outcomes
  for delete to authenticated using (auth.uid() is not null);

drop policy if exists "staff can select quote_adjustments" on public.quote_adjustments;
drop policy if exists "staff can insert quote_adjustments" on public.quote_adjustments;
drop policy if exists "staff can update quote_adjustments" on public.quote_adjustments;
drop policy if exists "staff can delete quote_adjustments" on public.quote_adjustments;

create policy "staff can select quote_adjustments" on public.quote_adjustments
  for select to authenticated using (auth.uid() is not null);
create policy "staff can insert quote_adjustments" on public.quote_adjustments
  for insert to authenticated with check (auth.uid() is not null);
create policy "staff can update quote_adjustments" on public.quote_adjustments
  for update to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "staff can delete quote_adjustments" on public.quote_adjustments
  for delete to authenticated using (auth.uid() is not null);
