/*
  # Fix navigation background color column

  1. Changes
    - Ensure nav_background_color column exists with correct name
    - Set appropriate default value
    - Clean up any duplicate columns

  2. Security
    - Maintain existing RLS policies
*/

-- First, ensure the column exists with the correct name
ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS nav_background_color text DEFAULT 'rgba(17, 24, 39, 0.3)';

-- Update any null values to the default
UPDATE site_configs
SET nav_background_color = 'rgba(17, 24, 39, 0.3)'
WHERE nav_background_color IS NULL;

-- Clean up any old/incorrect columns
DO $$ 
BEGIN
  -- Check for and remove any incorrectly named columns
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'site_configs' 
    AND column_name = 'nav_background_color'
    AND column_name != 'nav_background_color'
  ) THEN
    ALTER TABLE site_configs DROP COLUMN nav_background_color;
  END IF;
END $$;