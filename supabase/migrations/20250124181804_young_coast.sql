/*
  # Add word cloud text color configuration

  1. Changes
    - Add word_cloud_text_color column with default value
  
  2. Notes
    - Default color set to white for contrast against dark backgrounds
*/

ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS word_cloud_text_color text DEFAULT '#FFFFFF';