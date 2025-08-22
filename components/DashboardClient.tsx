"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceCard } from "@/components/SiteData/DeviceCard";
import { LocationCard } from "@/components/SiteData/LocationCard";
import { SourcesCard } from "@/components/SiteData/SourcesCard";
import { TopPagesCard } from "@/components/SiteData/TopPagesCard";
import { AnalyticsMetrics } from "@/components/SiteData/AnalyticsMetrics";
import { WorldMapCard } from "@/components/SiteData/WorldMapCard";
import { SiteSelector } from "@/components/SiteSelector";
import { ActiveVisitors } from "@/components/SiteData/ActiveVisitors";
import {
  DateFilter,
  DateRangeOption,
  getDateRange,
} from "@/components/DateFilter";
import { FunnelsAndEventsCard } from "./SiteData/FunnelsAndEventsCard";

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
  const [selectedDateRange, setSelectedDateRange] =
    useState<DateRangeOption>("alltime");
  const dateRange = getDateRange(selectedDateRange);


  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap items-center justify-between">
        {!isPublic && <SiteSelector sites={userSites} currentDomain={domain} />}
        <ActiveVisitors siteId={siteId} />
        <DateFilter
          selectedRange={selectedDateRange}
          onRangeChange={setSelectedDateRange}
        />
      </div>
      <AnalyticsMetrics
        siteId={siteId}
        dateRange={dateRange}
        dateRangeOption={selectedDateRange}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <WorldMapCard siteId={siteId} dateRange={dateRange} dateRangeOption={selectedDateRange} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationCard siteId={siteId} dateRange={dateRange} dateRangeOption={selectedDateRange} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceCard siteId={siteId} dateRange={dateRange} dateRangeOption={selectedDateRange} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <SourcesCard siteId={siteId} dateRange={dateRange} dateRangeOption={selectedDateRange} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <TopPagesCard siteId={siteId} dateRange={dateRange} dateRangeOption={selectedDateRange} />
          </CardContent>
        </Card>
      </div>
      <FunnelsAndEventsCard siteId={siteId} dateRange={dateRange} isRealtimeMode={selectedDateRange === "realtime"} />
    </div>
  );
}
