/*
  # Add survey configuration to site_configs

  1. Changes
    - Add survey_config column to site_configs table with proper JSON structure
    - Update existing rows with default survey configuration

  2. Structure
    - questions: Array of survey questions
    - openaiPrompt: String for OpenAI analysis
    - qrCodeSize: Number for QR code size
    - qrCodeColor: String for QR code color
*/

-- Add survey_config column if it doesn't exist
ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS survey_config jsonb DEFAULT jsonb_build_object(
  'questions', '[]'::jsonb,
  'openaiPrompt', 'Please analyze the following survey responses and provide insights:\n\n{responses}\n\nPlease provide:\n1. A brief summary\n2. Key trends\n3. Actionable recommendations',
  'qrCodeSize', 128,
  'qrCodeColor', '#000000'
);

-- Update existing rows with default survey configuration if null
UPDATE site_configs
SET survey_config = jsonb_build_object(
  'questions', '[]'::jsonb,
  'openaiPrompt', 'Please analyze the following survey responses and provide insights:\n\n{responses}\n\nPlease provide:\n1. A brief summary\n2. Key trends\n3. Actionable recommendations',
  'qrCodeSize', 128,
  'qrCodeColor', '#000000'
)
WHERE survey_config IS NULL;