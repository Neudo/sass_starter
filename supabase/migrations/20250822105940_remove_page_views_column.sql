-- Remove redundant page_views column since we can calculate it from visited_pages
-- page_views = array_length(visited_pages, 1)
ALTER TABLE sessions DROP COLUMN IF EXISTS page_views;