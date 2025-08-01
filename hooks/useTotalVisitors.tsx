"use client";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useTotalVisitors(siteId: string) {
  return useQuery({
    queryKey: ["totalVisitors", siteId],
    queryFn: async () => {
      const { count, error } = await createClient()
        .from("sessions")
        .select("*", { count: "exact", head: true })
        .eq("site_id", siteId);

      if (error) throw error;
      return count || 0;
    },
  });
}

export function TotalVisitorsDisplay({ siteId }: { siteId: string }) {
  const { data: totalVisits, isLoading, error } = useTotalVisitors(siteId);

  if (isLoading) return <p>Loading visitor data...</p>;
  if (error) return <p>Error loading visitor data</p>;

  return <p>Total visits: {totalVisits}</p>;
}
