/*
  # Add styling configuration fields

  1. New Columns
    - `background_color` - Background color for all pages (text, default: #103c6d)
    - `title_color` - Font color for titles (text, default: #FFFFFF)
    - `transcript_color` - Font color for transcription text (text, default: #FFFFFF)
    - `transcript_font_size` - Font size for transcription text (text, default: 40px)

  2. Changes
    - Add new columns with default values
    - Make all columns nullable to maintain backward compatibility
*/

ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS background_color text DEFAULT '#103c6d',
ADD COLUMN IF NOT EXISTS title_color text DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS transcript_color text DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS transcript_font_size text DEFAULT '40px';