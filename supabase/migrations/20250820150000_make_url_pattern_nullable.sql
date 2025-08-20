-- Make url_pattern nullable for custom events
ALTER TABLE funnel_steps 
ALTER COLUMN url_pattern DROP NOT NULL;

-- Also make match_type nullable for custom events
ALTER TABLE funnel_steps 
ALTER COLUMN match_type DROP NOT NULL;

-- Add a check constraint to ensure page_view steps have required fields
ALTER TABLE funnel_steps 
ADD CONSTRAINT funnel_steps_page_view_fields_check 
CHECK (
  (step_type = 'page_view' AND url_pattern IS NOT NULL AND match_type IS NOT NULL) OR
  (step_type = 'custom_event' AND event_type IS NOT NULL)
);

-- Add comments
COMMENT ON CONSTRAINT funnel_steps_page_view_fields_check ON funnel_steps IS 'Ensures page_view steps have url_pattern and match_type, and custom_event steps have event_type';