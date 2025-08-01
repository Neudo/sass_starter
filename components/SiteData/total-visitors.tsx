import React from "react";
import { createClient } from "@/lib/supabase/client";

export default function TotalVisitors({ siteId }: { siteId: string }) {
  const getTotalVisitors = async (siteId: string) => {
    if (!siteId) return;
    const { count, error } = await createClient()
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("site_id", siteId);

    if (error) throw error;
    return count || 0;
  };
  return (
    <div>
      <div>Total visits : {getTotalVisitors(siteId)}</div>
    </div>
  );
}
