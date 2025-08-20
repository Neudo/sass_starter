-- Add click_link to the event_type check constraint
ALTER TABLE funnel_steps 
DROP CONSTRAINT IF EXISTS funnel_steps_event_type_check;

ALTER TABLE funnel_steps 
ADD CONSTRAINT funnel_steps_event_type_check 
CHECK (event_type IN ('click', 'scroll', 'click_link') OR event_type IS NULL);

-- Update the constraint that ensures custom_event steps have event_type
ALTER TABLE funnel_steps 
DROP CONSTRAINT IF EXISTS funnel_steps_page_view_fields_check;

ALTER TABLE funnel_steps 
ADD CONSTRAINT funnel_steps_page_view_fields_check 
CHECK (
  (step_type = 'page_view' AND url_pattern IS NOT NULL AND match_type IS NOT NULL) OR
  (step_type = 'custom_event' AND event_type IS NOT NULL AND event_type IN ('click', 'scroll', 'click_link'))
);

-- Add comment
COMMENT ON CONSTRAINT funnel_steps_event_type_check ON funnel_steps IS 'Allows click, scroll, and click_link event types';

-- Example event_config for click_link:
-- {"url_pattern": "/checkout", "link_text": "Buy Now", "exact_match": false}