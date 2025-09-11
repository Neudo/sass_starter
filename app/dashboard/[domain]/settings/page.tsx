"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIMEZONES } from "@/lib/constants/timezones";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface SiteData {
  domain: string;
  timezone: string;
}

export default function GeneralSettingsPage() {
  const params = useParams();
  const domain = params.domain as string;

  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [selectedTimezone, setSelectedTimezone] = useState("UTC");
  const [openTimezoneCombobox, setOpenTimezoneCombobox] = useState(false);
  const [timezoneSearchQuery, setTimezoneSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // Load site data on mount
  useEffect(() => {
    const loadSiteData = async () => {
      try {
        const { data, error } = await supabase
          .from("sites")
          .select("domain, timezone")
          .eq("domain", domain)
          .single();

        if (error) {
          console.error("Error loading site data:", error);
          toast.error("Failed to load site data");
          return;
        }

        setSiteData(data);
        setSelectedTimezone(data.timezone || "UTC");
      } catch (error) {
        console.error("Error loading site data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (domain) {
      loadSiteData();
    }
  }, [domain, supabase]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenTimezoneCombobox(false);
      }
    };

    if (openTimezoneCombobox) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openTimezoneCombobox]);

  // Filter timezones based on search query
  const filteredTimezones = useMemo(() => {
    if (!timezoneSearchQuery) return TIMEZONES;

    return TIMEZONES.filter(
      (timezone) =>
        timezone.label
          .toLowerCase()
          .includes(timezoneSearchQuery.toLowerCase()) ||
        timezone.value.toLowerCase().includes(timezoneSearchQuery.toLowerCase())
    );
  }, [timezoneSearchQuery]);

  // Handle timezone change and update database
  const handleTimezoneChange = async (newTimezone: string) => {
    const oldTimezone = selectedTimezone;
    setSelectedTimezone(newTimezone);
    setOpenTimezoneCombobox(false);
    setTimezoneSearchQuery("");

    try {
      const { error } = await supabase
        .from("sites")
        .update({ timezone: newTimezone })
        .eq("domain", domain);

      if (error) {
        // Revert on error
        setSelectedTimezone(oldTimezone);
        console.error("Error updating timezone:", error);
        toast.error("Failed to update timezone");
        return;
      }

      toast.success("Timezone updated successfully");
    } catch (error) {
      // Revert on error
      setSelectedTimezone(oldTimezone);
      console.error("Error updating timezone:", error);
      toast.error("Failed to update timezone");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
          <CardDescription>
            Basic information about your tracked website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              type="text"
              disabled
              className="bg-muted"
              value={isLoading ? "Loading..." : siteData?.domain || domain}
            />
          </div>

          <div className="space-y-2 relative" ref={dropdownRef}>
            <Label htmlFor="timezone">Site Timezone</Label>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openTimezoneCombobox}
              className="w-full justify-between"
              onClick={() => setOpenTimezoneCombobox(!openTimezoneCombobox)}
            >
              {selectedTimezone ? (
                <span className="truncate">
                  {TIMEZONES.find((tz) => tz.value === selectedTimezone)
                    ?.label || selectedTimezone}
                </span>
              ) : (
                "Select timezone..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {/* Custom Dropdown */}
            {openTimezoneCombobox && (
              <div className="absolute top-full mt-1 w-full bg-popover border rounded-md shadow-lg z-50">
                <div className="p-2">
                  <Input
                    placeholder="Search timezone..."
                    value={timezoneSearchQuery}
                    onChange={(e) => setTimezoneSearchQuery(e.target.value)}
                    className="mb-2"
                    autoFocus
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {filteredTimezones.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No results found.
                      </div>
                    ) : (
                      filteredTimezones.map((timezone) => (
                        <div
                          key={timezone.value}
                          className="flex items-center p-2 cursor-pointer hover:bg-accent rounded-sm"
                          onClick={() => handleTimezoneChange(timezone.value)}
                        >
                          <Check
                            className={cn(
                              "h-4 w-4 mr-2",
                              selectedTimezone === timezone.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <span className="truncate">{timezone.label}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              This ensures your analytics filters (Today, Yesterday, etc.) are
              accurate
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracking Code</CardTitle>
          <CardDescription>
            Add this tracking code to your website to start collecting data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>HTML Tracking Code</Label>
            <div className="p-4 bg-muted rounded-lg font-mono text-sm">
              {`<script defer src="https://www.hectoranalytics.com/js/script.js"></script>`}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Copy Code</Button>
            <Button variant="outline">Download</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
          <CardDescription>
            Configure how long your analytics data is stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Plan: 3 years retention</Label>
            <p className="text-sm text-muted-foreground">
              Your analytics data will be automatically deleted after 3 years
            </p>
          </div>

          <Button variant="outline">Upgrade Plan</Button>
        </CardContent>
      </Card>
    </div>
  );
}
