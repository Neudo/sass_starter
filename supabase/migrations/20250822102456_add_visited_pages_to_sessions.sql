-- Add visited_pages column to track unique pages per session
ALTER TABLE sessions ADD COLUMN visited_pages JSONB DEFAULT '[]'::jsonb;

-- Create index on visited_pages for better performance
CREATE INDEX idx_sessions_visited_pages ON sessions USING GIN (visited_pages);

-- Add comment to explain the column
COMMENT ON COLUMN sessions.visited_pages IS 'Array of unique pages visited during this session';