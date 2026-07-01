-- Add the adl_iadl JSONB column to client_intake.
--
-- The 3-tier assessment wizard saves the "ADLs & IADLs" section to a column
-- named adl_iadl, but 20260628000001_new_assessment_schema.sql never created
-- it — its comment mistakenly listed adl_iadl among the pre-existing legacy
-- columns (the legacy column is adls_iadls, plural). Saving that section
-- failed with: "Could not find the 'adl_iadl' column of 'client_intake'".

alter table public.client_intake
  add column if not exists adl_iadl jsonb;

comment on column public.client_intake.adl_iadl is
  'tier 1 — ADLs & IADLs: activities of daily living and instrumental activities of daily living. Replaces legacy adls_iadls column.';
