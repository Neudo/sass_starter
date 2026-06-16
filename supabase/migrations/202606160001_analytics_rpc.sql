alter table public.sessions
  drop constraint if exists sessions_country_required;

create index if not exists idx_sites_user_id
  on public.sites (user_id);

create index if not exists idx_sessions_site_created_at
  on public.sessions (site_id, created_at);

create index if not exists idx_sessions_site_last_seen
  on public.sessions (site_id, last_seen);

create index if not exists idx_page_views_session_created_at
  on public.page_views (session_id, created_at);

create index if not exists idx_page_views_session_entry
  on public.page_views (session_id, entry_page)
  where entry_page = true;

create index if not exists idx_funnels_user_id
  on public.funnels (user_id);

create index if not exists idx_funnels_site_id
  on public.funnels (site_id);

create index if not exists idx_funnel_steps_funnel_id
  on public.funnel_steps (funnel_id);

create index if not exists idx_custom_events_user_id
  on public.custom_events (user_id);

create or replace function public.get_analytics_overview(
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
with current_sessions as (
  select s.id, s.created_at, s.last_seen
  from public.sessions s
  where s.site_id = p_site_id
    and (p_from is null or s.created_at >= p_from)
    and (p_to is null or s.created_at <= p_to)
),
current_page_views as (
  select pv.session_id, pv.duration_seconds
  from public.page_views pv
  where pv.site_id = p_site_id
    and (p_from is null or pv.created_at >= p_from)
    and (p_to is null or pv.created_at <= p_to)
),
current_page_views_by_session as (
  select
    cs.id as session_id,
    count(pv.session_id)::int as pageviews,
    coalesce(sum(least(coalesce(pv.duration_seconds, 0), 1800)), 0)::int as duration_seconds
  from current_sessions cs
  left join current_page_views pv on pv.session_id = cs.id
  group by cs.id
),
current_metrics as (
  select
    count(*)::int as visitors,
    count(*)::int as total_visits,
    coalesce(sum(greatest(pageviews, 1)), 0)::int as total_pageviews,
    coalesce(sum(case when greatest(pageviews, 1) = 1 then 1 else 0 end), 0)::int as bounce_count,
    coalesce(sum(duration_seconds), 0)::int as total_duration
  from current_page_views_by_session
),
previous_sessions as (
  select s.id
  from public.sessions s
  where s.site_id = p_site_id
    and p_previous_from is not null
    and p_previous_to is not null
    and s.created_at >= p_previous_from
    and s.created_at <= p_previous_to
),
previous_page_views as (
  select pv.session_id, pv.duration_seconds
  from public.page_views pv
  where pv.site_id = p_site_id
    and p_previous_from is not null
    and p_previous_to is not null
    and pv.created_at >= p_previous_from
    and pv.created_at <= p_previous_to
),
previous_page_views_by_session as (
  select
    ps.id as session_id,
    count(pv.session_id)::int as pageviews,
    coalesce(sum(least(coalesce(pv.duration_seconds, 0), 1800)), 0)::int as duration_seconds
  from previous_sessions ps
  left join previous_page_views pv on pv.session_id = ps.id
  group by ps.id
),
previous_metrics as (
  select
    count(*)::int as visitors,
    count(*)::int as total_visits,
    coalesce(sum(greatest(pageviews, 1)), 0)::int as total_pageviews,
    coalesce(sum(case when greatest(pageviews, 1) = 1 then 1 else 0 end), 0)::int as bounce_count,
    coalesce(sum(duration_seconds), 0)::int as total_duration
  from previous_page_views_by_session
),
normalized_current as (
  select
    visitors,
    total_visits,
    total_pageviews,
    case when total_visits > 0 then round((total_pageviews::numeric / total_visits), 2) else 0 end as views_per_visit,
    case when total_visits > 0 then round((bounce_count::numeric / total_visits) * 100, 1) else 0 end as bounce_rate,
    case when total_visits > 0 then round(total_duration::numeric / total_visits) else 0 end as avg_duration
  from current_metrics
),
normalized_previous as (
  select
    visitors,
    total_visits,
    total_pageviews,
    case when total_visits > 0 then round((total_pageviews::numeric / total_visits), 2) else 0 end as views_per_visit,
    case when total_visits > 0 then round((bounce_count::numeric / total_visits) * 100, 1) else 0 end as bounce_rate,
    case when total_visits > 0 then round(total_duration::numeric / total_visits) else 0 end as avg_duration
  from previous_metrics
)
select jsonb_build_object(
  'metrics', jsonb_build_object(
    'visitors', nc.visitors,
    'totalVisits', nc.total_visits,
    'totalPageviews', nc.total_pageviews,
    'viewsPerVisit', nc.views_per_visit,
    'bounceRate', nc.bounce_rate,
    'avgDuration', nc.avg_duration
  ),
  'previousMetrics', case
    when p_previous_from is null or p_previous_to is null then null
    else jsonb_build_object(
      'visitors', np.visitors,
      'totalVisits', np.total_visits,
      'totalPageviews', np.total_pageviews,
      'viewsPerVisit', np.views_per_visit,
      'bounceRate', np.bounce_rate,
      'avgDuration', np.avg_duration
    )
  end
)
from normalized_current nc
cross join normalized_previous np;
$$;

revoke execute on function public.get_analytics_overview(uuid, timestamptz, timestamptz, timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function public.get_analytics_overview(uuid, timestamptz, timestamptz, timestamptz, timestamptz)
  to service_role;

create or replace function public.get_analytics_timeseries(
  p_site_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_interval text default 'day'
)
returns table (
  bucket timestamptz,
  visitors int,
  total_visits int,
  total_pageviews int,
  views_per_visit numeric,
  bounce_rate numeric,
  avg_duration int
)
language sql
stable
set search_path = public
as $$
with bounds as (
  select
    p_from as from_at,
    p_to as to_at,
    case
      when p_interval = 'hour' then interval '1 hour'
      when p_interval = 'month' then interval '1 month'
      else interval '1 day'
    end as step,
    case
      when p_interval = 'hour' then 'hour'
      when p_interval = 'month' then 'month'
      else 'day'
    end as trunc_part
),
series as (
  select generate_series(
    date_trunc((select trunc_part from bounds), (select from_at from bounds)),
    date_trunc((select trunc_part from bounds), (select to_at from bounds)),
    (select step from bounds)
  ) as bucket
),
sessions_in_range as (
  select
    s.id,
    date_trunc((select trunc_part from bounds), s.created_at) as bucket
  from public.sessions s
  where s.site_id = p_site_id
    and s.created_at >= p_from
    and s.created_at <= p_to
),
page_views_in_range as (
  select
    pv.session_id,
    pv.duration_seconds
  from public.page_views pv
  where pv.site_id = p_site_id
    and pv.created_at >= p_from
    and pv.created_at <= p_to
),
session_metrics as (
  select
    sr.bucket,
    sr.id,
    count(pv.session_id)::int as pageviews,
    coalesce(sum(least(coalesce(pv.duration_seconds, 0), 1800)), 0)::int as duration_seconds
  from sessions_in_range sr
  left join page_views_in_range pv on pv.session_id = sr.id
  group by sr.bucket, sr.id
),
bucket_metrics as (
  select
    sm.bucket,
    count(*)::int as visitors,
    count(*)::int as total_visits,
    coalesce(sum(greatest(sm.pageviews, 1)), 0)::int as total_pageviews,
    coalesce(sum(case when greatest(sm.pageviews, 1) = 1 then 1 else 0 end), 0)::int as bounces,
    coalesce(sum(sm.duration_seconds), 0)::int as total_duration
  from session_metrics sm
  group by sm.bucket
)
select
  series.bucket,
  coalesce(bucket_metrics.visitors, 0)::int as visitors,
  coalesce(bucket_metrics.total_visits, 0)::int as total_visits,
  coalesce(bucket_metrics.total_pageviews, 0)::int as total_pageviews,
  case
    when coalesce(bucket_metrics.total_visits, 0) > 0
      then round(bucket_metrics.total_pageviews::numeric / bucket_metrics.total_visits, 2)
    else 0
  end as views_per_visit,
  case
    when coalesce(bucket_metrics.total_visits, 0) > 0
      then round((bucket_metrics.bounces::numeric / bucket_metrics.total_visits) * 100)
    else 0
  end as bounce_rate,
  case
    when coalesce(bucket_metrics.total_visits, 0) > 0
      then round(bucket_metrics.total_duration::numeric / bucket_metrics.total_visits)::int
    else 0
  end as avg_duration
from series
left join bucket_metrics on bucket_metrics.bucket = series.bucket
order by series.bucket;
$$;

revoke execute on function public.get_analytics_timeseries(uuid, timestamptz, timestamptz, text)
  from public, anon, authenticated;
grant execute on function public.get_analytics_timeseries(uuid, timestamptz, timestamptz, text)
  to service_role;
