/*
  # Fix Site Configs RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Create new, more permissive policies for public access
    - Enable full access for both authenticated and anonymous users
    
  2. Security
    - Allow public read access to all site configurations
    - Allow full CRUD operations for all users (since this is a demo app)
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can manage site configs" ON site_configs;
  DROP POLICY IF EXISTS "Public can read site configs" ON site_configs;
END $$;

-- Create new policies that allow full access
CREATE POLICY "Allow full access to site_configs"
  ON site_configs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE site_configs ENABLE ROW LEVEL SECURITY;