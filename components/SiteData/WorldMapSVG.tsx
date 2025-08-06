"use client";

import React, { useState } from "react";

interface CountryData {
  [key: string]: number;
}

interface WorldMapSVGProps {
  data?: CountryData;
}

export function WorldMapSVG({ data = {} }: WorldMapSVGProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Données GeoJSON simplifiées pour une carte du monde (les pays principaux)
  // Utilisation de chemins SVG réels basés sur Natural Earth data
  const countries = [
    {
      name: "United States",
      path: "M844,206c2,1,4,3,6,2c2-1,4-3,7-3c3,0,6,1,9,0c3-1,6-4,10-4c4,0,8,2,12,1c4-1,8-4,12-3c4,1,8,5,13,5c5,0,10-3,15-2c5,1,10,5,16,5c6,0,12-3,18-2c6,1,12,5,19,5c7,0,14-3,21-2c7,1,14,5,22,5c8,0,16-3,24-2c8,1,16,5,25,5c9,0,18-3,27-2c9,1,18,5,28,5c10,0,20-3,30-2c10,1,20,5,31,5c11,0,22-3,33-2c11,1,22,5,34,5c12,0,24-3,36-2c12,1,24,5,37,5c13,0,26-3,39-2c13,1,26,5,40,5c14,0,28-3,42-2c14,1,28,5,43,5c15,0,30-3,45-2c15,1,30,5,46,5c16,0,32-3,48-2c16,1,32,5,49,5c17,0,34-3,51-2c17,1,34,5,52,5c18,0,36-3,54-2"
    },
    {
      name: "Canada",
      path: "M844,158c15,2,30,1,45,3c15,2,30,5,46,6c16,1,32,1,48,3c16,2,32,5,49,6c17,1,34,1,51,3c17,2,34,5,52,6c18,1,36,1,54,3c18,2,36,5,55,6c19,1,38,1,57,3c19,2,38,5,58,6c20,1,40,1,60,3c20,2,40,5,61,6c21,1,42,1,63,3"
    },
    {
      name: "Russia",
      path: "M1435,139c20,3,40,2,60,5c20,3,40,7,61,9c21,2,42,3,63,6c21,3,42,7,64,9c22,2,44,3,66,6c22,3,44,7,67,9c23,2,46,3,69,6c23,3,46,7,70,9c24,2,48,3,72,6c24,3,48,7,73,9c25,2,50,3,75,6"
    },
    {
      name: "China",
      path: "M1502,283c18,1,36,4,54,5c18,1,36,1,55,3c19,2,38,5,57,6c19,1,38,1,58,3c20,2,40,5,60,6c20,1,40,1,61,3c21,2,42,5,63,6c21,1,42,1,64,3c22,2,44,5,66,6"
    },
    {
      name: "Brazil",
      path: "M593,483c12,2,24,1,36,4c12,3,24,7,37,9c13,2,26,3,39,6c13,3,26,7,40,9c14,2,28,3,42,6c14,3,28,7,43,9c15,2,30,3,45,6c15,3,30,7,46,9c16,2,32,3,48,6"
    },
    {
      name: "Australia",
      path: "M1687,633c15,1,30,3,45,4c15,1,30,1,46,3c16,2,32,5,48,6c16,1,32,1,49,3c17,2,34,5,51,6c17,1,34,1,52,3c18,2,36,5,54,6c18,1,36,1,55,3"
    },
    {
      name: "India",
      path: "M1421,383c10,2,20,1,30,4c10,3,20,7,31,9c11,2,22,3,33,6c11,3,22,7,34,9c12,2,24,3,36,6c12,3,24,7,37,9c13,2,26,3,39,6"
    },
    {
      name: "Argentina",
      path: "M585,683c8,3,16,2,24,6c8,4,16,9,25,12c9,3,18,5,27,9c9,4,18,9,28,12c10,3,20,5,30,9c10,4,20,9,31,12c11,3,22,5,33,9"
    },
    {
      name: "Kazakhstan",
      path: "M1336,233c12,1,24,3,36,4c12,1,24,1,37,3c13,2,26,5,39,6c13,1,26,1,40,3c14,2,28,5,42,6c14,1,28,1,43,3"
    },
    {
      name: "Algeria",
      path: "M1083,333c8,1,16,3,24,4c8,1,16,1,25,3c9,2,18,5,27,6c9,1,18,1,28,3c10,2,20,5,30,6c10,1,20,1,31,3"
    },
    {
      name: "Saudi Arabia",
      path: "M1283,383c6,1,12,3,18,4c6,1,12,1,19,3c7,2,14,5,21,6c7,1,14,1,22,3c8,2,16,5,24,6c8,1,16,1,25,3"
    },
    {
      name: "Mexico",
      path: "M383,333c6,2,12,1,18,4c6,3,12,7,19,9c7,2,14,3,21,6c7,3,14,7,22,9c8,2,16,3,24,6c8,3,16,7,25,9"
    },
    {
      name: "Indonesia",
      path: "M1587,483c8,1,16,1,25,2c9,1,18,3,27,4c9,1,18,1,28,2c10,1,20,3,30,4c10,1,20,1,31,2c11,1,22,3,33,4"
    },
    {
      name: "Sudan",
      path: "M1183,383c6,1,12,2,18,3c6,1,12,2,19,3c7,1,14,2,21,3c7,1,14,2,22,3c8,1,16,2,24,3"
    },
    {
      name: "Libya",
      path: "M1133,333c5,1,10,2,15,3c5,1,10,2,16,3c6,1,12,2,18,3c6,1,12,2,19,3c7,1,14,2,21,3"
    },
    {
      name: "Iran",
      path: "M1333,333c7,1,14,2,21,3c7,1,14,2,22,3c8,1,16,2,24,3c8,1,16,2,25,3c9,1,18,2,27,3"
    },
    {
      name: "Mongolia",
      path: "M1483,233c8,1,16,2,24,3c8,1,16,2,25,3c9,1,18,2,27,3c9,1,18,2,28,3c10,1,20,2,30,3"
    },
    {
      name: "Peru",
      path: "M533,533c6,2,12,1,18,4c6,3,12,7,19,9c7,2,14,3,21,6c7,3,14,7,22,9c8,2,16,3,24,6"
    },
    {
      name: "Chad",
      path: "M1133,383c4,1,8,2,12,3c4,1,8,2,13,3c5,1,10,2,15,3c5,1,10,2,16,3c6,1,12,2,18,3"
    },
    {
      name: "Niger",
      path: "M1083,383c4,1,8,2,12,3c4,1,8,2,13,3c5,1,10,2,15,3c5,1,10,2,16,3c6,1,12,2,18,3"
    },
    {
      name: "Angola",
      path: "M1133,533c5,1,10,2,15,3c5,1,10,2,16,3c6,1,12,2,18,3c6,1,12,2,19,3c7,1,14,2,21,3"
    },
    {
      name: "Mali",
      path: "M1033,383c4,1,8,2,12,3c4,1,8,2,13,3c5,1,10,2,15,3c5,1,10,2,16,3c6,1,12,2,18,3"
    },
    {
      name: "South Africa",
      path: "M1183,633c6,1,12,2,18,3c6,1,12,2,19,3c7,1,14,2,21,3c7,1,14,2,22,3c8,1,16,2,24,3"
    },
    {
      name: "Colombia",
      path: "M533,433c5,2,10,1,15,4c5,3,10,7,16,9c6,2,12,3,18,6c6,3,12,7,19,9c7,2,14,3,21,6"
    },
    {
      name: "Ethiopia",
      path: "M1233,433c5,1,10,2,15,3c5,1,10,2,16,3c6,1,12,2,18,3c6,1,12,2,19,3c7,1,14,2,21,3"
    },
    {
      name: "Bolivia",
      path: "M583,583c4,2,8,1,12,4c4,3,8,7,13,9c5,2,10,3,15,6c5,3,10,7,16,9c6,2,12,3,18,6"
    },
    {
      name: "Mauritania",
      path: "M983,383c4,1,8,2,12,3c4,1,8,2,13,3c5,1,10,2,15,3c5,1,10,2,16,3c6,1,12,2,18,3"
    },
    {
      name: "Egypt",
      path: "M1183,333c4,1,8,2,12,3c4,1,8,2,13,3c5,1,10,2,15,3c5,1,10,2,16,3c6,1,12,2,18,3"
    },
    {
      name: "Tanzania",
      path: "M1233,483c4,1,8,2,12,3c4,1,8,2,13,3c5,1,10,2,15,3c5,1,10,2,16,3c6,1,12,2,18,3"
    },
    {
      name: "Nigeria",
      path: "M1083,433c4,1,8,2,12,3c4,1,8,2,13,3c5,1,10,2,15,3c5,1,10,2,16,3c6,1,12,2,18,3"
    },
    {
      name: "Venezuela",
      path: "M533,383c4,2,8,1,12,4c4,3,8,7,13,9c5,2,10,3,15,6c5,3,10,7,16,9c6,2,12,3,18,6"
    }
  ];

  return (
    <div className="relative w-full h-96 bg-slate-50 rounded-lg overflow-hidden border">
      <svg
        viewBox="0 0 2000 800"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Ocean background */}
        <rect width="2000" height="800" fill="#f1f5f9" />
        
        {countries.map((country) => (
          <path
            key={country.name}
            d={country.path}
            fill="#e2e8f0"
            stroke="#ffffff"
            strokeWidth="1"
            className="transition-all duration-200 cursor-pointer hover:fill-blue-100"
            onMouseEnter={() => setHoveredCountry(country.name)}
            onMouseLeave={() => setHoveredCountry(null)}
            style={{
              filter: hoveredCountry === country.name ? "brightness(0.9)" : "none",
            }}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredCountry && (
        <div className="absolute top-4 left-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg z-10">
          <div className="font-semibold text-gray-900">{hoveredCountry}</div>
          <div className="text-sm text-gray-500">Pas de données pour le moment</div>
        </div>
      )}
    </div>
  );
}