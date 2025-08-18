-- Add public dashboard toggle to sites table
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS public_enabled BOOLEAN DEFAULT FALSE;