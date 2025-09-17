"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsStore } from "@/lib/stores/analytics";

interface ActiveVisitorsProps {
  siteId: string;
  onActivateRealtime?: () => void;
  isRealtimeActive?: boolean;
}

export function ActiveVisitors({
  siteId,
  onActivateRealtime,
  isRealtimeActive = false,
}: ActiveVisitorsProps) {
  const [activeCount, setActiveCount] = useState<number>(0);
  const [localLoading, setLocalLoading] = useState(true);
  const { loading: globalLoading } = useAnalyticsStore();

  // Use global loading state or local loading for initial fetch
  const loading = globalLoading || localLoading;

  const fetchActiveVisitors = async (isManualRefresh = false) => {
    if (!isManualRefresh) {
      setLocalLoading(true);
    }
    const supabase = createClient();

    // Consider visitors active if they were seen in the last 30 minutes (same as realtime mode)
    const thirtyMinutesAgo = new Date(
      Date.now() - 30 * 60 * 1000
    ).toISOString();

    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("browser, os, screen_size, country")
      .eq("site_id", siteId)
      .gte("last_seen", thirtyMinutesAgo);

    if (error) {
      console.error("Error fetching active visitors:", error);
      setLocalLoading(false);
      return;
    }

    // Following Plausible's approach: 1 session = 1 visitor
    // Each session represents a unique visitor
    const visitorCount = sessions?.length || 0;

    setActiveCount(visitorCount);
    setLocalLoading(false);
  };

  useEffect(() => {
    // Initial fetch
    fetchActiveVisitors();

    // Set up interval to refresh every minute (60 seconds)
    const interval = setInterval(fetchActiveVisitors, 60000);

    return () => clearInterval(interval);
  }, [siteId]);

  // React to global loading state for manual refresh
  useEffect(() => {
    if (globalLoading && !localLoading) {
      // Global refresh started, fetch new data
      fetchActiveVisitors(true);
    }
  }, [globalLoading, localLoading]);

  return (
    <Card
      className={`px-2 h-[59px] py-4 md:py-4 md:px-6 transition-all ${
        isRealtimeActive
          ? "bg-gradient-to-br from-primary/30 to-primary/20 border-primary/40 shadow-lg shadow-primary/10"
          : "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20"
      } ${
        onActivateRealtime && !isRealtimeActive
          ? "cursor-pointer hover:from-primary/20 hover:to-primary/10"
          : ""
      }`}
      onClick={!isRealtimeActive ? onActivateRealtime : undefined}
    >
      {loading ? (
        <div className="flex items-center gap-3">
          <div className="relative">
            <Users className="h-4 w-4" />
            <div className="absolute -top-1 -right-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
          </div>
          <Skeleton className="h-6 w-22 hidden sm:block" />
          <Skeleton className="h-8 w-10" />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="relative">
            <Users className="h-4 w-4" />
            <div className="absolute -top-1 -right-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
          </div>
          <span className="hidden sm:block">Current Visitors</span>
          <div className="text-3xl font-bold">{activeCount}</div>
        </div>
      )}
    </Card>
  );
}
