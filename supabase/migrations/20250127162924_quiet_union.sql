/*
  # Add test configuration if not exists
  
  1. Changes
    - Adds a test configuration only if it doesn't already exist
    - Uses DO block to safely check for existence
  
  2. Safety
    - Prevents duplicate slug errors
    - Maintains data integrity
*/

DO $$ 
BEGIN
  -- Only insert if the test configuration doesn't exist
  IF NOT EXISTS (SELECT 1 FROM site_configs WHERE slug = 'test') THEN
    INSERT INTO site_configs (
      name,
      slug,
      client_name,
      client_logo,
      company_logo,
      company_name,
      background_color,
      title_color,
      transcript_color,
      transcript_font_size,
      word_cloud_background_color,
      word_cloud_text_color,
      word_cloud_position,
      word_cloud_size
    ) VALUES (
      'Test Configuration',
      'test',
      'Test Client',
      'https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?auto=format&fit=crop&q=80',
      'Test Company',
      '#103c6d',
      '#FFFFFF',
      '#FFFFFF',
      '40px',
      'rgba(0, 0, 0, 0.2)',
      '#FFFFFF',
      '{"top": "32px", "right": "16px"}',
      '{"width": 300, "height": 200}'
    );
  END IF;
END $$;