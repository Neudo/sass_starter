"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceCard } from "@/components/SiteData/DeviceCard";
import { LocationCard } from "@/components/SiteData/LocationCard";
import { SourcesCard } from "@/components/SiteData/SourcesCard";
import { TopPagesCard } from "@/components/SiteData/TopPagesCard";
import { ActiveVisitors } from "@/components/SiteData/ActiveVisitors";
import { AnalyticsMetrics } from "@/components/SiteData/AnalyticsMetrics";
import { SiteSelector } from "@/components/SiteSelector";
import { DateFilter, DateRangeOption, getDateRange } from "@/components/DateFilter";
import WorldMapWrapper from "@/components/SiteData/wordMapWrapper";

interface Site {
  id: string;
  domain: string;
}

interface DashboardClientProps {
  siteId: string;
  domain: string;
  userSites: Site[];
}

export function DashboardClient({ siteId, domain, userSites }: DashboardClientProps) {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>("today");
  const dateRange = getDateRange(selectedDateRange);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SiteSelector sites={userSites} currentDomain={domain} />
        <DateFilter 
          selectedRange={selectedDateRange}
          onRangeChange={setSelectedDateRange}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActiveVisitors siteId={siteId} />
      </div>
      <AnalyticsMetrics siteId={siteId} dateRange={dateRange} dateRangeOption={selectedDateRange} />
      <div className="mt-6">
        <WorldMapWrapper siteId={siteId} dateRange={dateRange} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationCard siteId={siteId} dateRange={dateRange} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceCard siteId={siteId} dateRange={dateRange} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <SourcesCard siteId={siteId} dateRange={dateRange} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <TopPagesCard siteId={siteId} dateRange={dateRange} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}