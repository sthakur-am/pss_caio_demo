/*
  # Create survey tables

  1. New Tables
    - `survey_responses`
      - `id` (uuid, primary key)
      - `questionId` (text, references survey question)
      - `answer` (text)
      - `sessionId` (text)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `survey_responses` table
    - Add policies for public access to create responses
    - Add policies for <boltAction type="file" filePath="supabase/migrations/create_survey_tables.sql">
/*
  # Create survey tables

  1. New Tables
    - `survey_responses`
      - `id` (uuid, primary key)
      - `questionId` (text, references survey question)
      - `answer` (text)
      - `sessionId` (text)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `survey_responses` table
    - Add policies for public access to create responses
    - Add policies for authenticated users to read responses
*/

CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questionId text NOT NULL,
  answer text NOT NULL,
  sessionId text NOT NULL,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Allow public to insert responses
CREATE POLICY "Allow public to insert survey responses"
  ON survey_responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read responses
CREATE POLICY "Allow authenticated users to read responses"
  ON survey_responses
  FOR SELECT
  TO authenticated
  USING (true);