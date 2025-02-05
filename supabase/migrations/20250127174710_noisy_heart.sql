/*
  # Add navigation bar color to site configuration
  
  1. Changes
    - Add nav_bar_color column to site_configs table with default value
*/

ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS nav_bar_color text DEFAULT '#FFFFFF';

-- Update existing configurations with default nav bar color
UPDATE site_configs
SET nav_bar_color = '#FFFFFF'
WHERE nav_bar_color IS NULL;