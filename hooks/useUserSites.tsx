"use client";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useUserSites(userId: string) {
  return useQuery({
    queryKey: ["sites", userId],
    queryFn: async () => {
      const { data, error } = await createClient()
        .from("sites")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      return data;
    },
  });
}
