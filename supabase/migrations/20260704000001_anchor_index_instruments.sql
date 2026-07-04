-- ─────────────────────────────────────────────────────────────────────────────
-- Anchor Index v2 instrument swap (July 2026).
--
-- Per the "Anchor Index Scoring Methodology v2" document, the two
-- commercially licensed screening instruments are retired:
--   MMSE      → SLUMS  (MMSE is exclusively licensed to PAR, per-use royalty)
--   HOME FAST → STEADI (HOME FAST is commercially licensed; CDC STEADI is
--                       public domain)
--
-- The old mmse / home_fast JSONB columns and mmse_score / home_fast_score
-- columns are RETAINED so historical rows stay readable, but the application
-- no longer reads or writes them.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.client_intake
  add column if not exists slums  jsonb,
  add column if not exists steadi jsonb;

comment on column public.client_intake.slums is
  'tier 1 — SLUMS (Saint Louis University Mental Status) cognitive screen. Replaced MMSE for licensing reasons.';
comment on column public.client_intake.steadi is
  'tier 1 — CDC STEADI home fall-hazard checklist (public domain). Replaced HOME FAST for licensing reasons.';

alter table public.risk_assessments
  add column if not exists slums_score  smallint check (slums_score  between 0 and 100),
  add column if not exists steadi_score smallint check (steadi_score between 0 and 100);

comment on column public.risk_assessments.slums_score is
  '0-100 risk score derived from the SLUMS cognitive screen. Replaced mmse_score.';
comment on column public.risk_assessments.steadi_score is
  '0-100 risk score from the CDC STEADI home hazard checklist. Replaced home_fast_score.';
