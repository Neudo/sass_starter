"use client";

import { useEffect, useState } from "react";
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
import { DateFilter } from "@/components/DateFilter";
import { createClient } from "@/lib/supabase/client";
import { FunnelsAndEventsCard } from "./SiteData/FunnelsAndEventsCard";
import { UserJourney } from "@/components/SiteData/UserJourney";
import { useAnalyticsStore } from "@/lib/stores/analytics";
import { usePersistedFilters } from "@/hooks/usePersistedFilters";
import { RefreshCw, BarChart3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDateRange } from "@/components/DateFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [siteTimezone, setSiteTimezone] = useState<string>("UTC");
  const [timezoneLoaded, setTimezoneLoaded] = useState(false);
  const supabase = createClient();

  const { fetchAllData, loading } = useAnalyticsStore();
  
  // Calculate dateRange based on selectedDateRange and timezone
  const calculatedDateRange = selectedDateRange === "realtime" 
    ? null 
    : getDateRange(selectedDateRange, siteTimezone);

  // Load site timezone
  useEffect(() => {
    const loadSiteTimezone = async () => {
      try {
        const { data, error } = await supabase
          .from("sites")
          .select("timezone")
          .eq("domain", domain)
          .single();

        if (!error && data?.timezone) {
          setSiteTimezone(data.timezone);
        }
      } catch (error) {
        console.warn("Could not load site timezone:", error);
      } finally {
        setTimezoneLoaded(true);
      }
    };

    loadSiteTimezone();
  }, [domain, supabase]);

  // Load all data when component mounts or parameters change
  // Only fetch after both filters and timezone are loaded
  useEffect(() => {
    if (isLoaded && timezoneLoaded) {
      fetchAllData(siteId, selectedDateRange, siteTimezone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, selectedDateRange, siteTimezone, isLoaded, timezoneLoaded]);

  // Handle manual refresh
  const handleRefresh = async () => {
    await fetchAllData(siteId, selectedDateRange, siteTimezone);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap items-center justify-between">
        {!isPublic && <SiteSelector sites={userSites} currentDomain={domain} />}
        <ActiveVisitors
          siteId={siteId}
          onActivateRealtime={() => setDateRange("realtime")}
          isRealtimeActive={selectedDateRange === "realtime"}
        />
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <DateFilter
            selectedRange={selectedDateRange}
            onRangeChange={setDateRange}
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-fit grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="journey" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users Journey
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
            dateRange={calculatedDateRange}
            isRealtimeMode={selectedDateRange === "realtime"}
            isPublic={isPublic}
            domain={domain}
          />
        </TabsContent>

        <TabsContent value="journey" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users Journey
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserJourney
                siteId={siteId}
                dateRange={calculatedDateRange}
                isRealtimeMode={selectedDateRange === "realtime"}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
