"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { normalizeReferrer } from "@/lib/referrer-helper";

interface SourceData {
  name: string;
  count: number;
  percentage: number;
}

export function SourcesCard({ siteId }: { siteId: string }) {
  const [channels, setChannels] = useState<SourceData[]>([]);
  const [sources, setSources] = useState<SourceData[]>([]);
  const [campaigns, setCampaigns] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSourceData = async () => {
      const supabase = createClient();

      // Fetch channels data
      const { data: channelsData } = await supabase
        .from("sessions")
        .select("utm_medium")
        .eq("site_id", siteId)
        .not("utm_medium", "is", null);

      // Fetch sources data
      const { data: sourcesData } = await supabase
        .from("sessions")
        .select("utm_source, referrer")
        .eq("site_id", siteId);

      // Fetch campaigns data
      const { data: campaignsData } = await supabase
        .from("sessions")
        .select("utm_campaign")
        .eq("site_id", siteId)
        .not("utm_campaign", "is", null);

      // Process channels
      if (channelsData) {
        const channelCounts = channelsData.reduce(
          (acc: Record<string, number>, item) => {
            const channel = item.utm_medium || "Direct";
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

      // Process campaigns
      if (campaignsData) {
        const campaignCounts = campaignsData.reduce(
          (acc: Record<string, number>, item) => {
            const campaign = item.utm_campaign;
            acc[campaign] = (acc[campaign] || 0) + 1;
            return acc;
          },
          {}
        );

        const total = Object.values(campaignCounts).reduce((a, b) => a + b, 0);
        const processedCampaigns = Object.entries(campaignCounts)
          .map(([name, count]) => ({
            name,
            count,
            percentage: (count / total) * 100,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setCampaigns(processedCampaigns);
      }

      setLoading(false);
    };

    fetchSourceData();
  }, [siteId]);

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
    <Tabs defaultValue="sources" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="sources">Sources</TabsTrigger>
        <TabsTrigger value="channels">Channels</TabsTrigger>
        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
      </TabsList>
      <TabsContent value="channels" className="mt-4">
        {renderList(channels)}
      </TabsContent>
      <TabsContent value="sources" className="mt-4">
        {renderList(sources)}
      </TabsContent>
      <TabsContent value="campaigns" className="mt-4">
        {renderList(campaigns)}
      </TabsContent>
    </Tabs>
  );
}
