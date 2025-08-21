-- Migration: Cleanup funnel tables and add step_count to funnel_steps
-- This migration simplifies the funnel analytics by following the custom events pattern

-- Step 1: Drop the view first (depends on funnel_analytics)
DROP VIEW IF EXISTS funnel_overview;

-- Step 2: Drop the materialized view and tables we no longer need  
DROP MATERIALIZED VIEW IF EXISTS funnel_analytics;
DROP TABLE IF EXISTS funnel_conversions;

-- Step 3: Add step_count column to funnel_steps table
ALTER TABLE funnel_steps 
ADD COLUMN IF NOT EXISTS step_count INTEGER DEFAULT 0;

-- Step 4: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_funnel_steps_count ON funnel_steps(step_count);

-- Step 5: Add comment to document the new column
COMMENT ON COLUMN funnel_steps.step_count IS 'Number of times this funnel step has been completed/triggered';