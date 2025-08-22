"use client";

import React from "react";
import { X } from "lucide-react";
import { useFilters } from "@/lib/contexts/FilterContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ActiveFilters() {
  const { filters, removeFilter, clearFilters } = useFilters();

  if (filters.length === 0) return null;

  const getFilterTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      country: "Country",
      region: "Region",
      city: "City",
      browser: "Browser",
      os: "OS",
      screen_size: "Screen",
      referrer_domain: "Referrer",
      utm_source: "Source",
      utm_medium: "Medium",
      utm_campaign: "Campaign",
      visited_page: "Page",
      entry_page: "Entry",
      exit_page: "Exit",
    };
    return labels[type] || type;
  };

  return (
    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Active Filters</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-7 px-2 text-xs"
        >
          Clear all
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter, index) => (
          <Badge
            key={`${filter.type}-${filter.value}-${index}`}
            variant="secondary"
            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={() => removeFilter(filter.type, filter.value)}
          >
            <span className="mr-1 text-xs opacity-70">
              {getFilterTypeLabel(filter.type)}:
            </span>
            {filter.label || filter.value}
            <X className="ml-1 h-3 w-3" />
          </Badge>
        ))}
      </div>
    </div>
  );
}