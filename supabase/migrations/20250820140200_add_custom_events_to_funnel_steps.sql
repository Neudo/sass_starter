-- Add custom events support to funnel_steps table
ALTER TABLE funnel_steps 
ADD COLUMN step_type VARCHAR(50) DEFAULT 'page_view' CHECK (step_type IN ('page_view', 'custom_event'));

ALTER TABLE funnel_steps 
ADD COLUMN event_type VARCHAR(50) CHECK (event_type IN ('click', 'scroll') OR event_type IS NULL);

ALTER TABLE funnel_steps 
ADD COLUMN event_config JSONB;

-- Update existing steps to have step_type = 'page_view'
UPDATE funnel_steps 
SET step_type = 'page_view' 
WHERE step_type IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN funnel_steps.step_type IS 'Type of step: page_view or custom_event';
COMMENT ON COLUMN funnel_steps.event_type IS 'For custom_event: click, scroll, etc.';
COMMENT ON COLUMN funnel_steps.event_config IS 'Configuration for custom events (JSON)';

-- Examples of event_config:
-- For click: {"selector": "#show-more", "element_type": "button"}
-- For scroll: {"scroll_percentage": 75, "page_pattern": "/pricing"}