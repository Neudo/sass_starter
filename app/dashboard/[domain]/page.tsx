import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceCard } from "@/components/SiteData/DeviceCard";
import { LocationCard } from "@/components/SiteData/LocationCard";
import { ActiveVisitors } from "@/components/SiteData/ActiveVisitors";
import { AnalyticsMetrics } from "@/components/SiteData/AnalyticsMetrics";
import WorldMap from "@/components/SiteData/WorldMap";

export default async function Page({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;

  const getSiteId = async (domain: string) => {
    const { data, error } = await createAdminClient()
      .from("sites")
      .select("id")
      .eq("domain", domain);
    if (error) throw error;
    return data?.[0]?.id;
  };

  const siteId = await getSiteId(domain);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard for: {domain}</h1>

      <AnalyticsMetrics siteId={siteId} />
      <div className="mt-6">
        <WorldMap width={800} height={450} siteId={siteId} events={true} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActiveVisitors siteId={siteId} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationCard siteId={siteId} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceCard siteId={siteId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
