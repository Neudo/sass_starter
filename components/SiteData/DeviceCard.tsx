"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Smartphone,
  Monitor,
  Tablet,
  MonitorSmartphone,
  Users,
  Percent,
} from "lucide-react";
import Image from "next/image";
import { DetailsModal } from "@/components/ui/details-modal";

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

export function DeviceCard({
  siteId,
  dateRange,
}: {
  siteId: string;
  dateRange?: { from: Date; to: Date } | null;
}) {
  const [deviceStats, setDeviceStats] = useState<DeviceStats>({
    browsers: {},
    os: {},
    screenSizes: {},
  });
  const [allDeviceStats, setAllDeviceStats] = useState<DeviceStats>({
    browsers: {},
    os: {},
    screenSizes: {},
  });
  const [loading, setLoading] = useState(true);
  const [showPercentage, setShowPercentage] = useState(false);

  useEffect(() => {
    const fetchDeviceData = async () => {
      const supabase = createClient();

      let query = supabase
        .from("sessions")
        .select("browser, browser_version, os, os_version, screen_size")
        .eq("site_id", siteId);

      if (dateRange) {
        query = query
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString());
      }

      const { data, error } = await query;

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

      // Store all data
      setAllDeviceStats(stats);

      // Limit display data to top 10
      const limitedStats: DeviceStats = {
        browsers: Object.fromEntries(
          Object.entries(stats.browsers)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 7)
        ),
        os: Object.fromEntries(
          Object.entries(stats.os)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 7)
        ),
        screenSizes: Object.fromEntries(
          Object.entries(stats.screenSizes)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 7)
        ),
      };

      setDeviceStats(limitedStats);
      setLoading(false);
    };

    fetchDeviceData();
  }, [siteId, dateRange]);

  const getBrowserIcon = (browserName: string) => {
    const name = browserName.toLowerCase();

    // Check for Chrome Headless first (specific case)
    if (name.includes("chrome") && name.includes("headless")) {
      return (
        <Image
          src="/images/browser/chromium-webview.png"
          alt={browserName}
          width={16}
          height={16}
          className="w-4 h-4"
        />
      );
    }

    // Map browser names to image filenames
    const browserImageMap: Record<string, string> = {
      chrome: "chrome.png",
      firefox: "firefox.png",
      safari: "safari.png",
      edge: "edge.png",
      opera: "opera.png",
      brave: "brave.png",
      samsung: "samsung.png",
      "internet explorer": "ie.png",
      ie: "ie.png",
    };

    // Find matching browser
    for (const [browser, filename] of Object.entries(browserImageMap)) {
      if (name.includes(browser)) {
        return (
          <Image
            src={`/images/browser/${filename}`}
            alt={browserName}
            width={16}
            height={16}
            className="w-4 h-4"
          />
        );
      }
    }

    // Default fallback
    return (
      <Image
        src="/images/browser/unknown.png"
        alt={browserName}
        width={16}
        height={16}
        className="w-4 h-4"
      />
    );
  };

  const getOSIcon = (osName: string) => {
    const name = osName.toLowerCase();

    // Map OS names to image filenames
    const osImageMap: Record<string, string> = {
      windows: "windows-11.png",
      mac: "mac-os.png",
      macos: "mac-os.png",
      ios: "ios.png",
      iphone: "ios.png",
      android: "android-os.png",
      linux: "linux.png",
      "chrome os": "chrome-os.png",
      chromeos: "chrome-os.png",
    };

    // Find matching OS
    for (const [os, filename] of Object.entries(osImageMap)) {
      if (name.includes(os)) {
        return (
          <Image
            src={`/images/os/${filename}`}
            alt={osName}
            width={16}
            height={16}
            className="w-4 h-4"
          />
        );
      }
    }

    // Default fallback
    return (
      <Image
        src="/images/os/unknown.png"
        alt={osName}
        width={16}
        height={16}
        className="w-4 h-4"
      />
    );
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
    type: "browser" | "os" | "screen" = "browser",
    allData?: Record<string, number>,
    title?: string
  ) => {
    const sortedData = Object.entries(data).sort(([, a], [, b]) => b - a);

    const total = Object.values(data).reduce((sum, count) => sum + count, 0);

    if (sortedData.length === 0) {
      return <p className="text-muted-foreground text-sm">No data available</p>;
    }

    return (
      <div className="space-y-1">
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
              <div className="flex justify-between items-center text-sm relative">
                <div
                  className="absolute top-0 bottom-0 left-0 dark:bg-gray-500 bg-primary opacity-15 transition-all"
                  style={{ width: `${percentage}%` }}
                />
                <div className="flex items-center gap-2 truncate p-2">
                  {icon}
                  <span className="truncate text-sm">{name}</span>
                </div>
                <span className="text-muted-foreground pr-4 font-medium">
                  {showPercentage ? `${percentage}%` : count.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
        {allData && Object.keys(allData).length > 0 && (
          <DetailsModal
            title={title || `All elements`}
            description={`Showing ${
              Object.keys(allData).length
            } elements total`}
            itemCount={Object.keys(allData).length}
          >
            <div className="space-y-2">
              {Object.entries(allData)
                .sort(([, a], [, b]) => b - a)
                .map(([name, count]) => {
                  const allTotal = Object.values(allData).reduce(
                    (sum, itemCount) => sum + itemCount,
                    0
                  );
                  const percentage =
                    allTotal > 0 ? ((count / allTotal) * 100).toFixed(1) : 0;
                  const icon =
                    type === "browser"
                      ? getBrowserIcon(name)
                      : type === "os"
                      ? getOSIcon(name)
                      : getScreenIcon(name);

                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex justify-between items-center text-sm relative">
                        <div
                          className="absolute top-0 bottom-0 left-0 dark:bg-gray-500 bg-primary opacity-15 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="flex items-center gap-2 truncate mr-2 p-2">
                          {icon}
                          <span className="truncate text-sm">{name}</span>
                        </div>
                        <span className="text-muted-foreground pr-4 font-medium">
                          {showPercentage
                            ? `${percentage}%`
                            : count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </DetailsModal>
        )}
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
        {renderStats(
          deviceStats.browsers,
          "browser",
          allDeviceStats.browsers,
          "All browsers"
        )}
      </TabsContent>
      <TabsContent value="os" className="mt-4">
        {renderStats(
          deviceStats.os,
          "os",
          allDeviceStats.os,
          "All operating systems"
        )}
      </TabsContent>
      <TabsContent value="screen" className="mt-4">
        {renderStats(
          deviceStats.screenSizes,
          "screen",
          allDeviceStats.screenSizes,
          "All screen sizes"
        )}
      </TabsContent>
    </Tabs>
  );
}
