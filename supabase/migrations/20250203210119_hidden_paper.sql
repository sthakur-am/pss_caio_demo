/*
  # Add AI Prompts to Site Configs

  1. Changes
    - Add default_analysis_prompt column to site_configs
    - Add additional_prompts column to site_configs
    - Set default values for both columns
    - Update existing rows with default values

  2. Default Values
    - default_analysis_prompt: Standard analysis prompt template
    - additional_prompts: Array of 4 predefined analysis prompts
*/

-- Add new columns with default values
ALTER TABLE site_configs 
ADD COLUMN IF NOT EXISTS default_analysis_prompt text,
ADD COLUMN IF NOT EXISTS additional_prompts jsonb;

-- Set default values for new installations
ALTER TABLE site_configs 
ALTER COLUMN default_analysis_prompt SET DEFAULT 'Analyze the following transcribed text and provide insights:

{text}

Please provide:
1. Key themes and topics discussed
2. Main points and conclusions
3. Any action items or next steps mentioned
4. Areas that might need clarification or follow-up';

-- Update existing rows with default values
UPDATE site_configs
SET 
  default_analysis_prompt = COALESCE(default_analysis_prompt, 
    'Analyze the following transcribed text and provide insights:

{text}

Please provide:
1. Key themes and topics discussed
2. Main points and conclusions
3. Any action items or next steps mentioned
4. Areas that might need clarification or follow-up'
  ),
  additional_prompts = COALESCE(additional_prompts, '[
    {
      "title": "Executive Summary",
      "prompt": "Create a concise executive summary of the discussion:\n\n{text}\n\nInclude:\n1. Main objectives and outcomes\n2. Key decisions made\n3. Strategic implications\n4. Next steps and recommendations"
    },
    {
      "title": "Action Items",
      "prompt": "Extract and organize all action items from the discussion:\n\n{text}\n\nFor each action item, identify:\n1. The specific task or deliverable\n2. Assigned responsibility (if mentioned)\n3. Timeline or deadline (if mentioned)\n4. Dependencies or prerequisites"
    },
    {
      "title": "Risk Analysis",
      "prompt": "Analyze the discussion for potential risks and challenges:\n\n{text}\n\nProvide:\n1. Identified risks and challenges\n2. Potential impact assessment\n3. Suggested mitigation strategies\n4. Areas requiring additional attention"
    },
    {
      "title": "Follow-up Questions",
      "prompt": "Review the discussion and identify areas needing clarification:\n\n{text}\n\nGenerate:\n1. Key questions for follow-up\n2. Topics requiring more detail\n3. Potential gaps in the discussion\n4. Suggested points for the next meeting"
    }
  ]'::jsonb)
WHERE default_analysis_prompt IS NULL OR additional_prompts IS NULL;