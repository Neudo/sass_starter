"use client";
import React, { useState, useEffect } from "react";
import { MapChart } from "./MapChart";
import { createClient } from "@/lib/supabase/client";

interface CountryData {
  [key: string]: number;
}

interface WorldMapProps {
  siteId: string;
}

export function WorldMap({ siteId }: WorldMapProps) {
  const [content, setContent] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [countryData, setCountryData] = useState<CountryData>({});

  useEffect(() => {
    const fetchCountryData = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("sessions")
        .select("country")
        .eq("site_id", siteId)
        .not("country", "is", null);

      if (error) {
        console.error("Error fetching country data:", error);
        return;
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
  }, [siteId]);

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <div className="relative" onMouseMove={handleMouseMove}>
      <MapChart setTooltipContent={setContent} countryData={countryData} />

      {/* Tooltip personnalisé */}
      {content && (
        <div
          className="fixed z-50 bg-slate-600 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 40,
          }}
        >
          {content.split("\n").map((line, index) => (
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
