/*
  # Add word cloud configuration columns

  1. Changes
    - Add word_cloud_background_color column with default value
    - Add word_cloud_position column as JSONB to store position values
    - Add word_cloud_size column as JSONB to store width and height
  
  2. Notes
    - Using JSONB for flexible position and size configuration
    - Setting sensible defaults for all columns
*/

ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS word_cloud_background_color text DEFAULT 'rgba(0, 0, 0, 0.2)',
ADD COLUMN IF NOT EXISTS word_cloud_position jsonb DEFAULT '{"top": "32px", "right": "16px"}'::jsonb,
ADD COLUMN IF NOT EXISTS word_cloud_size jsonb DEFAULT '{"width": 300, "height": 200}'::jsonb;