"use client";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useSiteData(siteId: string) {
  return useQuery({
    queryKey: ["site", siteId],
    queryFn: async () => {
      const { data, error } = await createClient()
        .from("sites")
        .select("*")
        .eq("id", siteId);

      if (error) throw error;
      return data;
    },
  });
}
