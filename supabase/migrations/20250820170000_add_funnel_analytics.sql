-- Create funnel analytics materialized view for aggregated statistics
CREATE MATERIALIZED VIEW funnel_analytics AS
SELECT 
  f.id as funnel_id,
  f.name as funnel_name,
  f.site_id,
  fs.id as step_id,
  fs.step_number,
  fs.name as step_name,
  fs.step_type,
  -- Total unique sessions that reached this step
  COUNT(DISTINCT fc.session_id) as unique_visitors,
  -- Total conversions for this step
  COUNT(fc.id) as total_conversions,
  -- Last updated timestamp
  NOW() as last_updated
FROM funnels f
JOIN funnel_steps fs ON fs.funnel_id = f.id
LEFT JOIN funnel_conversions fc ON fc.funnel_id = f.id AND fc.step_number = fs.step_number
WHERE f.is_active = true
GROUP BY f.id, f.name, f.site_id, fs.id, fs.step_number, fs.name, fs.step_type
ORDER BY f.id, fs.step_number;

-- Create unique index on the materialized view
CREATE UNIQUE INDEX idx_funnel_analytics_unique 
ON funnel_analytics(funnel_id, step_id);

-- Create indexes for efficient querying
CREATE INDEX idx_funnel_analytics_funnel_id ON funnel_analytics(funnel_id);
CREATE INDEX idx_funnel_analytics_site_id ON funnel_analytics(site_id);

-- Create a function to refresh funnel analytics
CREATE OR REPLACE FUNCTION refresh_funnel_analytics()
RETURNS void AS $$
BEGIN
  -- Refresh the materialized view
  REFRESH MATERIALIZED VIEW CONCURRENTLY funnel_analytics;
END;
$$ LANGUAGE plpgsql;

-- Create a function to automatically refresh analytics when conversions are added
CREATE OR REPLACE FUNCTION trigger_refresh_funnel_analytics()
RETURNS trigger AS $$
BEGIN
  -- Schedule a refresh (we could use pg_cron or call it manually)
  PERFORM refresh_funnel_analytics();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh analytics when new conversions are added
CREATE TRIGGER trigger_funnel_conversions_analytics
  AFTER INSERT OR UPDATE OR DELETE ON funnel_conversions
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_funnel_analytics();

-- Initial refresh
SELECT refresh_funnel_analytics();

-- Create a view for easy funnel overview with drop-off rates
CREATE VIEW funnel_overview AS
SELECT 
  fa.funnel_id,
  fa.funnel_name,
  fa.site_id,
  fa.step_number,
  fa.step_name,
  fa.step_type,
  fa.unique_visitors,
  fa.total_conversions,
  -- Conversion rate from previous step
  CASE 
    WHEN fa.step_number = 1 THEN 100.0 -- First step is always 100%
    WHEN prev_step.unique_visitors > 0 
    THEN (fa.unique_visitors::DECIMAL / prev_step.unique_visitors::DECIMAL) * 100
    ELSE 0
  END as conversion_rate_from_previous,
  -- Drop-off rate to next step
  CASE 
    WHEN next_step.unique_visitors IS NOT NULL AND fa.unique_visitors > 0
    THEN ((fa.unique_visitors - next_step.unique_visitors)::DECIMAL / fa.unique_visitors::DECIMAL) * 100
    ELSE 0
  END as drop_off_rate_to_next,
  -- Overall conversion rate from first step
  CASE 
    WHEN first_step.unique_visitors > 0 
    THEN (fa.unique_visitors::DECIMAL / first_step.unique_visitors::DECIMAL) * 100
    ELSE 0
  END as overall_conversion_rate
FROM funnel_analytics fa
LEFT JOIN funnel_analytics prev_step ON (
  prev_step.funnel_id = fa.funnel_id 
  AND prev_step.step_number = fa.step_number - 1
)
LEFT JOIN funnel_analytics next_step ON (
  next_step.funnel_id = fa.funnel_id 
  AND next_step.step_number = fa.step_number + 1
)
LEFT JOIN funnel_analytics first_step ON (
  first_step.funnel_id = fa.funnel_id 
  AND first_step.step_number = 1
)
ORDER BY fa.funnel_id, fa.step_number;

-- Note: RLS cannot be applied directly to materialized views
-- Security will be handled at the application level through the funnel_overview view

-- Add comments
COMMENT ON MATERIALIZED VIEW funnel_analytics IS 'Aggregated statistics for funnel performance';
COMMENT ON FUNCTION refresh_funnel_analytics() IS 'Refreshes funnel analytics materialized view and calculates conversion rates';
COMMENT ON VIEW funnel_overview IS 'Complete funnel overview with drop-off rates and conversion metrics';