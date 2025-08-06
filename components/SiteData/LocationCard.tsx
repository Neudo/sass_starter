"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Building, Flag, Users, Percent } from "lucide-react";

interface LocationData {
  country: string | null;
  region: string | null;
  city: string | null;
}

interface LocationStats {
  countries: Record<string, number>;
  regions: Record<string, number>;
  cities: Record<string, number>;
}

export function LocationCard({ siteId }: { siteId: string }) {
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

      const { data, error } = await supabase
        .from("sessions")
        .select("country, region, city")
        .eq("site_id", siteId);

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
          stats.countries[session.country] = (stats.countries[session.country] || 0) + 1;
        }

        // Count regions
        if (session.region) {
          const regionKey = session.country ? `${session.region}, ${session.country}` : session.region;
          stats.regions[regionKey] = (stats.regions[regionKey] || 0) + 1;
        }

        // Count cities
        if (session.city) {
          const cityKey = session.region && session.country 
            ? `${session.city}, ${session.region}` 
            : session.city;
          stats.cities[cityKey] = (stats.cities[cityKey] || 0) + 1;
        }
      });

      setLocationStats(stats);
      setLoading(false);
    };

    fetchLocationData();
  }, [siteId]);

  const getCountryFlag = (countryName: string) => {
    // Map country names to ISO codes for flag emojis
    const countryToCode: Record<string, string> = {
      "United States": "🇺🇸",
      "USA": "🇺🇸",
      "US": "🇺🇸",
      "United Kingdom": "🇬🇧",
      "UK": "🇬🇧",
      "France": "🇫🇷",
      "Germany": "🇩🇪",
      "Canada": "🇨🇦",
      "Australia": "🇦🇺",
      "Japan": "🇯🇵",
      "China": "🇨🇳",
      "India": "🇮🇳",
      "Brazil": "🇧🇷",
      "Mexico": "🇲🇽",
      "Spain": "🇪🇸",
      "Italy": "🇮🇹",
      "Netherlands": "🇳🇱",
      "Belgium": "🇧🇪",
      "Switzerland": "🇨🇭",
      "Sweden": "🇸🇪",
      "Norway": "🇳🇴",
      "Denmark": "🇩🇰",
      "Finland": "🇫🇮",
      "Poland": "🇵🇱",
      "Portugal": "🇵🇹",
      "Ireland": "🇮🇪",
      "Austria": "🇦🇹",
      "New Zealand": "🇳🇿",
      "Singapore": "🇸🇬",
      "South Korea": "🇰🇷",
      "Russia": "🇷🇺",
      "South Africa": "🇿🇦",
      "Argentina": "🇦🇷",
      "Chile": "🇨🇱",
      "Colombia": "🇨🇴",
      "Peru": "🇵🇪",
      "Venezuela": "🇻🇪",
      "Egypt": "🇪🇬",
      "Turkey": "🇹🇷",
      "Greece": "🇬🇷",
      "Israel": "🇮🇱",
      "Saudi Arabia": "🇸🇦",
      "UAE": "🇦🇪",
      "Thailand": "🇹🇭",
      "Indonesia": "🇮🇩",
      "Malaysia": "🇲🇾",
      "Philippines": "🇵🇭",
      "Vietnam": "🇻🇳",
      "Pakistan": "🇵🇰",
      "Bangladesh": "🇧🇩",
      "Nigeria": "🇳🇬",
      "Kenya": "🇰🇪",
      "Morocco": "🇲🇦",
      "Tunisia": "🇹🇳",
      "Czech Republic": "🇨🇿",
      "Hungary": "🇭🇺",
      "Romania": "🇷🇴",
      "Bulgaria": "🇧🇬",
      "Croatia": "🇭🇷",
      "Serbia": "🇷🇸",
      "Ukraine": "🇺🇦",
      "Belarus": "🇧🇾",
      "Lithuania": "🇱🇹",
      "Latvia": "🇱🇻",
      "Estonia": "🇪🇪",
      "Slovenia": "🇸🇮",
      "Slovakia": "🇸🇰",
      "Luxembourg": "🇱🇺",
      "Malta": "🇲🇹",
      "Cyprus": "🇨🇾",
      "Iceland": "🇮🇸",
    };

    return countryToCode[countryName] || null;
  };

  const renderStats = (data: Record<string, number>, type: 'country' | 'region' | 'city' = 'country') => {
    const sortedData = Object.entries(data).sort(([, a], [, b]) => b - a);

    const total = Object.values(data).reduce((sum, count) => sum + count, 0);

    if (sortedData.length === 0) {
      return <p className="text-muted-foreground text-sm">No data available</p>;
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-muted-foreground">
            Showing {sortedData.length} {type === 'country' ? 'countries' : type === 'region' ? 'regions' : 'cities'}
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
          const flag = type === 'country' ? getCountryFlag(name) : null;
          
          return (
            <div key={name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2 truncate mr-2">
                  {type === 'country' && flag ? (
                    <span className="text-base">{flag}</span>
                  ) : type === 'country' ? (
                    <Flag className="h-4 w-4 text-muted-foreground" />
                  ) : type === 'region' ? (
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
    return <div className="text-muted-foreground">Loading location data...</div>;
  }

  return (
    <Tabs defaultValue="map" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="map">Map</TabsTrigger>
        <TabsTrigger value="countries">Countries</TabsTrigger>
        <TabsTrigger value="regions">Regions</TabsTrigger>
        <TabsTrigger value="cities">Cities</TabsTrigger>
      </TabsList>
      <TabsContent value="countries" className="mt-4">
        {renderStats(locationStats.countries, 'country')}
      </TabsContent>
      <TabsContent value="regions" className="mt-4">
        {renderStats(locationStats.regions, 'region')}
      </TabsContent>
      <TabsContent value="cities" className="mt-4">
        {renderStats(locationStats.cities, 'city')}
      </TabsContent>
    </Tabs>
  );
}