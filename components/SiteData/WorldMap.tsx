"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Mercator } from "@visx/geo";
import * as topojson from "topojson-client";
import { useTheme } from "next-themes";
import { useAnalyticsStore } from "@/lib/stores/analytics";

export const background = "#0f172a";

interface CountryData {
  [key: string]: number;
}

export type GeoMercatorProps = {
  width: number;
  height: number;
  events?: boolean;
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
}: GeoMercatorProps) {
  const [world, setWorld] = useState<{
    type: "FeatureCollection";
    features: FeatureShape[];
  } | null>(null);
  const [tooltip, setTooltip] = useState<{
    content: string;
    x: number;
    y: number;
  } | null>(null);

  const { theme } = useTheme();
  const { addFilter, hasFilter, removeFilter, getAnalyticsData } = useAnalyticsStore();
  const analyticsData = getAnalyticsData();
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

  // Convert analytics data to country data format
  const countryData = useMemo(() => {
    const countryStats: CountryData = {};
    analyticsData.countries.forEach((country) => {
      countryStats[country.name] = country.count;
    });
    return countryStats;
  }, [analyticsData.countries]);

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
