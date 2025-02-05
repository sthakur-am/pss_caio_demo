/*
  # Add context files support
  
  1. Changes
    - Add context_files column to site_configs table to store uploaded file data
    - Set default value to empty array
    - Update existing rows with default value
*/

-- Add context_files column if it doesn't exist
ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS context_files jsonb DEFAULT '[]'::jsonb;

-- Update existing rows with default value
UPDATE site_configs
SET context_files = '[]'::jsonb
WHERE context_files IS NULL;