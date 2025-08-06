"use client";
import React, { memo } from "react";
import {
  ZoomableGroup,
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

interface CountryData {
  [key: string]: number;
}

interface MapChartProps {
  setTooltipContent: (content: string) => void;
  countryData?: CountryData;
}

export const MapChart = ({
  setTooltipContent,
  countryData = {},
}: MapChartProps) => {
  // Calculer le maximum de visiteurs pour le gradient
  const maxVisitors = Math.max(...Object.values(countryData), 1);

  const getCountryFill = (countryName: string): string => {
    const visitors = countryData[countryName] || 0;

    if (visitors === 0) {
      return "#1e293b"; // slate-800 - couleur de base pour les pays sans visiteurs
    }

    // Calculer l'intensité (0 à 1)
    const intensity = visitors / maxVisitors;

    // Générer des couleurs claires basées sur l'intensité
    // Plus de visiteurs = couleur plus claire/vive
    const baseOpacity = 0.4;
    const maxOpacity = 0.9;
    const opacity = baseOpacity + intensity * (maxOpacity - baseOpacity);

    // Utiliser des couleurs cyan/bleu clair pour contraster avec le fond bleu nuit
    return `rgba(103, 232, 249, ${opacity})`; // sky-300 with variable opacity
  };

  return (
    <div
      className="w-full h-96 rounded-lg overflow-hidden"
      style={{ backgroundColor: "#0f172a" }} // slate-900 - fond bleu nuit
    >
      <ComposableMap
        projectionConfig={{
          scale: 140,
          center: [0, 0],
        }}
        width={800}
        height={400}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0f172a", // Même fond bleu nuit
        }}
      >
        <ZoomableGroup>
          <Geographies geography="/features.json">
            {({ geographies }: any) =>
              geographies.map((geo: any) => {
                const name =
                  geo.properties.NAME ||
                  geo.properties.name ||
                  geo.properties.NAME_EN ||
                  "Unknown Country";

                const visitors = countryData[name] || 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      let tooltipContent = name;
                      if (visitors > 0) {
                        tooltipContent += `\n${visitors} visitor${
                          visitors !== 1 ? "s" : ""
                        }`;
                      } else {
                        tooltipContent += `\nNo visitors`;
                      }

                      setTooltipContent(tooltipContent);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    fill={getCountryFill(name)}
                    stroke="#314158" // slate-100 - bordures claires pour la séparation
                    strokeWidth={0.7}
                    style={{
                      default: {
                        outline: "none",
                        transition: "all 0.2s ease-in-out",
                      },
                      hover: {
                        filter: "brightness(1.2)",
                        outline: "none",
                        cursor: "pointer",
                        strokeWidth: 1.2,
                      },
                      pressed: {
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};
