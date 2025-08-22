"use client";
import React, { useEffect, useState } from "react";
import { Mercator } from "@visx/geo";
import * as topojson from "topojson-client";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import { useFilters } from "@/lib/contexts/FilterContext";
import { applyFiltersToQuery, applyClientSideFilters } from "@/lib/filter-utils";

export const background = "#0f172a";

interface CountryData {
  [key: string]: number;
}

export type GeoMercatorProps = {
  width: number;
  height: number;
  events?: boolean;
  siteId: string;
  dateRange?: { from: Date; to: Date } | null;
  dateRangeOption?: string;
};

interface FeatureShape {
  type: "Feature";
  id: string;
  geometry: { coordinates: [number, number][][]; type: "Polygon" };
  properties: { name: string };
}

export default function WorldMap({
  width,
  height,
  siteId,
  dateRange,
  dateRangeOption = "today",
}: GeoMercatorProps) {
  const [world, setWorld] = useState<{
    type: "FeatureCollection";
    features: FeatureShape[];
  } | null>(null);
  const [countryData, setCountryData] = useState<CountryData>({});
  const [tooltip, setTooltip] = useState<{
    content: string;
    x: number;
    y: number;
  } | null>(null);

  const { theme } = useTheme();
  const { addFilter, hasFilter, removeFilter, filters } = useFilters();
  // Charger les données géographiques

  useEffect(() => {
    fetch("/features.json")
      .then((response) => response.json())
      .then((topology) => {
        // features.json contient du TopoJSON, il faut le convertir
        // @ts-expect-error topojson types don't match exactly with our topology structure
        const worldData = topojson.feature(
          topology,
          topology.objects.world
        ) as {
          type: "FeatureCollection";
          features: FeatureShape[];
        };
        setWorld(worldData);
      })
      .catch((error) => {
        console.error("Error loading topology:", error);
      });
  }, []);

  // Charger les données des visiteurs par pays
  useEffect(() => {
    const fetchCountryData = async () => {
      const supabase = createClient();

      const isRealtimeMode = dateRangeOption === "realtime";

      let query = supabase
        .from("sessions")
        .select("country")
        .eq("site_id", siteId)
        .not("country", "is", null);

      if (isRealtimeMode) {
        // For realtime: get sessions active in last 30 minutes (based on last_seen)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        query = query.gte("last_seen", thirtyMinutesAgo);
      } else if (dateRange) {
        // For other modes: filter by creation date
        query = query
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString());
      }

      // Apply active filters
      query = applyFiltersToQuery(query, filters);

      let { data, error } = await query;

      if (error) {
        console.error("Error fetching country data:", error);
        return;
      }

      // Apply client-side filters for complex cases like exit pages
      if (data) {
        data = applyClientSideFilters(data, filters);
      }

      // Compter les visiteurs par pays
      const countryStats: CountryData = {};
      data?.forEach((session) => {
        if (session.country) {
          countryStats[session.country] =
            (countryStats[session.country] || 0) + 1;
        }
      });

      setCountryData(countryStats);
    };

    if (siteId) {
      fetchCountryData();
    }
  }, [siteId, dateRange, dateRangeOption, filters]);

  if (!world) {
    return (
      <div className="flex items-center justify-center text-gray-600">
        Loading map...
      </div>
    );
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const scale = (width / 630) * 100;

  // Calculer le maximum de visiteurs pour le gradient
  const maxVisitors = Math.max(...Object.values(countryData), 1);

  const getCountryFill = (countryName: string): string => {
    const visitors = countryData[countryName] || 0;

    if (visitors === 0) {
      return theme === "dark" ? "#1e293b" : "oklch(98.5% 0.002 247.839)";
    }

    // Calculer l'intensité (0 à 1)
    const intensity = visitors / maxVisitors;

    // Générer des couleurs claires basées sur l'intensité
    const baseOpacity = 0.4;
    const maxOpacity = 0.9;
    const opacity = baseOpacity + intensity * (maxOpacity - baseOpacity);

    // Utiliser des couleurs cyan/bleu clair pour contraster avec le fond bleu nuit
    return theme === "dark"
      ? `rgba(103, 232, 249, ${opacity})`
      : `rgba(61, 157, 189, ${opacity})`;
  };

  const handleMouseEnter = (event: React.MouseEvent, countryName: string) => {
    const visitors = countryData[countryName] || 0;
    let content = countryName;
    if (visitors > 0) {
      content += `\n${visitors} visitor${visitors !== 1 ? "s" : ""}`;
    } else {
      content += `\nNo visitors`;
    }

    setTooltip({
      content,
      x: event.clientX,
      y: event.clientY - 40,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const handleCountryClick = (countryName: string) => {
    const visitors = countryData[countryName] || 0;
    if (visitors > 0) {
      if (hasFilter("country", countryName)) {
        removeFilter("country", countryName);
      } else {
        addFilter({ type: "country", value: countryName, label: countryName });
      }
    }
  };

  return width < 10 ? null : (
    <div className="relative">
      <svg width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={
            theme === "dark" ? "rgb(12 20 37)" : "oklch(93.2% 0.032 255.585)"
          }
          rx={14}
        />
        <Mercator<FeatureShape>
          data={world.features}
          scale={scale}
          translate={[centerX, centerY + 50]}
        >
          {(mercator) => (
            <g>
              {mercator.features.map(({ feature, path }, i) => {
                const countryName =
                  feature.properties.name || feature.id || "Unknown Country";

                const isActive = hasFilter("country", countryName);
                const visitors = countryData[countryName] || 0;

                return (
                  <path
                    key={`map-feature-${i}`}
                    d={path || ""}
                    fill={getCountryFill(countryName)}
                    stroke={isActive ? "#3d9dbd" : "#314158"}
                    strokeWidth={isActive ? 2 : 0.4}
                    style={{
                      cursor: visitors > 0 ? "pointer" : "default",
                      transition: "all 0.2s ease-in-out",
                    }}
                    onMouseEnter={(event) =>
                      handleMouseEnter(event, countryName)
                    }
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleCountryClick(countryName)}
                  />
                );
              })}
            </g>
          )}
        </Mercator>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-slate-600 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y,
          }}
        >
          {tooltip.content.split("\n").map((line, index) => (
            <div
              key={index}
              className={index === 0 ? "font-semibold" : "text-slate-300"}
            >
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
