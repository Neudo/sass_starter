"use client";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useUserSites(userId: string) {
  return useQuery({
    queryKey: ["sites", userId],
    queryFn: async () => {
      const supabase = createClient();
      
      // Get sites
      const { data: sites, error: sitesError } = await supabase
        .from("sites")
        .select("*")
        .eq("user_id", userId);

      if (sitesError) throw sitesError;
      if (!sites) return [];

      // Get visitor counts for last 24h for each site
      const sitesWithStats = await Promise.all(
        sites.map(async (site) => {
          const twentyFourHoursAgo = new Date();
          twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

          const { count } = await supabase
            .from("sessions")
            .select("*", { count: "exact", head: true })
            .eq("site_id", site.id)
            .gte("last_seen", twentyFourHoursAgo.toISOString());

          return {
            ...site,
            visitors24h: count || 0,
          };
        })
      );

      return sitesWithStats;
    },
  });
}
