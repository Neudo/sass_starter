"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DetailsModal } from "@/components/ui/details-modal";
import { useAnalyticsStore } from "@/lib/stores/analytics";

interface SourceData {
  name: string;
  rawValue?: string; // The actual DB value for filtering
  count: number;
  percentage: number;
}

type UTMType =
  | "utm_campaign"
  | "utm_source"
  | "utm_medium"
  | "utm_term"
  | "utm_content";

const UTM_OPTIONS = [
  { value: "utm_medium", label: "UTM Mediums" },
  { value: "utm_source", label: "UTM Sources" },
  { value: "utm_term", label: "UTM Terms" },
  { value: "utm_campaign", label: "UTM Campaigns" },
  { value: "utm_content", label: "UTM Contents" },
];

const getSourceIcon = (sourceName: string) => {
  const lowerName = sourceName.toLowerCase();

  // Check if it's "direct" traffic (no favicon needed)
  if (lowerName === "direct" || lowerName === "direct traffic") {
    return null;
  }

  // Extract domain for Google Favicon API
  let domain = sourceName;

  // Clean up the source name to extract domain
  if (sourceName.includes(".")) {
    // It's likely a domain - clean it up
    domain = sourceName
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];

    // Special handling for Twitter/X domains
    if (domain === "t.co") {
      domain = "x.com"; // Use X.com for Twitter's URL shortener
    }
  } else {
    // Map common source names to their domains
    const domainMappings: Record<string, string> = {
      google: "google.com",
      facebook: "facebook.com",
      instagram: "instagram.com",
      youtube: "youtube.com",
      linkedin: "linkedin.com",
      reddit: "reddit.com",
      github: "github.com",
      stackoverflow: "stackoverflow.com",
      twitter: "x.com",
      x: "x.com",
      "x (twitter)": "x.com",
      "hacker news": "news.ycombinator.com",
      hackernews: "news.ycombinator.com",
      "product hunt": "producthunt.com",
      producthunt: "producthunt.com",
    };

    domain =
      domainMappings[lowerName] ||
      `${sourceName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
  }

  // Return Google Favicon API URL if we have a valid domain
  if (domain && domain.includes(".")) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
  }

  return null;
};

export function SourcesCard() {
  const [selectedUTM, setSelectedUTM] = useState<UTMType>("utm_medium");
  const [failedIcons, setFailedIcons] = useState<Set<string>>(new Set());
  const { addFilter, hasFilter, removeFilter, getAnalyticsData, loading } =
    useAnalyticsStore();
  const analyticsData = getAnalyticsData();

  // Convert analytics data to SourceData format using useMemo to prevent infinite loops
  const {
    channels,
    sources,
    campaigns,
    allChannels,
    allSources,
    allCampaigns,
  } = useMemo(() => {
    const channels: SourceData[] = analyticsData.sources.channels
      .slice(0, 7)
      .map((item) => ({
        name: item.name,
        count: item.count,
        percentage: item.percentage,
      }));

    const sources: SourceData[] = analyticsData.sources.sources
      .slice(0, 7)
      .map((item) => ({
        name: item.name,
        rawValue: item.rawValue,
        count: item.count,
        percentage: item.percentage,
      }));

    const campaigns: SourceData[] = analyticsData.sources.campaigns
      .slice(0, 7)
      .map((item) => ({
        name: item.name,
        count: item.count,
        percentage: item.percentage,
      }));

    const allChannels: SourceData[] = analyticsData.sources.channels.map(
      (item) => ({
        name: item.name,
        count: item.count,
        percentage: item.percentage,
      })
    );

    const allSources: SourceData[] = analyticsData.sources.sources.map(
      (item) => ({
        name: item.name,
        rawValue: item.rawValue,
        count: item.count,
        percentage: item.percentage,
      })
    );

    const allCampaigns: SourceData[] = analyticsData.sources.campaigns.map(
      (item) => ({
        name: item.name,
        count: item.count,
        percentage: item.percentage,
      })
    );

    return {
      channels,
      sources,
      campaigns,
      allChannels,
      allSources,
      allCampaigns,
    };
  }, [analyticsData.sources]);

  const handleItemClick = (
    type: "referrer_domain" | "utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content",
    value: string
  ) => {
    if (hasFilter(type, value)) {
      removeFilter(type, value);
    } else {
      addFilter({ type, value, label: value });
    }
  };

  const renderList = (
    data: SourceData[],
    showIcons = false,
    allData?: SourceData[],
    title?: string,
    clickType?: "referrer_domain" | "utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content"
  ) => {
    if (loading) {
      return <div className="text-muted-foreground">Loading...</div>;
    }

    if (data.length === 0) {
      return <div className="text-muted-foreground">No data available</div>;
    }

    const renderItems = (items: SourceData[]) => (
      <div className="space-y-1">
        {items.map((item, index) => {
          const icon = showIcons ? getSourceIcon(item.name) : null;
          // Use rawValue for filtering if available, otherwise use name
          const filterValue = item.rawValue || item.name;
          const isActive = clickType && hasFilter(clickType, filterValue);

          return (
            <div key={index} className="space-y-1">
              <div
                className={`flex justify-between items-center text-sm relative ${
                  clickType
                    ? "cursor-pointer hover:bg-muted/50 rounded transition-all"
                    : ""
                } ${isActive ? "ring-2 ring-primary" : ""}`}
                onClick={() =>
                  clickType && handleItemClick(clickType, filterValue)
                }
              >
                <div
                  className="absolute top-0 bottom-0 left-0 dark:bg-gray-500 bg-primary opacity-15 transition-all rounded-l"
                  style={{ width: `${item.percentage}%` }}
                />
                <div className="flex items-center gap-2 truncate max-w-[200px] p-2">
                  {showIcons &&
                    (icon && !failedIcons.has(icon) ? (
                      <Image
                        src={icon}
                        alt={item.name}
                        width={16}
                        height={16}
                        className="flex-shrink-0"
                        onError={() => {
                          setFailedIcons((prev) => new Set([...prev, icon]));
                        }}
                      />
                    ) : (
                      <Globe className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    ))}
                  <span className="truncate text-sm" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <span className="text-muted-foreground ml-2 pr-4">
                  {item.count} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );

    return (
      <>
        {renderItems(data)}
        {allData && allData.length > 0 && (
          <DetailsModal
            title={title || "All elements"}
            description={`Showing ${allData.length} elements total`}
            itemCount={allData.length}
          >
            {renderItems(allData)}
          </DetailsModal>
        )}
      </>
    );
  };

  return (
    <Tabs defaultValue="channels" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="channels">Channels</TabsTrigger>
        <TabsTrigger value="sources">Sources</TabsTrigger>
        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
      </TabsList>
      <TabsContent value="channels" className="mt-4">
        {renderList(channels, false, allChannels, "All channels")}
      </TabsContent>
      <TabsContent value="sources" className="mt-4">
        {renderList(
          sources,
          true,
          allSources,
          "All sources",
          "referrer_domain"
        )}
      </TabsContent>
      <TabsContent value="campaigns" className="mt-4 space-y-4">
        <Select
          value={selectedUTM}
          onValueChange={(value: UTMType) => setSelectedUTM(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UTM_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {renderList(
          campaigns,
          false,
          allCampaigns,
          "All campaigns",
          selectedUTM
        )}
      </TabsContent>
    </Tabs>
  );
}
