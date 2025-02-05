/*
  # Add OpenAI API key column to site_configs

  1. New Columns
    - `openai_api_key` (text, nullable) - Stores the OpenAI API key for each configuration
  
  2. Security
    - Column is nullable to maintain backward compatibility
    - No default value to ensure explicit key setting
*/

ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS openai_api_key text;