"use client";
import ParentSize from "../parentSize";
import WorldMap from "./WorldMap";

export default function WorldMapWrapper({ siteId, dateRange, dateRangeOption = "today" }: { siteId: string; dateRange?: { from: Date; to: Date } | null; dateRangeOption?: string; }) {
  return (
    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px]">
      <ParentSize>
        {({ width, height }) => (
          <WorldMap width={width} height={height} siteId={siteId} dateRange={dateRange} dateRangeOption={dateRangeOption} />
        )}
      </ParentSize>
    </div>
  );
}
