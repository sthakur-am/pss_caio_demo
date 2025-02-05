/*
  # Create site configurations table

  1. New Tables
    - `site_configs`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the site configuration
      - `slug` (text) - URL-friendly version of the name
      - `client_name` (text) - Client name (e.g., AFCEA)
      - `client_logo` (text) - URL of the client logo
      - `company_logo` (text) - URL of the company logo (e.g., A&M)
      - `company_name` (text) - Company name
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `site_configs` table
    - Add policy for authenticated users to manage configurations
*/

CREATE TABLE site_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  client_name text NOT NULL,
  client_logo text NOT NULL,
  company_logo text NOT NULL,
  company_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_configs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage site configs
CREATE POLICY "Authenticated users can manage site configs"
  ON site_configs
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow public to read site configs
CREATE POLICY "Public can read site configs"
  ON site_configs
  FOR SELECT
  TO anon
  USING (true);