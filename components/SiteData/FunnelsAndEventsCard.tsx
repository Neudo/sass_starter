"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
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
}

export function FunnelsAndEventsCard({ siteId }: FunnelsAndEventsCardProps) {
  const [selectedFunnel, setSelectedFunnel] = useState<string>("");
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFunnels = async () => {
      const supabase = createClient();

      const { data: funnelsData } = await supabase
        .from("funnels")
        .select("id, name, description, is_active")
        .eq("site_id", siteId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (funnelsData) {
        setFunnels(funnelsData);
      }

      setLoading(false);
    };

    fetchFunnels();
  }, [siteId]);

  const [customEvents, setCustomEvents] = useState<
    Array<{
      id: string;
      name: string;
      count: number;
      event_type: string;
      is_active: boolean;
    }>
  >([]);
  const [loadingCustomEvents, setLoadingCustomEvents] = useState(true);

  useEffect(() => {
    const fetchCustomEvents = async () => {
      try {
        const response = await fetch(`/api/custom-events?siteId=${siteId}`);
        if (response.ok) {
          const events = await response.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const customEventsData = events.map((event: any) => ({
            id: event.id,
            name: event.name,
            count: event.total_triggers || 0,
            event_type: event.event_type,
            is_active: event.is_active,
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
  }, [siteId]);

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
                      <div className="p-3 bg-muted/30 rounded-md">
                        <h4 className="font-medium text-sm">
                          {funnels.find((f) => f.id === selectedFunnel)?.name}
                        </h4>
                        {funnels.find((f) => f.id === selectedFunnel)
                          ?.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {
                              funnels.find((f) => f.id === selectedFunnel)
                                ?.description
                            }
                          </p>
                        )}
                      </div>
                      <FunnelChart funnelId={selectedFunnel} siteId={siteId} />
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
                      .map((event) => {
                        const getEventIcon = () => {
                          switch (event.event_type) {
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

                        return (
                          <div
                            key={event.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted/70 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-muted-foreground">
                                {getEventIcon()}
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
                        );
                      })}
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
