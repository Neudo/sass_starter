"use client";

import { useEffect } from "react";

export default function AnalyticsScript() {
  useEffect(() => {
    // Create visual indicator
    const debugElement = document.createElement("div");
    debugElement.style.position = "fixed";
    debugElement.style.bottom = "10px";
    debugElement.style.right = "10px";
    debugElement.style.padding = "5px";
    debugElement.style.background = "green";
    debugElement.style.color = "white";
    debugElement.style.zIndex = "9999";
    debugElement.textContent = "Analytics script executed!";
    document.body.appendChild(debugElement);

    // Your actual analytics code would go here
    // For example, tracking page views, etc.
  }, []);

  return null; // This component doesn't render anything
}
