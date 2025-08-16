"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity } from "lucide-react";

interface ActiveVisitorsProps {
  siteId: string;
}

export function ActiveVisitors({ siteId }: ActiveVisitorsProps) {
  const [activeCount, setActiveCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveVisitors = async () => {
      const supabase = createClient();

      // Consider visitors active if they were seen in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { error, count } = await supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("site_id", siteId)
        .gte("last_seen", fiveMinutesAgo);

      if (error) {
        console.error("Error fetching active visitors:", error);
        setLoading(false);
        return;
      }

      setActiveCount(count || 0);
      setLoading(false);
    };

    // Initial fetch
    fetchActiveVisitors();

    // Set up interval to refresh every minute (60 seconds)
    const interval = setInterval(fetchActiveVisitors, 60000);

    return () => clearInterval(interval);
  }, [siteId]);

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 px-2 py-4 md:py-4 md:px-6">
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="h-8 w-12 bg-muted animate-pulse rounded" />
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="relative">
            <Users className="h-4 w-4" />
            {}
            <div className="absolute -top-1 -right-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
          </div>
          Current Visitors
          <div className="text-3xl font-bold">{activeCount}</div>
        </div>
      )}
    </Card>
  );
}
