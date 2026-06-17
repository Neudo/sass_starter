create or replace function public.analytics_channel(
  p_utm_medium text,
  p_utm_source text,
  p_referrer_domain text
)
returns text
language sql
immutable
set search_path = public
as $$
with normalized as (
  select
    lower(nullif(trim(p_utm_medium), '')) as medium,
    lower(nullif(trim(p_utm_source), '')) as source,
    lower(nullif(trim(p_referrer_domain), '')) as referrer
),
classified as (
  select
    medium,
    source,
    referrer,
    coalesce(source, referrer) as source_or_referrer,
    case
      when coalesce(source, referrer) ~ '(google\\.|bing\\.|duckduckgo|ddg\\.|yahoo\\.|baidu\\.|yandex\\.)' then 'search'
      when coalesce(source, referrer) ~ '(twitter|t\\.co|x\\.com|facebook|fb\\.|linkedin|instagram|youtube|youtu\\.be|reddit|tiktok|pinterest|snapchat|whatsapp|telegram|discord)' then 'social'
      when coalesce(source, referrer) ~ '(ycombinator|hackernews|hn\\.algolia|producthunt|medium\\.com|dev\\.to|techcrunch)' then 'news'
      when coalesce(source, referrer) is null then 'direct'
      else 'other'
    end as source_category
  from normalized
)
select
  case
    when medium in ('cpc', 'ppc', 'paidsearch') then 'Paid Search'
    when medium in ('cpv', 'cpa', 'cpp', 'content-text') then 'Other Advertising'
    when medium in ('display', 'cpm', 'banner') then 'Display'
    when medium in ('social', 'social-network', 'social-media', 'sm', 'social network', 'social media') then 'Paid Social'
    when medium = 'video' then 'Video'
    when medium in ('email', 'e-mail', 'e_mail', 'e mail', 'mail') then 'Email'
    when medium = 'affiliate' then 'Affiliates'
    when medium in ('organic', 'referral', 'none') and source_category = 'social' then 'Organic Social'
    when medium in ('organic', 'referral', 'none') and source_category = 'search' then 'Organic Search'
    when medium in ('organic', 'referral', 'none') then 'Referral'
    when source is not null and source_category = 'search' then 'Organic Search'
    when source is not null and source_category = 'social' then 'Organic Social'
    when source is not null then 'Referral'
    when referrer is not null and source_category = 'search' then 'Organic Search'
    when referrer is not null and source_category = 'social' then 'Organic Social'
    when referrer is not null then 'Referral'
    else 'Direct'
  end
from classified;
$$;

revoke execute on function public.analytics_channel(text, text, text)
  from public, anon, authenticated;
grant execute on function public.analytics_channel(text, text, text)
  to service_role;

update public.sessions
set channel = public.analytics_channel(utm_medium, utm_source, referrer_domain)
where channel is distinct from public.analytics_channel(utm_medium, utm_source, referrer_domain);
