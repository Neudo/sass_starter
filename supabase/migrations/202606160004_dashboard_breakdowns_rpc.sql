create or replace function public.get_analytics_dashboard(
  p_site_id uuid,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_previous_from timestamptz default null,
  p_previous_to timestamptz default null
)
returns jsonb
language sql
stable
set search_path = public
as $$
with overview as (
  select public.get_analytics_overview(
    p_site_id,
    p_from,
    p_to,
    p_previous_from,
    p_previous_to
  ) as data
),
current_sessions as (
  select *
  from public.sessions s
  where s.site_id = p_site_id
    and (p_from is null or s.created_at >= p_from)
    and (p_to is null or s.created_at <= p_to)
),
current_page_views as (
  select *
  from public.page_views pv
  where pv.site_id = p_site_id
    and (p_from is null or pv.created_at >= p_from)
    and (p_to is null or pv.created_at <= p_to)
),
page_view_totals as (
  select greatest(count(*), 1)::numeric as total from current_page_views
),
session_totals as (
  select greatest(count(*), 1)::numeric as total from current_sessions
),
top_pages as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'page', page_path,
        'count', count,
        'percentage', round((count::numeric / (select total from page_view_totals)) * 100, 1)
      )
      order by count desc, page_path asc
    ),
    '[]'::jsonb
  ) as data
  from (
    select page_path, count(*)::int as count
    from current_page_views
    group by page_path
  ) grouped
),
entry_pages as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'page', page_path,
        'count', count,
        'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)
      )
      order by count desc, page_path asc
    ),
    '[]'::jsonb
  ) as data
  from (
    select page_path, count(*)::int as count
    from current_page_views
    where entry_page = true
    group by page_path
  ) grouped
),
exit_pages as (
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'page', page_path,
        'count', count,
        'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)
      )
      order by count desc, page_path asc
    ),
    '[]'::jsonb
  ) as data
  from (
    select distinct on (session_id)
      session_id,
      page_path
    from current_page_views
    order by session_id, created_at desc
  ) exits
  right join (
    select page_path, count(*)::int as count
    from (
      select distinct on (session_id)
        session_id,
        page_path
      from current_page_views
      order by session_id, created_at desc
    ) latest
    group by page_path
  ) grouped using (page_path)
),
countries as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (
    select country as name, count(*)::int as count
    from current_sessions
    where country is not null
    group by country
  ) grouped
),
regions as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1), 'country', country) order by count desc, name asc), '[]'::jsonb) as data
  from (
    select region as name, min(country) as country, count(*)::int as count
    from current_sessions
    where region is not null
    group by region
  ) grouped
),
cities as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1), 'country', country) order by count desc, name asc), '[]'::jsonb) as data
  from (
    select city as name, min(country) as country, count(*)::int as count
    from current_sessions
    where city is not null
    group by city
  ) grouped
),
languages as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (
    select language as name, count(*)::int as count
    from current_sessions
    where language is not null
    group by language
  ) grouped
),
browsers as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (
    select browser as name, count(*)::int as count
    from current_sessions
    where browser is not null
    group by browser
  ) grouped
),
os as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (
    select os as name, count(*)::int as count
    from current_sessions
    where os is not null
    group by os
  ) grouped
),
screen_sizes as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (
    select screen_size as name, count(*)::int as count
    from current_sessions
    where screen_size is not null
    group by screen_size
  ) grouped
),
channels as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (
    select coalesce(channel, 'Direct') as name, count(*)::int as count
    from current_sessions
    group by coalesce(channel, 'Direct')
  ) grouped
),
sources as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'rawValue', raw_value, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (
    select
      coalesce(utm_source, referrer_domain, 'direct') as name,
      coalesce(utm_source, referrer_domain, 'direct') as raw_value,
      count(*)::int as count
    from current_sessions
    group by coalesce(utm_source, referrer_domain, 'direct')
  ) grouped
),
campaigns as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (
    select utm_campaign as name, count(*)::int as count
    from current_sessions
    where utm_campaign is not null
    group by utm_campaign
  ) grouped
)
select jsonb_build_object(
  'countries', countries.data,
  'regions', regions.data,
  'cities', cities.data,
  'languages', languages.data,
  'devices', jsonb_build_object(
    'browsers', browsers.data,
    'os', os.data,
    'screenSizes', screen_sizes.data
  ),
  'pages', jsonb_build_object(
    'topPages', top_pages.data,
    'entryPages', entry_pages.data,
    'exitPages', exit_pages.data
  ),
  'sources', jsonb_build_object(
    'channels', channels.data,
    'sources', sources.data,
    'campaigns', campaigns.data
  ),
  'previousMetrics', overview.data -> 'previousMetrics',
  'metrics', (overview.data -> 'metrics') || jsonb_build_object(
    'change',
    case
      when overview.data -> 'previousMetrics' is null then null
      else jsonb_build_object(
        'visitors', 0,
        'totalVisits', 0,
        'totalPageviews', 0,
        'viewsPerVisit', 0,
        'bounceRate', 0,
        'avgDuration', 0
      )
    end
  )
)
from overview, countries, regions, cities, languages, browsers, os, screen_sizes, channels, sources, campaigns, top_pages, entry_pages, exit_pages;
$$;

revoke execute on function public.get_analytics_dashboard(uuid, timestamptz, timestamptz, timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function public.get_analytics_dashboard(uuid, timestamptz, timestamptz, timestamptz, timestamptz)
  to service_role;
