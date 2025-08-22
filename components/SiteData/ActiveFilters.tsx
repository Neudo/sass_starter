"use client";

import React, { useState } from "react";
import { X, Plus, Filter } from "lucide-react";
import { useAnalyticsStore } from "@/lib/stores/analytics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterModal } from "./FilterModal";

export function ActiveFilters() {
  const { filters, removeFilter, clearFilters } = useAnalyticsStore();
  const [showFilterModal, setShowFilterModal] = useState(false);

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
    <div className="mb-4 p-3 bg-muted/50 rounded-lg min-h-[80px]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters ({filters.length})
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilterModal(true)}
            className="h-7 px-2 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
          {filters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-1">
        {filters.length === 0 ? (
          <div className="text-xs text-muted-foreground py-2">
            No active filters. Click &quot;Add&quot; to filter your data.
          </div>
        ) : (
          <div className="flex gap-2 min-w-max">
            {filters.map((filter, index) => (
              <Badge
                key={`${filter.type}-${filter.value}-${index}`}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors whitespace-nowrap"
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
        )}
      </div>

      <FilterModal
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
      />
    </div>
  );
}
