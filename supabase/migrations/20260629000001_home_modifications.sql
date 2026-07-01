-- Add home_modifications JSONB column to client_intake
-- Stores structured modification recommendations for ML training data

ALTER TABLE client_intake
ADD COLUMN IF NOT EXISTS home_modifications JSONB DEFAULT NULL;

COMMENT ON COLUMN client_intake.home_modifications IS
  'Structured home modification recommendations: items with category, type, cost, priority, and triggering assessment finding. Feeds ML pricing model.';
