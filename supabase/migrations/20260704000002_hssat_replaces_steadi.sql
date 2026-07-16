alter table public.client_intake
  add column if not exists hssat jsonb;

comment on column public.client_intake.hssat is
  'tier 1 — HSSAT v5 home safety checklist (University at Buffalo, public domain). 10 areas with per-area hazard counts. Replaced STEADI, which replaced HOME FAST.';

alter table public.risk_assessments
  add column if not exists hssat_score smallint check (hssat_score between 0 and 100);

comment on column public.risk_assessments.hssat_score is
  '0-100 risk score from the HSSAT home hazard checklist. Replaced steadi_score.';
