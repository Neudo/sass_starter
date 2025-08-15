"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, MapPin } from "lucide-react";
import WorldMapWrapper from "./wordMapWrapper";

interface WorldMapCardProps {
  siteId: string;
  dateRange?: { from: Date; to: Date } | null;
}

export function WorldMapCard({ siteId, dateRange }: WorldMapCardProps) {
  const [isMapVisible, setIsMapVisible] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">World Map</CardTitle>
        </div>
        <Button
          variant={isMapVisible ? "default" : "outline"}
          size="sm"
          onClick={() => setIsMapVisible(!isMapVisible)}
          className="flex items-center gap-2"
        >
          <Map className="h-4 w-4" />
          {isMapVisible ? "Hide Map" : "Show Map"}
        </Button>
      </CardHeader>
      {isMapVisible && (
        <CardContent className="pt-0">
          <div className="rounded-lg overflow-hidden border">
            <WorldMapWrapper siteId={siteId} dateRange={dateRange} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}