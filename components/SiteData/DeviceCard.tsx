"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Chrome,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Apple,
  MonitorSmartphone,
  Users,
  Percent,
} from "lucide-react";

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
  const [showPercentage, setShowPercentage] = useState(false);

  useEffect(() => {
    const fetchDeviceData = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("sessions")
        .select("browser, browser_version, os, os_version, screen_size")
        .eq("site_id", siteId);

      if (error) {
        console.error("Error fetching device data:", error);
        setLoading(false);
        return;
      }

      const stats: DeviceStats = {
        browsers: {},
        os: {},
        screenSizes: {},
      };

      data?.forEach((session: DeviceData) => {
        // Count browsers - group all versions together
        if (session.browser) {
          // Use only the browser name, ignore version
          const browserKey = session.browser;
          stats.browsers[browserKey] = (stats.browsers[browserKey] || 0) + 1;
        }

        // Count OS - group all versions together
        if (session.os) {
          // Use only the OS name, ignore version
          const osKey = session.os;
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

  const getBrowserIcon = (browserName: string) => {
    const name = browserName.toLowerCase();
    if (name.includes("chrome")) return <Chrome className="h-4 w-4" />;
    if (name.includes("firefox"))
      return <Globe className="h-4 w-4 text-orange-500" />;
    if (name.includes("safari"))
      return <Globe className="h-4 w-4 text-blue-500" />;
    if (name.includes("edge"))
      return <Globe className="h-4 w-4 text-blue-600" />;
    if (name.includes("opera"))
      return <Globe className="h-4 w-4 text-red-500" />;
    return <Globe className="h-4 w-4 text-muted-foreground" />;
  };

  const getOSIcon = (osName: string) => {
    const name = osName.toLowerCase();
    if (name.includes("windows")) return <Monitor className="h-4 w-4" />;
    if (name.includes("mac")) return <Apple className="h-4 w-4" />;
    if (name.includes("ios") || name.includes("iphone"))
      return <Smartphone className="h-4 w-4" />;
    if (name.includes("android"))
      return <Smartphone className="h-4 w-4 text-green-500" />;
    if (name.includes("linux"))
      return <Monitor className="h-4 w-4 text-yellow-600" />;
    return <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />;
  };

  const getScreenIcon = (screenSize: string) => {
    const size = screenSize.toLowerCase();
    if (size.includes("mobile")) return <Smartphone className="h-4 w-4" />;
    if (size.includes("tablet")) return <Tablet className="h-4 w-4" />;
    if (size.includes("desktop")) return <Monitor className="h-4 w-4" />;
    return <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />;
  };

  const renderStats = (
    data: Record<string, number>,
    type: "browser" | "os" | "screen" = "browser"
  ) => {
    const sortedData = Object.entries(data).sort(([, a], [, b]) => b - a);

    const total = Object.values(data).reduce((sum, count) => sum + count, 0);

    if (sortedData.length === 0) {
      return <p className="text-muted-foreground text-sm">No data available</p>;
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-muted-foreground">
            Showing {sortedData.length} item{sortedData.length !== 1 ? "s" : ""}
          </div>
          <button
            onClick={() => setShowPercentage(!showPercentage)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border rounded cursor-pointer"
            title="Click to toggle between visitors and percentage"
          >
            {showPercentage ? (
              <>
                <Percent className="h-3 w-3" />
                <span>Percentage</span>
              </>
            ) : (
              <>
                <Users className="h-3 w-3" />
                <span>Visitors</span>
              </>
            )}
          </button>
        </div>
        {sortedData.map(([name, count]) => {
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
          const icon =
            type === "browser"
              ? getBrowserIcon(name)
              : type === "os"
              ? getOSIcon(name)
              : getScreenIcon(name);
          return (
            <div key={name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2 truncate mr-2">
                  {icon}
                  <span className="truncate">{name}</span>
                </div>
                <span className="text-muted-foreground font-medium">
                  {showPercentage ? `${percentage}%` : count.toLocaleString()}
                </span>
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
        {renderStats(deviceStats.browsers, "browser")}
      </TabsContent>
      <TabsContent value="os" className="mt-4">
        {renderStats(deviceStats.os, "os")}
      </TabsContent>
      <TabsContent value="screen" className="mt-4">
        {renderStats(deviceStats.screenSizes, "screen")}
      </TabsContent>
    </Tabs>
  );
}
