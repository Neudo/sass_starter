"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DeviceData {
  browser: string | null;
  browser_version: string | null;
  os: string | null;
  os_version: string | null;
  screen_size: string | null;
}

interface DeviceStats {
  browsers: Record<string, number>;
  os: Record<string, number>;
  screenSizes: Record<string, number>;
}

export function DeviceCard({ siteId }: { siteId: string }) {
  const [deviceStats, setDeviceStats] = useState<DeviceStats>({
    browsers: {},
    os: {},
    screenSizes: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeviceData = async () => {
      const supabase = createClient();

      console.log("siteId -->", siteId);

      const { data, error } = await supabase
        .from("sessions")
        .select("browser, browser_version, os, os_version, screen_size")
        .eq("site_id", siteId);

      if (error) {
        console.error("Error fetching device data:", error);
        setLoading(false);
        return;
      }

      console.log("data -->", data);

      const stats: DeviceStats = {
        browsers: {},
        os: {},
        screenSizes: {},
      };

      data?.forEach((session: DeviceData) => {
        // Count browsers
        if (session.browser) {
          const browserKey = session.browser_version
            ? `${session.browser} ${session.browser_version}`
            : session.browser;
          stats.browsers[browserKey] = (stats.browsers[browserKey] || 0) + 1;
        }

        // Count OS
        if (session.os) {
          const osKey = session.os_version
            ? `${session.os} ${session.os_version}`
            : session.os;
          stats.os[osKey] = (stats.os[osKey] || 0) + 1;
        }

        // Count screen sizes
        if (session.screen_size) {
          stats.screenSizes[session.screen_size] =
            (stats.screenSizes[session.screen_size] || 0) + 1;
        }
      });

      setDeviceStats(stats);
      setLoading(false);
    };

    fetchDeviceData();
  }, [siteId]);

  const renderStats = (data: Record<string, number>) => {
    const sortedData = Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // Show top 10

    const total = Object.values(data).reduce((sum, count) => sum + count, 0);

    if (sortedData.length === 0) {
      return <p className="text-muted-foreground text-sm">No data available</p>;
    }

    return (
      <div className="space-y-3">
        {sortedData.map(([name, count]) => {
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
          return (
            <div key={name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="truncate mr-2">{name}</span>
                <span className="text-muted-foreground">{percentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading device data...</div>;
  }

  return (
    <Tabs defaultValue="browser" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="browser">Browser</TabsTrigger>
        <TabsTrigger value="os">OS</TabsTrigger>
        <TabsTrigger value="screen">Screen Size</TabsTrigger>
      </TabsList>
      <TabsContent value="browser" className="mt-4">
        {renderStats(deviceStats.browsers)}
      </TabsContent>
      <TabsContent value="os" className="mt-4">
        {renderStats(deviceStats.os)}
      </TabsContent>
      <TabsContent value="screen" className="mt-4">
        {renderStats(deviceStats.screenSizes)}
      </TabsContent>
    </Tabs>
  );
}
