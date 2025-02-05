/*
  # Add site name to survey responses

  1. Changes
    - Add site_name column to survey_responses table with a default value
    - Update existing rows with a default site name
    - Make site_name column required
    - Update policies to maintain existing permissions
*/

-- First add the column as nullable with a default value
ALTER TABLE survey_responses
ADD COLUMN IF NOT EXISTS site_name text DEFAULT 'default';

-- Update any existing rows to have the default value
UPDATE survey_responses
SET site_name = 'default'
WHERE site_name IS NULL;

-- Now make the column required
ALTER TABLE survey_responses
ALTER COLUMN site_name SET NOT NULL;

-- Drop and recreate policies to include new column
DROP POLICY IF EXISTS "Allow public to insert survey responses" ON survey_responses;
DROP POLICY IF EXISTS "Allow authenticated users to read responses" ON survey_responses;

-- Recreate policies
CREATE POLICY "Allow public to insert survey responses"
  ON survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read responses"
  ON survey_responses
  FOR SELECT
  TO authenticated
  USING (true);