drop function if exists public.get_analytics_dashboard(
  uuid,
  timestamptz,
  timestamptz,
  timestamptz,
  timestamptz
);

create or replace function public.get_analytics_dashboard(
  p_site_id uuid,
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_previous_from timestamptz default null,
  p_previous_to timestamptz default null,
  p_filters jsonb default '[]'::jsonb
)
returns jsonb
language sql
stable
set search_path = public
as $$
with current_sessions as (
  select *
  from public.sessions s
  where s.site_id = p_site_id
    and (p_from is null or s.created_at >= p_from)
    and (p_to is null or s.created_at <= p_to)
    and (
      p_filters = '[]'::jsonb
      or not exists (
        select 1
        from jsonb_array_elements(p_filters) as filter_item(filter)
        where not (
          case filter_item.filter ->> 'type'
            when 'country' then s.country = filter_item.filter ->> 'value'
            when 'region' then s.region = filter_item.filter ->> 'value'
            when 'city' then s.city = filter_item.filter ->> 'value'
            when 'browser' then s.browser = filter_item.filter ->> 'value'
            when 'os' then s.os = filter_item.filter ->> 'value'
            when 'screen_size' then s.screen_size = filter_item.filter ->> 'value'
            when 'channel' then coalesce(s.channel, 'Direct') = filter_item.filter ->> 'value'
            when 'referrer_domain' then s.referrer_domain = filter_item.filter ->> 'value'
            when 'utm_source' then s.utm_source = filter_item.filter ->> 'value'
            when 'utm_medium' then s.utm_medium = filter_item.filter ->> 'value'
            when 'utm_campaign' then s.utm_campaign = filter_item.filter ->> 'value'
            when 'utm_term' then s.utm_term = filter_item.filter ->> 'value'
            when 'utm_content' then s.utm_content = filter_item.filter ->> 'value'
            when 'visited_page' then exists (
              select 1
              from public.page_views pv_filter
              where pv_filter.session_id = s.id
                and pv_filter.page_path = filter_item.filter ->> 'value'
                and (p_from is null or pv_filter.created_at >= p_from)
                and (p_to is null or pv_filter.created_at <= p_to)
            )
            when 'entry_page' then exists (
              select 1
              from public.page_views pv_filter
              where pv_filter.session_id = s.id
                and pv_filter.page_path = filter_item.filter ->> 'value'
                and pv_filter.entry_page = true
            )
            when 'exit_page' then exists (
              select 1
              from (
                select pv_filter.page_path
                from public.page_views pv_filter
                where pv_filter.session_id = s.id
                  and (p_from is null or pv_filter.created_at >= p_from)
                  and (p_to is null or pv_filter.created_at <= p_to)
                order by pv_filter.created_at desc
                limit 1
              ) latest
              where latest.page_path = filter_item.filter ->> 'value'
            )
            else true
          end
        )
      )
    )
),
previous_sessions as (
  select *
  from public.sessions s
  where s.site_id = p_site_id
    and p_previous_from is not null
    and p_previous_to is not null
    and s.created_at >= p_previous_from
    and s.created_at <= p_previous_to
    and (
      p_filters = '[]'::jsonb
      or not exists (
        select 1
        from jsonb_array_elements(p_filters) as filter_item(filter)
        where not (
          case filter_item.filter ->> 'type'
            when 'country' then s.country = filter_item.filter ->> 'value'
            when 'region' then s.region = filter_item.filter ->> 'value'
            when 'city' then s.city = filter_item.filter ->> 'value'
            when 'browser' then s.browser = filter_item.filter ->> 'value'
            when 'os' then s.os = filter_item.filter ->> 'value'
            when 'screen_size' then s.screen_size = filter_item.filter ->> 'value'
            when 'channel' then coalesce(s.channel, 'Direct') = filter_item.filter ->> 'value'
            when 'referrer_domain' then s.referrer_domain = filter_item.filter ->> 'value'
            when 'utm_source' then s.utm_source = filter_item.filter ->> 'value'
            when 'utm_medium' then s.utm_medium = filter_item.filter ->> 'value'
            when 'utm_campaign' then s.utm_campaign = filter_item.filter ->> 'value'
            when 'utm_term' then s.utm_term = filter_item.filter ->> 'value'
            when 'utm_content' then s.utm_content = filter_item.filter ->> 'value'
            when 'visited_page' then exists (
              select 1
              from public.page_views pv_filter
              where pv_filter.session_id = s.id
                and pv_filter.page_path = filter_item.filter ->> 'value'
                and pv_filter.created_at >= p_previous_from
                and pv_filter.created_at <= p_previous_to
            )
            when 'entry_page' then exists (
              select 1
              from public.page_views pv_filter
              where pv_filter.session_id = s.id
                and pv_filter.page_path = filter_item.filter ->> 'value'
                and pv_filter.entry_page = true
            )
            when 'exit_page' then exists (
              select 1
              from (
                select pv_filter.page_path
                from public.page_views pv_filter
                where pv_filter.session_id = s.id
                  and pv_filter.created_at >= p_previous_from
                  and pv_filter.created_at <= p_previous_to
                order by pv_filter.created_at desc
                limit 1
              ) latest
              where latest.page_path = filter_item.filter ->> 'value'
            )
            else true
          end
        )
      )
    )
),
current_page_views as (
  select pv.*
  from public.page_views pv
  join current_sessions cs on cs.id = pv.session_id
  where pv.site_id = p_site_id
    and (p_from is null or pv.created_at >= p_from)
    and (p_to is null or pv.created_at <= p_to)
),
previous_page_views as (
  select pv.*
  from public.page_views pv
  join previous_sessions ps on ps.id = pv.session_id
  where pv.site_id = p_site_id
    and pv.created_at >= p_previous_from
    and pv.created_at <= p_previous_to
),
current_page_views_by_session as (
  select
    cs.id as session_id,
    count(pv.id)::int as pageviews,
    coalesce(sum(least(coalesce(pv.duration_seconds, 0), 1800)), 0)::int as duration_seconds
  from current_sessions cs
  left join current_page_views pv on pv.session_id = cs.id
  group by cs.id
),
previous_page_views_by_session as (
  select
    ps.id as session_id,
    count(pv.id)::int as pageviews,
    coalesce(sum(least(coalesce(pv.duration_seconds, 0), 1800)), 0)::int as duration_seconds
  from previous_sessions ps
  left join previous_page_views pv on pv.session_id = ps.id
  group by ps.id
),
current_metrics as (
  select
    count(*)::int as total_visits,
    coalesce(sum(pageviews), 0)::int as total_pageviews,
    count(*) filter (where pageviews <= 1)::int as bounce_count,
    coalesce(sum(duration_seconds), 0)::int as total_duration
  from current_page_views_by_session
),
previous_metrics as (
  select
    count(*)::int as total_visits,
    coalesce(sum(pageviews), 0)::int as total_pageviews,
    count(*) filter (where pageviews <= 1)::int as bounce_count,
    coalesce(sum(duration_seconds), 0)::int as total_duration
  from previous_page_views_by_session
),
page_view_totals as (
  select greatest(count(*), 1)::numeric as total from current_page_views
),
session_totals as (
  select greatest(count(*), 1)::numeric as total from current_sessions
),
top_pages as (
  select coalesce(
    jsonb_agg(jsonb_build_object('page', page_path, 'count', count, 'percentage', round((count::numeric / (select total from page_view_totals)) * 100, 1)) order by count desc, page_path asc),
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
    jsonb_agg(jsonb_build_object('page', page_path, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, page_path asc),
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
    jsonb_agg(jsonb_build_object('page', page_path, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, page_path asc),
    '[]'::jsonb
  ) as data
  from (
    select page_path, count(*)::int as count
    from (
      select distinct on (session_id) session_id, page_path
      from current_page_views
      order by session_id, created_at desc
    ) latest
    group by page_path
  ) grouped
),
countries as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (select country as name, count(*)::int as count from current_sessions where country is not null group by country) grouped
),
regions as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1), 'country', country) order by count desc, name asc), '[]'::jsonb) as data
  from (select region as name, min(country) as country, count(*)::int as count from current_sessions where region is not null group by region) grouped
),
cities as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1), 'country', country) order by count desc, name asc), '[]'::jsonb) as data
  from (select city as name, min(country) as country, count(*)::int as count from current_sessions where city is not null group by city) grouped
),
languages as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (select language as name, count(*)::int as count from current_sessions where language is not null group by language) grouped
),
browsers as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (select browser as name, count(*)::int as count from current_sessions where browser is not null group by browser) grouped
),
os as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (select os as name, count(*)::int as count from current_sessions where os is not null group by os) grouped
),
screen_sizes as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (select screen_size as name, count(*)::int as count from current_sessions where screen_size is not null group by screen_size) grouped
),
channels as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (select coalesce(channel, 'Direct') as name, count(*)::int as count from current_sessions group by coalesce(channel, 'Direct')) grouped
),
sources as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'rawValue', raw_value, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (
    select coalesce(utm_source, referrer_domain, referrer, 'direct') as name, coalesce(utm_source, referrer_domain, referrer, 'direct') as raw_value, count(*)::int as count
    from current_sessions
    group by coalesce(utm_source, referrer_domain, referrer, 'direct')
  ) grouped
),
campaigns as (
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'count', count, 'percentage', round((count::numeric / (select total from session_totals)) * 100, 1)) order by count desc, name asc), '[]'::jsonb) as data
  from (select utm_campaign as name, count(*)::int as count from current_sessions where utm_campaign is not null group by utm_campaign) grouped
)
select jsonb_build_object(
  'countries', countries.data,
  'regions', regions.data,
  'cities', cities.data,
  'languages', languages.data,
  'devices', jsonb_build_object('browsers', browsers.data, 'os', os.data, 'screenSizes', screen_sizes.data),
  'pages', jsonb_build_object('topPages', top_pages.data, 'entryPages', entry_pages.data, 'exitPages', exit_pages.data),
  'sources', jsonb_build_object('channels', channels.data, 'sources', sources.data, 'campaigns', campaigns.data),
  'previousMetrics',
    case
      when p_previous_from is null or p_previous_to is null then null
      else jsonb_build_object(
        'visitors', previous_metrics.total_visits,
        'totalVisits', previous_metrics.total_visits,
        'totalPageviews', previous_metrics.total_pageviews,
        'viewsPerVisit', case when previous_metrics.total_visits > 0 then round(previous_metrics.total_pageviews::numeric / previous_metrics.total_visits, 2) else 0 end,
        'bounceRate', case when previous_metrics.total_visits > 0 then round((previous_metrics.bounce_count::numeric / previous_metrics.total_visits) * 100, 1) else 0 end,
        'avgDuration', case when previous_metrics.total_visits > 0 then round(previous_metrics.total_duration::numeric / previous_metrics.total_visits) else 0 end
      )
    end,
  'metrics', jsonb_build_object(
    'visitors', current_metrics.total_visits,
    'totalVisits', current_metrics.total_visits,
    'totalPageviews', current_metrics.total_pageviews,
    'viewsPerVisit', case when current_metrics.total_visits > 0 then round(current_metrics.total_pageviews::numeric / current_metrics.total_visits, 2) else 0 end,
    'bounceRate', case when current_metrics.total_visits > 0 then round((current_metrics.bounce_count::numeric / current_metrics.total_visits) * 100, 1) else 0 end,
    'avgDuration', case when current_metrics.total_visits > 0 then round(current_metrics.total_duration::numeric / current_metrics.total_visits) else 0 end
  )
)
from countries, regions, cities, languages, browsers, os, screen_sizes, channels, sources, campaigns, top_pages, entry_pages, exit_pages, current_metrics, previous_metrics;
$$;

revoke execute on function public.get_analytics_dashboard(uuid, timestamptz, timestamptz, timestamptz, timestamptz, jsonb)
  from public, anon, authenticated;
grant execute on function public.get_analytics_dashboard(uuid, timestamptz, timestamptz, timestamptz, timestamptz, jsonb)
  to service_role;
