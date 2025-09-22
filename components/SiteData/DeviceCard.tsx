"use client";

import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Percent,
} from "lucide-react";
import { DetailsModal } from "@/components/ui/details-modal";
import { useAnalyticsStore } from "@/lib/stores/analytics";
import { SkeletonCard } from "./SkeletonCard";
import { getBrowserIcon, getOSIcon, getDeviceIcon } from "@/lib/device-icons";


interface DeviceStats {
  browsers: Record<string, number>;
  os: Record<string, number>;
  screenSizes: Record<string, number>;
}

export function DeviceCard() {
  const [showPercentage, setShowPercentage] = useState(false);
  const { addFilter, hasFilter, removeFilter, getAnalyticsData, loading } = useAnalyticsStore();
  const analyticsData = getAnalyticsData();

  // Convert analytics data to device stats format using useMemo
  const { deviceStats, allDeviceStats } = useMemo(() => {
    const deviceStats: DeviceStats = {
      browsers: Object.fromEntries(
        analyticsData.devices.browsers.slice(0, 7).map(item => [item.name, item.count])
      ),
      os: Object.fromEntries(
        analyticsData.devices.os.slice(0, 7).map(item => [item.name, item.count])
      ),
      screenSizes: Object.fromEntries(
        analyticsData.devices.screenSizes.slice(0, 7).map(item => [item.name, item.count])
      ),
    };
    
    const allDeviceStats: DeviceStats = {
      browsers: Object.fromEntries(
        analyticsData.devices.browsers.map(item => [item.name, item.count])
      ),
      os: Object.fromEntries(
        analyticsData.devices.os.map(item => [item.name, item.count])
      ),
      screenSizes: Object.fromEntries(
        analyticsData.devices.screenSizes.map(item => [item.name, item.count])
      ),
    };
    
    return { deviceStats, allDeviceStats };
  }, [analyticsData.devices]);


  const handleItemClick = (type: "browser" | "os" | "screen_size", value: string) => {
    const filterType = type === "screen_size" ? "screen_size" : type;
    if (hasFilter(filterType, value)) {
      removeFilter(filterType, value);
    } else {
      addFilter({ type: filterType, value, label: value });
    }
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
              : getDeviceIcon(name);
          const filterType = type === "screen" ? "screen_size" : type;
          const isActive = hasFilter(filterType, name);
          
          return (
            <div key={name} className="space-y-1">
              <div 
                className={`flex justify-between items-center text-sm relative cursor-pointer hover:bg-muted/50 rounded transition-all ${
                  isActive ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleItemClick(filterType, name)}
              >
                <div
                  className="absolute top-0 bottom-0 left-0 dark:bg-gray-500 bg-primary opacity-15 transition-all rounded-l"
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
                      : getDeviceIcon(name);

                  const filterType = type === "screen" ? "screen_size" : type;
                  const isActive = hasFilter(filterType, name);
                  
                  return (
                    <div key={name} className="space-y-1">
                      <div 
                        className={`flex justify-between items-center text-sm relative cursor-pointer hover:bg-muted/50 rounded transition-all ${
                          isActive ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => handleItemClick(filterType, name)}
                      >
                        <div
                          className="absolute top-0 bottom-0 left-0 dark:bg-gray-500 bg-primary opacity-15 transition-all rounded-l"
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
    return <SkeletonCard title="Devices" description="Analyze visitor devices and browsers" itemCount={7} />;
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
