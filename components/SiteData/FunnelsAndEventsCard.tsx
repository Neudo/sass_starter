/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Funnel,
  Activity,
  MousePointer,
  ScrollText,
  Eye,
  Send,
} from "lucide-react";
import { FunnelChart } from "./FunnelChart";

interface Funnel {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface FunnelsAndEventsCardProps {
  siteId: string;
  dateRange?: { from: Date; to: Date } | null;
  isRealtimeMode?: boolean;
}

// Helper function to get event icon
const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case "click":
      return <MousePointer className="h-4 w-4" />;
    case "scroll":
      return <ScrollText className="h-4 w-4" />;
    case "page_view":
      return <Eye className="h-4 w-4" />;
    case "form_submit":
      return <Send className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

export function FunnelsAndEventsCard({
  siteId,
  dateRange,
  isRealtimeMode = false,
}: FunnelsAndEventsCardProps) {
  const [selectedFunnel, setSelectedFunnel] = useState<string>("");
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFunnels = async () => {
      try {
        let url = `/api/funnels?siteId=${siteId}`;

        // Add date filters if provided
        if (dateRange?.from && dateRange?.to) {
          url += `&from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const funnelsData = await response.json();
          // Filter only active funnels and extract basic info
          const activeFunnels = funnelsData
            .filter((funnel: any) => funnel.is_active)
            .map((funnel: any) => ({
              id: funnel.id,
              name: funnel.name,
              description: funnel.description,
              is_active: funnel.is_active,
            }));
          setFunnels(activeFunnels);
        } else {
          console.error("Failed to fetch funnels:", response.status);
        }
      } catch (error) {
        console.error("Error fetching funnels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFunnels();

    // Set up auto-refresh for realtime mode
    let interval: NodeJS.Timeout | null = null;
    if (isRealtimeMode) {
      interval = setInterval(fetchFunnels, 60000); // Refresh every minute
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [siteId, dateRange, isRealtimeMode]);

  const [customEvents, setCustomEvents] = useState<
    Array<{
      id: string;
      name: string;
      count: number;
      event_type: string;
      is_active: boolean;
      source_breakdown: Array<{
        source: string;
        count: number;
        percentage: number;
      }>;
      country_breakdown: Array<{
        country: string;
        count: number;
        percentage: number;
      }>;
    }>
  >([]);
  const [loadingCustomEvents, setLoadingCustomEvents] = useState(true);

  useEffect(() => {
    const fetchCustomEvents = async () => {
      try {
        let url = `/api/custom-events?siteId=${siteId}`;

        // Add realtime parameter or date filters
        if (isRealtimeMode) {
          url += `&realtime=true`;
        } else if (dateRange?.from && dateRange?.to) {
          url += `&from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const events = await response.json();

          const customEventsData = events.map((event: any) => ({
            id: event.id,
            name: event.name,
            count: event.total_triggers || 0,
            event_type: event.event_type,
            is_active: event.is_active,
            source_breakdown: event.source_breakdown || [],
            country_breakdown: event.country_breakdown || [],
          }));
          setCustomEvents(customEventsData);
        }
      } catch (error) {
        console.error("Error fetching custom events:", error);
      } finally {
        setLoadingCustomEvents(false);
      }
    };

    fetchCustomEvents();

    // Set up auto-refresh for realtime mode
    let interval: NodeJS.Timeout | null = null;
    if (isRealtimeMode) {
      interval = setInterval(fetchCustomEvents, 60000); // Refresh every minute
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [siteId, dateRange, isRealtimeMode]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          Analytics Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="funnels" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="funnels" className="flex items-center gap-2">
              <Funnel className="h-4 w-4" />
              Funnels
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Custom Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="funnels" className="space-y-4">
            <div className="space-y-3">
              {loading ? (
                <div className="text-sm text-muted-foreground">
                  Loading funnels...
                </div>
              ) : funnels.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Funnel className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No funnels found</p>
                  <p className="text-xs mt-1">
                    Create a funnel to start tracking conversion rates
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Select Funnel
                    </label>
                    <Select
                      value={selectedFunnel}
                      onValueChange={setSelectedFunnel}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Choose a funnel to analyze" />
                      </SelectTrigger>
                      <SelectContent>
                        {funnels.map((funnel) => (
                          <SelectItem key={funnel.id} value={funnel.id}>
                            {funnel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedFunnel && (
                    <div className="space-y-4">
                      <FunnelChart
                        funnelId={selectedFunnel}
                        siteId={siteId}
                        dateRange={dateRange}
                        isRealtimeMode={isRealtimeMode}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground mb-3">
                Active custom events on your site
              </div>

              {loadingCustomEvents ? (
                <div className="text-sm text-muted-foreground">
                  Loading custom events...
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {customEvents
                      .filter((event) => event.is_active)
                      .map((event) => (
                        <div
                          key={event.id}
                          className="space-y-2 p-3 bg-muted/50 rounded-md hover:bg-muted/70 transition-colors"
                        >
                          {/* Event Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-muted-foreground">
                                {getEventIcon(event.event_type)}
                              </div>
                              <div>
                                <div className="font-medium text-sm">
                                  {event.name}
                                </div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {event.event_type.replace("_", " ")}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">
                                {event.count.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                triggers
                              </div>
                            </div>
                          </div>

                          {/* Breakdowns if data exists */}
                          {event.count > 0 && (
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                              {/* Source Breakdown */}
                              {event.source_breakdown.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Top Sources
                                  </p>
                                  {event.source_breakdown
                                    .slice(0, 3)
                                    .map((source) => (
                                      <div
                                        key={source.source}
                                        className="flex justify-between text-xs"
                                      >
                                        <span className="truncate">
                                          {source.source}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {source.percentage}%
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              )}

                              {/* Country Breakdown */}
                              {event.country_breakdown.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Top Countries
                                  </p>
                                  {event.country_breakdown
                                    .slice(0, 3)
                                    .map((country) => (
                                      <div
                                        key={country.country}
                                        className="flex justify-between text-xs"
                                      >
                                        <span className="truncate">
                                          {country.country}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {country.percentage}%
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {customEvents.filter((e) => e.is_active).length === 0 && (
                    <div className="p-4 text-center text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No active custom events</p>
                      <p className="text-xs mt-1">
                        Create and activate custom events in Settings to track
                        user interactions
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
