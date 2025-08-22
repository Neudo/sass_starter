"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Globe,
  Monitor,
  FileText,
  Link,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalyticsStore, FilterType } from "@/lib/stores/analytics";
import { getCountryFlag } from "@/data/country-flags";

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
}

export function FilterModal({ open, onClose }: FilterModalProps) {
  const { getAnalyticsData, addFilter, hasFilter } = useAnalyticsStore();
  const [activeTab, setActiveTab] = useState("location");
  const [selectedFilterType, setSelectedFilterType] = useState<FilterType | "">(
    ""
  );
  const [selectedOperator, setSelectedOperator] = useState<"is" | "is not">(
    "is"
  );
  const [selectedValue, setSelectedValue] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const analyticsData = getAnalyticsData();

  const filterCategories = useMemo(() => {
    return {
      location: {
        label: "Location",
        icon: Globe,
        filterTypes: [
          {
            type: "country" as FilterType,
            label: "Country",
            data: analyticsData.countries.map((item) => ({
              value: item.name,
              label: item.name,
              count: item.count,
              icon: getCountryFlag(item.name),
            })),
          },
          {
            type: "region" as FilterType,
            label: "Region",
            data: analyticsData.regions.map((item) => ({
              value: item.name,
              label: item.name,
              count: item.count,
              icon: item.country ? getCountryFlag(item.country) : null,
            })),
          },
          {
            type: "city" as FilterType,
            label: "City",
            data: analyticsData.cities.map((item) => ({
              value: item.name,
              label: item.name,
              count: item.count,
              icon: item.country ? getCountryFlag(item.country) : null,
            })),
          },
        ],
      },
      devices: {
        label: "Devices",
        icon: Monitor,
        filterTypes: [
          {
            type: "browser" as FilterType,
            label: "Browser",
            data: analyticsData.devices.browsers.map((item) => ({
              value: item.name,
              label: item.name,
              count: item.count,
              icon: null,
            })),
          },
          {
            type: "os" as FilterType,
            label: "Operating System",
            data: analyticsData.devices.os.map((item) => ({
              value: item.name,
              label: item.name,
              count: item.count,
              icon: null,
            })),
          },
          {
            type: "screen_size" as FilterType,
            label: "Screen Size",
            data: analyticsData.devices.screenSizes.map((item) => ({
              value: item.name,
              label: item.name,
              count: item.count,
              icon: null,
            })),
          },
        ],
      },
      pages: {
        label: "Pages",
        icon: FileText,
        filterTypes: [
          {
            type: "visited_page" as FilterType,
            label: "Visited Page",
            data: analyticsData.pages.topPages.map((item) => ({
              value: item.page,
              label: item.page,
              count: item.count,
              icon: null,
            })),
          },
          {
            type: "entry_page" as FilterType,
            label: "Entry Page",
            data: analyticsData.pages.entryPages.map((item) => ({
              value: item.page,
              label: item.page,
              count: item.count,
              icon: null,
            })),
          },
          {
            type: "exit_page" as FilterType,
            label: "Exit Page",
            data: analyticsData.pages.exitPages.map((item) => ({
              value: item.page,
              label: item.page,
              count: item.count,
              icon: null,
            })),
          },
        ],
      },
      sources: {
        label: "Sources",
        icon: Link,
        filterTypes: [
          {
            type: "utm_source" as FilterType,
            label: "UTM Source",
            data: analyticsData.sources.sources
              .filter((item) => item.rawValue && item.rawValue !== "direct")
              .map((item) => ({
                value: item.rawValue!,
                label: item.name,
                count: item.count,
                icon: null,
              })),
          },
          {
            type: "utm_medium" as FilterType,
            label: "UTM Medium",
            data: [], // Will be populated if we track UTM mediums
          },
          {
            type: "utm_campaign" as FilterType,
            label: "UTM Campaign",
            data: [], // Will be populated if we track UTM campaigns
          },
          {
            type: "referrer_domain" as FilterType,
            label: "Referrer Domain",
            data: analyticsData.sources.sources
              .filter(
                (item) => item.rawValue && !item.rawValue.startsWith("utm_")
              )
              .map((item) => ({
                value: item.rawValue!,
                label: item.name,
                count: item.count,
                icon: null,
              })),
          },
        ],
      },
    };
  }, [analyticsData]);

  // Get available data for the selected filter type
  const availableData = useMemo(() => {
    if (!selectedFilterType) return [];

    for (const category of Object.values(filterCategories)) {
      const filterType = category.filterTypes.find(
        (ft) => ft.type === selectedFilterType
      );
      if (filterType) {
        return filterType.data;
      }
    }
    return [];
  }, [selectedFilterType, filterCategories]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return availableData;
    
    return availableData.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableData, searchQuery]);

  // Reset values when tab or filter type changes
  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
    setSelectedFilterType("");
    setSelectedValue("");
    setSearchQuery("");
  };

  const handleFilterTypeChange = (filterType: FilterType) => {
    setSelectedFilterType(filterType);
    setSelectedValue("");
    setSearchQuery("");
  };

  const handleAddFilter = () => {
    if (!selectedFilterType || !selectedValue) return;

    const selectedItem = availableData.find(
      (item) => item.value === selectedValue
    );
    const label = selectedItem?.label || selectedValue;

    if (!hasFilter(selectedFilterType, selectedValue)) {
      addFilter({
        type: selectedFilterType,
        value: selectedValue,
        label: selectedOperator === "is not" ? `NOT ${label}` : label,
      });

      // Reset form
      setSelectedValue("");
      setOpenCombobox(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Filter</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(filterCategories).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(filterCategories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="mt-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Filter Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="filter-type">Filter Type</Label>
                  <Select
                    value={selectedFilterType}
                    onValueChange={(value) =>
                      handleFilterTypeChange(value as FilterType)
                    }
                  >
                    <SelectTrigger id="filter-type">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {category.filterTypes.map((filterType) => (
                        <SelectItem
                          key={filterType.type}
                          value={filterType.type}
                          disabled={filterType.data.length === 0}
                        >
                          {filterType.label}
                          {filterType.data.length === 0 && " (no data)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Operator Selection */}
                <div className="space-y-2">
                  <Label htmlFor="operator">Condition</Label>
                  <Select
                    value={selectedOperator}
                    onValueChange={(value) =>
                      setSelectedOperator(value as "is" | "is not")
                    }
                  >
                    <SelectTrigger id="operator">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="is">is</SelectItem>
                      <SelectItem value="is not">is not</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Value Selection with Autocomplete */}
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className="w-full justify-between"
                        disabled={
                          !selectedFilterType || availableData.length === 0
                        }
                      >
                        {selectedValue ? (
                          <div className="flex items-center gap-2">
                            {availableData.find(
                              (item) => item.value === selectedValue
                            )?.icon && (
                              <span className="text-sm">
                                {
                                  availableData.find(
                                    (item) => item.value === selectedValue
                                  )?.icon
                                }
                              </span>
                            )}
                            <span className="truncate">
                              {availableData.find(
                                (item) => item.value === selectedValue
                              )?.label || selectedValue}
                            </span>
                          </div>
                        ) : (
                          "Select value..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0 z-[60]">
                      <div className="p-2">
                        <Input
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="mb-2"
                        />
                        <div className="max-h-60 overflow-y-auto">
                          {filteredData.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              No results found.
                            </div>
                          ) : (
                            filteredData.map((item) => (
                              <div
                                key={item.value}
                                className="flex items-center justify-between p-2 cursor-pointer hover:bg-accent rounded-sm"
                                onClick={() => {
                                  setSelectedValue(item.value);
                                  setOpenCombobox(false);
                                  setSearchQuery("");
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <Check
                                    className={cn(
                                      "h-4 w-4",
                                      selectedValue === item.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {item.icon && (
                                    <span className="text-sm">{item.icon}</span>
                                  )}
                                  <span className="truncate">{item.label}</span>
                                </div>
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({item.count})
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Add Button */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleAddFilter}
                  disabled={
                    !selectedFilterType ||
                    !selectedValue ||
                    hasFilter(selectedFilterType, selectedValue)
                  }
                >
                  Add Filter
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
