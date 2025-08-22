"use client";

import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Building, Flag, Users, Percent, Languages } from "lucide-react";
import { getCountryFlag } from "@/data/country-flags";
import { getLanguageName, getLanguageFlag } from "@/lib/language-helper";
import { DetailsModal } from "@/components/ui/details-modal";
import { useAnalyticsStore } from "@/lib/stores/analytics";


interface LocationStats {
  countries: Record<string, number>;
  regions: Record<string, { count: number; country?: string }>;
  cities: Record<string, { count: number; country?: string }>;
  languages: Record<string, { count: number }>;
}

export function LocationCard() {
  const [showPercentage, setShowPercentage] = useState(false);
  const { addFilter, hasFilter, removeFilter, getAnalyticsData, loading } = useAnalyticsStore();
  const analyticsData = getAnalyticsData();

  // Convert analytics data to LocationStats format using useMemo
  const { locationStats, allLocationStats } = useMemo(() => {
    const locationStats: LocationStats = {
      countries: Object.fromEntries(
        analyticsData.countries.slice(0, 7).map(item => [item.name, item.count])
      ),
      regions: Object.fromEntries(
        analyticsData.regions.slice(0, 7).map(item => [
          item.name, 
          { count: item.count, country: item.country }
        ])
      ),
      cities: Object.fromEntries(
        analyticsData.cities.slice(0, 7).map(item => [
          item.name, 
          { count: item.count, country: item.country }
        ])
      ),
      languages: Object.fromEntries(
        analyticsData.languages.slice(0, 7).map(item => [
          item.name, 
          { count: item.count }
        ])
      ),
    };
    
    const allLocationStats: LocationStats = {
      countries: Object.fromEntries(
        analyticsData.countries.map(item => [item.name, item.count])
      ),
      regions: Object.fromEntries(
        analyticsData.regions.map(item => [
          item.name, 
          { count: item.count, country: item.country }
        ])
      ),
      cities: Object.fromEntries(
        analyticsData.cities.map(item => [
          item.name, 
          { count: item.count, country: item.country }
        ])
      ),
      languages: Object.fromEntries(
        analyticsData.languages.map(item => [
          item.name, 
          { count: item.count }
        ])
      ),
    };
    
    return { locationStats, allLocationStats };
  }, [analyticsData.countries, analyticsData.regions, analyticsData.cities, analyticsData.languages]);

  const handleItemClick = (type: "country" | "region" | "city", value: string) => {
    if (hasFilter(type, value)) {
      removeFilter(type, value);
    } else {
      addFilter({ type, value, label: value });
    }
  };

  const renderStats = (
    data:
      | Record<string, number>
      | Record<string, { count: number; country?: string }>,
    type: "country" | "region" | "city" | "language" = "country",
    allData?:
      | Record<string, number>
      | Record<string, { count: number; country?: string }>,
    title?: string
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
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-muted-foreground">
            Showing {sortedData.length}{" "}
            {type === "country"
              ? "countries"
              : type === "region"
              ? "regions"
              : type === "city"
              ? "cities"
              : "languages"}
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
          const count = typeof item === "number" ? item : item.count;
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;

          // Get flag based on type
          let flag = null;
          let displayName = name;

          if (type === "country") {
            flag = getCountryFlag(name);
          } else if (type === "region" || type === "city") {
            // Get country from the data structure
            if (typeof item !== "number" && item.country) {
              flag = getCountryFlag(item.country);
            }
          } else if (type === "language") {
            flag = getLanguageFlag(name);
            displayName = getLanguageName(name);
          }

          const isClickable = type !== "language";
          const isActive = isClickable && hasFilter(type, name);
          
          return (
            <div key={name} className="space-y-1">
              <div 
                className={`flex justify-between items-center text-sm relative ${
                  isClickable ? "cursor-pointer hover:bg-muted/50 rounded transition-all" : ""
                } ${isActive ? "ring-2 ring-primary" : ""}`}
                onClick={() => isClickable && handleItemClick(type, name)}
              >
                <div
                  className="absolute top-0 bottom-0 left-0 dark:bg-gray-500 bg-primary opacity-15 transition-all rounded-l"
                  style={{ width: `${percentage}%` }}
                />
                <div className="flex items-center gap-2 truncate mr-2 p-2">
                  {flag ? (
                    <span className="text-base">{flag}</span>
                  ) : type === "country" ? (
                    <Flag className="h-4 w-4 text-muted-foreground" />
                  ) : type === "region" ? (
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  ) : type === "city" ? (
                    <Building className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Languages className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="truncate text-sm">{displayName}</span>
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
            title={title || `All ${type}s`}
            description={`Showing ${
              Object.keys(allData).length
            } elements total`}
            itemCount={Object.keys(allData).length}
          >
            <div className="space-y-1">
              {Object.entries(allData)
                .sort(([, a], [, b]) => {
                  const aCount = typeof a === "number" ? a : a.count;
                  const bCount = typeof b === "number" ? b : b.count;
                  return bCount - aCount;
                })
                .map(([name, item]) => {
                  const count = typeof item === "number" ? item : item.count;
                  const allTotal = Object.values(allData).reduce(
                    (sum, dataItem) => {
                      const itemCount =
                        typeof dataItem === "number"
                          ? dataItem
                          : dataItem.count;
                      return sum + itemCount;
                    },
                    0
                  );
                  const percentage =
                    allTotal > 0 ? ((count / allTotal) * 100).toFixed(1) : 0;

                  let flag = null;
                  let displayName = name;

                  if (type === "country") {
                    flag = getCountryFlag(name);
                  } else if (type === "region" || type === "city") {
                    if (typeof item !== "number" && item.country) {
                      flag = getCountryFlag(item.country);
                    }
                  } else if (type === "language") {
                    flag = getLanguageFlag(name);
                    displayName = getLanguageName(name);
                  }

                  const isClickable = type !== "language";
                  const isActive = isClickable && hasFilter(type, name);
                  
                  return (
                    <div key={name} className="space-y-1">
                      <div 
                        className={`flex justify-between items-center text-sm relative ${
                          isClickable ? "cursor-pointer hover:bg-muted/50 rounded transition-all" : ""
                        } ${isActive ? "ring-2 ring-primary" : ""}`}
                        onClick={() => isClickable && handleItemClick(type, name)}
                      >
                        <div
                          className="absolute top-0 bottom-0 left-0 dark:bg-gray-500 bg-primary opacity-15 transition-all rounded-l"
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="flex items-center gap-2 truncate mr-2 p-2">
                          {flag ? (
                            <span className="text-base">{flag}</span>
                          ) : type === "country" ? (
                            <Flag className="h-4 w-4 text-muted-foreground" />
                          ) : type === "region" ? (
                            <Globe className="h-4 w-4 text-muted-foreground" />
                          ) : type === "city" ? (
                            <Building className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Languages className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="truncate text-sm">
                            {displayName}
                          </span>
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
    return (
      <div className="text-muted-foreground">Loading location data...</div>
    );
  }

  return (
    <Tabs defaultValue="countries" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="countries">Countries</TabsTrigger>
        <TabsTrigger value="regions">Regions</TabsTrigger>
        <TabsTrigger value="cities">Cities</TabsTrigger>
        <TabsTrigger value="languages">Languages</TabsTrigger>
      </TabsList>
      <TabsContent value="countries" className="mt-4">
        {renderStats(
          locationStats.countries,
          "country",
          allLocationStats.countries,
          "All countries"
        )}
      </TabsContent>
      <TabsContent value="regions" className="mt-4">
        {renderStats(
          locationStats.regions,
          "region",
          allLocationStats.regions,
          "All regions"
        )}
      </TabsContent>
      <TabsContent value="cities" className="mt-4">
        {renderStats(
          locationStats.cities,
          "city",
          allLocationStats.cities,
          "All cities"
        )}
      </TabsContent>
      <TabsContent value="languages" className="mt-4">
        {renderStats(
          locationStats.languages,
          "language",
          allLocationStats.languages,
          "Languages"
        )}
      </TabsContent>
    </Tabs>
  );
}
