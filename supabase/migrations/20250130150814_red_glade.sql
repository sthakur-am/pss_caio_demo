-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to insert survey responses" ON survey_responses;
DROP POLICY IF EXISTS "Allow authenticated users to read responses" ON survey_responses;

-- Create new policies that allow full access
CREATE POLICY "Allow full access to survey_responses"
  ON survey_responses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;