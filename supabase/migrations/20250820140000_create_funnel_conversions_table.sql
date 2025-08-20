-- Create funnel_conversions table for tracking user progression through funnels
CREATE TABLE funnel_conversions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  url_visited VARCHAR(500) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_funnel_conversions_funnel_id ON funnel_conversions(funnel_id);
CREATE INDEX idx_funnel_conversions_session_id ON funnel_conversions(session_id);
CREATE INDEX idx_funnel_conversions_site_id ON funnel_conversions(site_id);
CREATE INDEX idx_funnel_conversions_completed_at ON funnel_conversions(completed_at);

-- Create composite index for funnel analysis
CREATE INDEX idx_funnel_conversions_funnel_session ON funnel_conversions(funnel_id, session_id);

-- Add RLS policies
ALTER TABLE funnel_conversions ENABLE ROW LEVEL SECURITY;

-- Users can only see conversions for their own sites
CREATE POLICY "Users can view their own funnel conversions" ON funnel_conversions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sites 
      WHERE sites.id = funnel_conversions.site_id 
      AND sites.user_id = auth.uid()
    )
  );

-- Only the system can insert conversion data (via service role)
CREATE POLICY "System can insert funnel conversions" ON funnel_conversions
  FOR INSERT WITH CHECK (true);