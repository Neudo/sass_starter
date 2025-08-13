"use client";
import ParentSize from "../parentSize";
import WorldMap from "./WorldMap";

export default function WorldMapWrapper({ siteId, dateRange }: { siteId: string; dateRange?: { from: Date; to: Date } | null }) {
  return (
    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px]">
      <ParentSize>
        {({ width, height }) => (
          <WorldMap width={width} height={height} siteId={siteId} dateRange={dateRange} />
        )}
      </ParentSize>
    </div>
  );
}
