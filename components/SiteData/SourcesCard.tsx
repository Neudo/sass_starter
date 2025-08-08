"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { normalizeReferrer, getChannel } from "@/lib/referrer-helper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SourceData {
  name: string;
  count: number;
  percentage: number;
}

type UTMType = "utm_campaign" | "utm_source" | "utm_medium" | "utm_term" | "utm_content";

// Row shape containing any of the UTM fields; selecting all avoids a union type
type UTMRow = Partial<Record<UTMType, string | null>>;

const UTM_OPTIONS = [
  { value: "utm_medium", label: "UTM Mediums" },
  { value: "utm_source", label: "UTM Sources" },
  { value: "utm_term", label: "UTM Terms" },
  { value: "utm_campaign", label: "UTM Campaigns" },
  { value: "utm_content", label: "UTM Contents" },
];

export function SourcesCard({ siteId }: { siteId: string }) {
  const [channels, setChannels] = useState<SourceData[]>([]);
  const [sources, setSources] = useState<SourceData[]>([]);
  const [campaigns, setCampaigns] = useState<SourceData[]>([]);
  const [selectedUTM, setSelectedUTM] = useState<UTMType>("utm_medium");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSourceData = async () => {
      const supabase = createClient();

      // Fetch all session data to calculate channels dynamically
      const { data: sessionsData } = await supabase
        .from("sessions")
        .select("utm_medium, utm_source, referrer_domain")
        .eq("site_id", siteId);

      // Fetch sources data
      const { data: sourcesData } = await supabase
        .from("sessions")
        .select("utm_source, referrer")
        .eq("site_id", siteId);

      // Fetch UTM data based on selected type
      const { data: utmData } = await supabase
        .from("sessions")
        .select("utm_campaign, utm_source, utm_medium, utm_term, utm_content")
        .eq("site_id", siteId)
        .not(selectedUTM, "is", null);


      // Calculate channels dynamically from existing data
      if (sessionsData) {
        const channelCounts = sessionsData.reduce(
          (acc: Record<string, number>, item) => {
            // Use the same logic as the helper function
            const channel = getChannel(
              item.utm_medium,
              item.utm_source,
              item.referrer_domain
            );
            acc[channel] = (acc[channel] || 0) + 1;
            return acc;
          },
          {}
        );

        const total = Object.values(channelCounts).reduce((a, b) => a + b, 0);
        const processedChannels = Object.entries(channelCounts)
          .map(([name, count]) => ({
            name,
            count,
            percentage: (count / total) * 100,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setChannels(processedChannels);
      }

      // Process sources
      if (sourcesData) {
        const sourceCounts = sourcesData.reduce(
          (acc: Record<string, number>, item) => {
            const rawSource = item.utm_source || item.referrer || "direct";
            // Get the display name for the source
            const sourceInfo = normalizeReferrer(rawSource, !!item.utm_source);
            const displayName = sourceInfo.displayName;
            acc[displayName] = (acc[displayName] || 0) + 1;
            return acc;
          },
          {}
        );

        const total = Object.values(sourceCounts).reduce((a, b) => a + b, 0);
        const processedSources = Object.entries(sourceCounts)
          .map(([name, count]) => ({
            name,
            count,
            percentage: (count / total) * 100,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setSources(processedSources);
      }

      // Process UTM data for campaigns tab
      if (utmData) {
        const utmCounts = utmData.reduce(
          (acc: Record<string, number>, item: UTMRow) => {
            const value = item[selectedUTM];
            if (value) {
              acc[value] = (acc[value] || 0) + 1;
            }
            return acc;
          },
          {}
        );

        const total = Object.values(utmCounts).reduce((a, b) => a + b, 0);
        const processedUTM = Object.entries(utmCounts)
          .map(([name, count]) => ({
            name,
            count,
            percentage: (count / total) * 100,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setCampaigns(processedUTM);
      }

      setLoading(false);
    };

    fetchSourceData();
  }, [siteId, selectedUTM]);

  const renderList = (data: SourceData[]) => {
    if (loading) {
      return <div className="text-muted-foreground">Loading...</div>;
    }

    if (data.length === 0) {
      return <div className="text-muted-foreground">No data available</div>;
    }

    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="truncate max-w-[200px]" title={item.name}>
                {item.name}
              </span>
              <span className="text-muted-foreground ml-2">
                {item.count} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <Progress value={item.percentage} className="h-2" />
          </div>
        ))}
      </div>
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
        {renderList(channels)}
      </TabsContent>
      <TabsContent value="sources" className="mt-4">
        {renderList(sources)}
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
        {renderList(campaigns)}
      </TabsContent>
    </Tabs>
  );
}
