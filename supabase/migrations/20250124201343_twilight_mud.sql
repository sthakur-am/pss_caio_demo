-- Add URL field to site_configs table
ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS shortened_url text;