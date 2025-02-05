/*
  # Add QR Code URL Support

  1. Changes
    - Add `qr_code_url` column to site_configs table
    - Set column to be nullable to allow optional QR codes
    - Add default value of NULL

  2. Notes
    - This allows storing custom QR code URLs for each site configuration
    - URLs can be used to display QR codes on all pages of a site
*/

-- Add qr_code_url column if it doesn't exist
ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS qr_code_url text DEFAULT NULL;

-- Update existing rows to have NULL value if not set
UPDATE site_configs
SET qr_code_url = NULL
WHERE qr_code_url IS NULL;