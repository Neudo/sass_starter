-- Migration: add_trigger_count_to_custom_events
-- Add a simple counter column instead of a separate triggers table

ALTER TABLE custom_events 
ADD COLUMN trigger_count INTEGER DEFAULT 0;