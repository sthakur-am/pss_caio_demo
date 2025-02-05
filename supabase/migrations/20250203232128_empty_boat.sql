-- Add nav_background_color column with default value
ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS nav_background_color text DEFAULT 'rgba(17, 24, 39, 0.3)';

-- Update existing rows with default value
UPDATE site_configs
SET nav_background_color = 'rgba(17, 24, 39, 0.3)'
WHERE nav_background_color IS NULL;