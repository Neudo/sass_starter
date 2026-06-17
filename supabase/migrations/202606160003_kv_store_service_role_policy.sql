create policy "kv_store_service_role_all"
  on public.kv_store_002e42d1
  for all
  to service_role
  using (true)
  with check (true);
