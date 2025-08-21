-- Migration: create_custom_event_triggers_table
-- Table to store custom event triggers/occurrences

CREATE TABLE custom_event_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    custom_event_id UUID NOT NULL REFERENCES custom_events(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    session_id TEXT, -- Optional reference to sessions table
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB, -- Store additional data like element clicked, scroll percentage, etc.
    page_url TEXT NOT NULL,
    user_agent TEXT,
    ip_address INET
);

-- Create indexes for performance
CREATE INDEX idx_custom_event_triggers_custom_event_id ON custom_event_triggers (custom_event_id);
CREATE INDEX idx_custom_event_triggers_site_id ON custom_event_triggers (site_id);
CREATE INDEX idx_custom_event_triggers_triggered_at ON custom_event_triggers (triggered_at);
CREATE INDEX idx_custom_event_triggers_session_id ON custom_event_triggers (session_id);

-- Enable RLS
ALTER TABLE custom_event_triggers ENABLE ROW LEVEL SECURITY;

-- Policy for reading triggers (for analytics)
CREATE POLICY "Users can view custom event triggers for their sites"
ON custom_event_triggers
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM sites 
        WHERE sites.id = custom_event_triggers.site_id 
        AND sites.user_id = auth.uid()
    )
);

-- Policy for inserting triggers (this will be done by the tracking API)
CREATE POLICY "Allow insert for tracking API"
ON custom_event_triggers
FOR INSERT
WITH CHECK (true); -- We'll handle authentication in the API endpoint