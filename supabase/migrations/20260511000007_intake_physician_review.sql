-- ─────────────────────────────────────────────────────────────────────────────
-- 007: intake_physician_review
--   Adds the physician synthesis section to client_intake.
--   This JSONB column stores frailty indicators, chronic disease burden,
--   readmission risk, pain limitations, neurologic disease, cardiopulmonary
--   reserve, and overall physician impression.
--   Kept as JSONB so sub-fields can evolve with clinical practice changes
--   without requiring further migrations.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.client_intake
  add column physician_review jsonb;

comment on column public.client_intake.physician_review is
  'Physician synthesis section: frailty, chronic disease burden, readmission risk, pain, neurologic, cardiopulmonary, and overall impression.';
