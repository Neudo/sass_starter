-- Migration: Add funnel step completions table for deduplication
-- This prevents counting the same user multiple times for the same funnel step

-- Create table to track which sessions have completed which steps
CREATE TABLE IF NOT EXISTS funnel_step_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID NOT NULL REFERENCES funnel_steps(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    site_domain VARCHAR(255) NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    
    -- Ensure one completion per session per step
    UNIQUE(step_id, session_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_funnel_step_completions_step_session ON funnel_step_completions(step_id, session_id);
CREATE INDEX IF NOT EXISTS idx_funnel_step_completions_domain ON funnel_step_completions(site_domain);
CREATE INDEX IF NOT EXISTS idx_funnel_step_completions_completed_at ON funnel_step_completions(completed_at);

-- Add comment to document the table purpose
COMMENT ON TABLE funnel_step_completions IS 'Tracks which sessions have completed which funnel steps to prevent duplicate counting';