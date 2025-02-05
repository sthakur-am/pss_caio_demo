/*
  # Add QR code display settings

  1. New Columns
    - `qr_code_enabled` (boolean) - Controls whether QR code is displayed
    - `qr_code_position` (jsonb) - Stores QR code position preferences
    - `qr_code_style` (jsonb) - Stores QR code styling preferences

  2. Security
    - Maintains existing RLS policies
*/

-- Add new columns for QR code settings
ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS qr_code_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS qr_code_position jsonb DEFAULT '{"top": "50px", "right": "50px"}'::jsonb,
ADD COLUMN IF NOT EXISTS qr_code_style jsonb DEFAULT '{"size": 128, "margin": 2, "color": "#000000", "backgroundColor": "#FFFFFF"}'::jsonb;

-- Update existing rows with default values
UPDATE site_configs
SET 
  qr_code_enabled = true,
  qr_code_position = '{"top": "50px", "right": "50px"}'::jsonb,
  qr_code_style = '{"size": 128, "margin": 2, "color": "#000000", "backgroundColor": "#FFFFFF"}'::jsonb
WHERE qr_code_enabled IS NULL;