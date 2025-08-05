import React from "react";
import { TotalVisitorsDisplay } from "@/hooks/useTotalVisitors";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const siteId = await getSiteId(domain);

  return (
    <div>
      <h1>Dashboard for: {domain}</h1>
      <TotalVisitorsDisplay siteId={siteId} />
    </div>
  );
}
