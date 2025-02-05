/*
  # Fix column names and add missing columns

  1. Changes
    - Ensure consistent column naming
    - Add any missing columns
    - Set appropriate default values

  2. Security
    - Maintain existing RLS policies
*/

-- First ensure all required columns exist with correct names
ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS nav_bar_color text DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS nav_background_color text DEFAULT 'rgba(17, 24, 39, 0.3)';

-- Update any null values to defaults
UPDATE site_configs
SET 
  nav_bar_color = COALESCE(nav_bar_color, '#FFFFFF'),
  nav_background_color = COALESCE(nav_background_color, 'rgba(17, 24, 39, 0.3)');

-- Drop any old/incorrect columns if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_configs' AND column_name = 'nav_background_color') THEN
    ALTER TABLE site_configs DROP COLUMN IF EXISTS nav_background_color;
  END IF;
END $$;