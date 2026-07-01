-- Drop insurance-billing columns from clients.
-- The business model is self-pay/family-pay only; the intake form no longer
-- collects insurance details. IF EXISTS because these columns were never
-- created by a migration and may only exist if added via the dashboard.

ALTER TABLE clients
DROP COLUMN IF EXISTS insurance_type,
DROP COLUMN IF EXISTS primary_payer_name;
