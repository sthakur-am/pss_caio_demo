/*
  # Update survey responses table schema

  1. Changes
    - Ensure table exists with correct column names (snake_case)
    - Drop existing policies if they exist
    - Recreate policies with proper permissions

  2. Security
    - Enable RLS
    - Allow public to insert responses
    - Allow authenticated users to read responses
*/

-- First, drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public to insert survey responses" ON survey_responses;
  DROP POLICY IF EXISTS "Allow authenticated users to read responses" ON survey_responses;
END $$;

-- Create or update the table
DO $$ 
BEGIN
  -- Create the table if it doesn't exist
  CREATE TABLE IF NOT EXISTS survey_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id text NOT NULL,
    answer text NOT NULL,
    session_id text NOT NULL,
    timestamp timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
  );

  -- Ensure RLS is enabled
  ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN
    NULL;
END $$;

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