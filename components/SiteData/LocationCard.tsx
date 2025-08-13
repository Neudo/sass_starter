"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Building, Flag, Users, Percent } from "lucide-react";
import { getCountryFlag } from "@/data/country-flags";

interface LocationData {
  country: string | null;
  region: string | null;
  city: string | null;
}

interface LocationStats {
  countries: Record<string, number>;
  regions: Record<string, { count: number; country?: string }>;
  cities: Record<string, { count: number; country?: string }>;
}

export function LocationCard({ siteId, dateRange }: { siteId: string; dateRange?: { from: Date; to: Date } | null }) {
  const [locationStats, setLocationStats] = useState<LocationStats>({
    countries: {},
    regions: {},
    cities: {},
  });
  const [loading, setLoading] = useState(true);
  const [showPercentage, setShowPercentage] = useState(false);

  useEffect(() => {
    const fetchLocationData = async () => {
      const supabase = createClient();

      let query = supabase
        .from("sessions")
        .select("country, region, city")
        .eq("site_id", siteId);

      if (dateRange) {
        query = query
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching location data:", error);
        setLoading(false);
        return;
      }

      const stats: LocationStats = {
        countries: {},
        regions: {},
        cities: {},
      };

      data?.forEach((session: LocationData) => {
        // Count countries
        if (session.country) {
          stats.countries[session.country] =
            (stats.countries[session.country] || 0) + 1;
        }

        // Count regions with country info (display only region name)
        if (session.region) {
          const regionKey = session.region;

          if (!stats.regions[regionKey]) {
            stats.regions[regionKey] = {
              count: 0,
              country: session.country || undefined,
            };
          }
          stats.regions[regionKey].count++;
        }

        // Count cities with country info (display only city name)
        if (session.city) {
          const cityKey = session.city;

          if (!stats.cities[cityKey]) {
            stats.cities[cityKey] = {
              count: 0,
              country: session.country || undefined,
            };
          }
          stats.cities[cityKey].count++;
        }
      });

      setLocationStats(stats);
      setLoading(false);
    };

    fetchLocationData();
  }, [siteId, dateRange]);


  const renderStats = (
    data:
      | Record<string, number>
      | Record<string, { count: number; country?: string }>,
    type: "country" | "region" | "city" = "country"
  ) => {
    // Convert data to consistent format for sorting
    const sortedData = Object.entries(data).sort(([, a], [, b]) => {
      const aCount = typeof a === "number" ? a : a.count;
      const bCount = typeof b === "number" ? b : b.count;
      return bCount - aCount;
    });

    const total = Object.values(data).reduce((sum, item) => {
      const count = typeof item === "number" ? item : item.count;
      return sum + count;
    }, 0);

    if (sortedData.length === 0) {
      return <p className="text-muted-foreground text-sm">No data available</p>;
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-muted-foreground">
            Showing {sortedData.length}{" "}
            {type === "country"
              ? "countries"
              : type === "region"
              ? "regions"
              : "cities"}
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
        {sortedData.map(([name, item]) => {
          const count = typeof item === 'number' ? item : item.count;
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
          
          // Get flag based on type
          let flag = null;
          if (type === "country") {
            flag = getCountryFlag(name);
          } else if (type === "region" || type === "city") {
            // Get country from the data structure
            if (typeof item !== 'number' && item.country) {
              flag = getCountryFlag(item.country);
            }
          }

          return (
            <div key={name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2 truncate mr-2">
                  {flag ? (
                    <span className="text-base">{flag}</span>
                  ) : type === "country" ? (
                    <Flag className="h-4 w-4 text-muted-foreground" />
                  ) : type === "region" ? (
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Building className="h-4 w-4 text-muted-foreground" />
                  )}
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
    return (
      <div className="text-muted-foreground">Loading location data...</div>
    );
  }

  return (
    <Tabs defaultValue="countries" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="countries">Countries</TabsTrigger>
        <TabsTrigger value="regions">Regions</TabsTrigger>
        <TabsTrigger value="cities">Cities</TabsTrigger>
      </TabsList>
      <TabsContent value="countries" className="mt-4">
        {renderStats(locationStats.countries, "country")}
      </TabsContent>
      <TabsContent value="regions" className="mt-4">
        {renderStats(locationStats.regions, "region")}
      </TabsContent>
      <TabsContent value="cities" className="mt-4">
        {renderStats(locationStats.cities, "city")}
      </TabsContent>
    </Tabs>
  );
}
