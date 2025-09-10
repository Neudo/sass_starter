"use client";

import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceCard } from "@/components/SiteData/DeviceCard";
import { LocationCard } from "@/components/SiteData/LocationCard";
import { SourcesCard } from "@/components/SiteData/SourcesCard";
import { TopPagesCard } from "@/components/SiteData/TopPagesCard";
import { AnalyticsMetrics } from "@/components/SiteData/AnalyticsMetrics";
import { WorldMapCard } from "@/components/SiteData/WorldMapCard";
import { SiteSelector } from "@/components/SiteSelector";
import { ActiveVisitors } from "@/components/SiteData/ActiveVisitors";
import { ActiveFilters } from "@/components/SiteData/ActiveFilters";
import { DateFilter, getDateRange } from "@/components/DateFilter";
import { FunnelsAndEventsCard } from "./SiteData/FunnelsAndEventsCard";
import { useAnalyticsStore } from "@/lib/stores/analytics";
import { usePersistedFilters } from "@/hooks/usePersistedFilters";

interface Site {
  id: string;
  domain: string;
}

interface DashboardClientProps {
  siteId: string;
  domain: string;
  userSites: Site[];
  isPublic?: boolean;
}

export function DashboardClient({
  siteId,
  domain,
  userSites,
  isPublic = false,
}: DashboardClientProps) {
  const { filters, setDateRange, isLoaded } = usePersistedFilters(domain);
  const selectedDateRange = filters.dateRange;
  const dateRange = useMemo(
    () => (isLoaded ? getDateRange(selectedDateRange) : null),
    [selectedDateRange, isLoaded]
  );

  const { fetchAllData } = useAnalyticsStore();

  // Load all data when component mounts or parameters change
  // Only fetch after filters are loaded to prevent duplicate requests
  useEffect(() => {
    if (isLoaded && dateRange) {
      fetchAllData(siteId, dateRange, selectedDateRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, dateRange, selectedDateRange, isLoaded]);

  // Don't render until filters are loaded to prevent flash of wrong data
  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4 flex-wrap items-center justify-between">
          {!isPublic && (
            <SiteSelector sites={userSites} currentDomain={domain} />
          )}
          <div className="h-10" /> {/* Placeholder for ActiveVisitors */}
          <div className="h-10 w-40" /> {/* Placeholder for DateFilter */}
        </div>
        {/* Loading skeleton or empty state */}
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 h-64 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap items-center justify-between">
        {!isPublic && <SiteSelector sites={userSites} currentDomain={domain} />}
        <ActiveVisitors
          siteId={siteId}
          onActivateRealtime={() => setDateRange("realtime")}
          isRealtimeActive={selectedDateRange === "realtime"}
        />
        <DateFilter
          selectedRange={selectedDateRange}
          onRangeChange={setDateRange}
        />
      </div>
      <ActiveFilters />
      <AnalyticsMetrics siteId={siteId} dateRangeOption={selectedDateRange} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <WorldMapCard />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationCard />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceCard />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <SourcesCard />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <TopPagesCard />
          </CardContent>
        </Card>
      </div>
      <FunnelsAndEventsCard
        siteId={siteId}
        dateRange={dateRange}
        isRealtimeMode={selectedDateRange === "realtime"}
        isPublic={isPublic}
        domain={domain}
      />
    </div>
  );
}
