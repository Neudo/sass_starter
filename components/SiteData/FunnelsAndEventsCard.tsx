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
import { Funnel, Activity } from "lucide-react";

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

  const customEvents = [
    { name: "button_click", count: 145 },
    { name: "form_submit", count: 89 },
    { name: "video_play", count: 67 },
  ];

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
                <div className="text-sm text-muted-foreground">Loading funnels...</div>
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
                    <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
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
                    <div className="p-4 bg-muted/50 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Funnel analysis will be displayed here for:{" "}
                        <span className="font-medium">
                          {funnels.find(f => f.id === selectedFunnel)?.name}
                        </span>
                      </p>
                      {funnels.find(f => f.id === selectedFunnel)?.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {funnels.find(f => f.id === selectedFunnel)?.description}
                        </p>
                      )}
                      {/* Ici on ajoutera le composant d'analyse des funnels */}
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="space-y-4">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground mb-3">
                Custom events tracked on your site
              </div>
              
              <div className="space-y-2">
                {customEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                  >
                    <span className="font-mono text-sm">{event.name}</span>
                    <span className="text-sm font-medium">{event.count}</span>
                  </div>
                ))}
              </div>
              
              {customEvents.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No custom events found</p>
                  <p className="text-xs mt-1">
                    Custom events will appear here once you start tracking them
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}