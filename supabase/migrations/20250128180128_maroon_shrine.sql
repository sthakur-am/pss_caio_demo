-- First, drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public to insert survey responses" ON survey_responses;
  DROP POLICY IF EXISTS "Allow authenticated users to read responses" ON survey_responses;
END $$;

-- Drop and recreate the table with correct column names
DROP TABLE IF EXISTS survey_responses;

CREATE TABLE survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id text NOT NULL,
  answer text NOT NULL,
  session_id text NOT NULL,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Ensure RLS is enabled
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Create new policies
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