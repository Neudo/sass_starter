import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/DashboardClient";

export default async function Page({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  const getSiteId = async (domain: string) => {
    const { data, error } = await createAdminClient()
      .from("sites")
      .select("id")
      .eq("domain", domain);
    if (error) throw error;
    return data?.[0]?.id;
  };

  const getUserSites = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    const { data, error } = await createAdminClient()
      .from("sites")
      .select("id, domain")
      .eq("user_id", user.id);
    
    if (error) throw error;
    return data || [];
  };

  const siteId = await getSiteId(domain);
  const userSites = await getUserSites();

  return (
    <DashboardClient
      siteId={siteId}
      domain={domain}
      userSites={userSites}
    />
  );
}
