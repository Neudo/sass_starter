-- Migration: create_custom_events_table
-- Create custom_events table for event definitions

CREATE TABLE custom_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_selector VARCHAR(500), -- CSS selector for click events
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('click', 'form_submit', 'page_view', 'scroll', 'custom')),
    trigger_config JSONB, -- Configuration for triggers (scroll percentage, form fields, etc.)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique event names per site
    UNIQUE(site_id, name)
);

-- Add RLS policies
ALTER TABLE custom_events ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own custom events
CREATE POLICY "Users can manage custom events for their sites" 
ON custom_events
FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM sites 
        WHERE sites.id = custom_events.site_id 
        AND sites.user_id = auth.uid()
    )
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_events_updated_at 
    BEFORE UPDATE ON custom_events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();