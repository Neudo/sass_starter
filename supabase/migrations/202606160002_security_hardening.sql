alter function public.update_updated_at_column()
  set search_path = public;

alter function public.check_user_limits(uuid)
  set search_path = public;

alter function public.update_page_view_with_timezone(uuid, text)
  set search_path = public;

alter function public.insert_session_with_timezone(uuid, uuid, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text)
  set search_path = public;

alter function public.update_session_with_timezone(uuid, text, text, text, text, text, text, text, text, text, text)
  set search_path = public;

alter function public.update_session_last_seen_with_timezone(uuid, text)
  set search_path = public;

alter function public.refresh_funnel_analytics()
  set search_path = public;

alter function public.trigger_refresh_funnel_analytics()
  set search_path = public;

alter function public.create_free_subscription()
  set search_path = public;

revoke execute on function public.check_user_limits(uuid)
  from public, anon, authenticated;
grant execute on function public.check_user_limits(uuid)
  to service_role;

revoke execute on function public.create_free_subscription()
  from public, anon, authenticated;

drop policy if exists "identified user" on public.sites;
drop policy if exists "Users can view own sites" on public.sites;

create policy "sites_select_owner"
  on public.sites
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "sites_insert_owner"
  on public.sites
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "sites_update_owner"
  on public.sites
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "sites_delete_owner"
  on public.sites
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "User can see own sessiosn" on public.sessions;

create policy "sessions_select_owner_or_public_site"
  on public.sessions
  for select
  to public
  using (
    exists (
      select 1
      from public.sites
      where sites.id = sessions.site_id
        and (
          sites.public_enabled = true
          or sites.user_id = (select auth.uid())
        )
    )
  );

drop policy if exists "Allow anonymous inserts" on public.page_views;
drop policy if exists "All user can see data" on public.page_views;
drop policy if exists "Users can view their site page views" on public.page_views;

create policy "page_views_select_owner_or_public_site"
  on public.page_views
  for select
  to public
  using (
    exists (
      select 1
      from public.sites
      where sites.id = page_views.site_id
        and (
          sites.public_enabled = true
          or sites.user_id = (select auth.uid())
        )
    )
  );

drop policy if exists "Users can manage custom events for their sites" on public.custom_events;

create policy "custom_events_manage_owner"
  on public.custom_events
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.sites
      where sites.id = custom_events.site_id
        and sites.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.sites
      where sites.id = custom_events.site_id
        and sites.user_id = (select auth.uid())
    )
  );

drop policy if exists "Service role can manage all subscriptions" on public.subscriptions;
drop policy if exists "Users can view their own subscription" on public.subscriptions;

create policy "subscriptions_service_role_all"
  on public.subscriptions
  for all
  to service_role
  using (true)
  with check (true);

create policy "subscriptions_select_owner"
  on public.subscriptions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);
