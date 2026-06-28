-- ─────────────────────────────────────────────────────────────────────────────
-- 008: new_assessment_schema
--   Adds JSONB columns for the 3-tier adaptive assessment model to
--   client_intake, and corresponding score columns to risk_assessments.
--
--   Tier 1 (all clients): clinical_context, home_fast, tug_test,
--                         frail_scale, mmse, ot_clinical_judgment
--   Tier 2 (conditional): berg_balance, tier2_cognitive,
--                         tier2_frailty, tier2_environmental
--
--   Old columns (home_safety, mobility, adls_iadls, cognition, fall_risk,
--   caregiver_support, physician_review, adl_iadl) are kept for backward
--   compatibility — existing rows remain readable and the application
--   can fall back to them during the transition period.
--
--   Old domain score columns on risk_assessments are likewise retained.
--
--   Safe to run on existing databases: all statements use
--   "add column if not exists" and no columns are dropped.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── client_intake: new JSONB columns ─────────────────────────────────────────

alter table public.client_intake
  add column if not exists clinical_context      jsonb,
  add column if not exists home_fast             jsonb,
  add column if not exists tug_test              jsonb,
  add column if not exists frail_scale           jsonb,
  add column if not exists mmse                  jsonb,
  add column if not exists ot_clinical_judgment  jsonb,
  add column if not exists berg_balance          jsonb,
  add column if not exists tier2_cognitive      jsonb,
  add column if not exists tier2_frailty        jsonb,
  add column if not exists tier2_environmental  jsonb;

-- ── client_intake: column comments ──────────────────────────────────────────

comment on column public.client_intake.clinical_context is
  'tier 1 — clinical context: diagnoses, medications, hospitalizations, and baseline function.';
comment on column public.client_intake.home_fast is
  'tier 1 — home fast: fall risk screening tool covering home environment hazards.';
comment on column public.client_intake.tug_test is
  'tier 1 — timed up and go test results (seconds, assistive device, observations).';
comment on column public.client_intake.frail_scale is
  'tier 1 — frailty phenotype scale (FRAIL): fatigue, resistance, ambulation, illnesses, loss of weight.';
comment on column public.client_intake.mmse is
  'tier 1 — mini-mental state examination: orientation, recall, attention, language, visuospatial.';
comment on column public.client_intake.ot_clinical_judgment is
  'tier 1 — OT clinical judgment: overall clinical impression and concern flags.';
comment on column public.client_intake.berg_balance is
  'tier 2 — berg balance scale: 14-item balance assessment (conditional on tier 1 results).';
comment on column public.client_intake.tier2_cognitive is
  'tier 2 — extended cognitive testing (conditional on tier 1 MMSE concern).';
comment on column public.client_intake.tier2_frailty is
  'tier 2 — extended frailty assessment (conditional on tier 1 frail scale concern).';
comment on column public.client_intake.tier2_environmental is
  'tier 2 — extended environmental / home safety assessment (conditional on tier 1 home fast concern).';

-- ── client_intake: updated table comment ────────────────────────────────────

comment on table public.client_intake is
  'Structured intake data for the 3-tier adaptive assessment. '
  'Tier 1 sections (clinical_context, home_fast, tug_test, frail_scale, mmse, '
  'ot_clinical_judgment) are captured for all clients. '
  'Tier 2 sections (berg_balance, tier2_cognitive, tier2_frailty, tier2_environmental) '
  'are captured conditionally based on tier 1 results. '
  'Each section is stored as JSONB so sub-fields can evolve without migrations. '
  'Older columns (home_safety, mobility, adls_iadls, cognition, fall_risk, '
  'caregiver_support, physician_review) are retained for backward compatibility.';

-- ── risk_assessments: new score columns ─────────────────────────────────────

alter table public.risk_assessments
  add column if not exists home_fast_score            smallint check (home_fast_score            between 0 and 100),
  add column if not exists tug_test_score             smallint check (tug_test_score             between 0 and 100),
  add column if not exists frail_scale_score          smallint check (frail_scale_score          between 0 and 100),
  add column if not exists mmse_score                 smallint check (mmse_score                 between 0 and 100),
  add column if not exists ot_clinical_judgment_score smallint check (ot_clinical_judgment_score between 0 and 100);

-- ── risk_assessments: column comments ───────────────────────────────────────

comment on column public.risk_assessments.home_fast_score is
  '0-100 risk score from the home fast fall risk screening tool.';
comment on column public.risk_assessments.tug_test_score is
  '0-100 risk score derived from the timed up and go test.';
comment on column public.risk_assessments.frail_scale_score is
  '0-100 risk score from the FRAIL phenotype scale.';
comment on column public.risk_assessments.mmse_score is
  '0-100 risk score derived from the mini-mental state examination.';
comment on column public.risk_assessments.ot_clinical_judgment_score is
  '0-100 risk score from OT clinical judgment assessment.';
