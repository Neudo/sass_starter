create policy "sites_select_public_enabled"
  on public.sites
  for select
  to public
  using (public_enabled = true);
