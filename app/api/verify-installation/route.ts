import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Clean the domain
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    
    // Try to fetch the homepage
    const url = `https://${cleanDomain}`;
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "HectorAnalytics/1.0 (Installation Checker)",
        },
        // Follow redirects
        redirect: "follow",
        // Timeout after 10 seconds
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        // Try with http if https fails
        const httpUrl = `http://${cleanDomain}`;
        const httpResponse = await fetch(httpUrl, {
          method: "GET",
          headers: {
            "User-Agent": "HectorAnalytics/1.0 (Installation Checker)",
          },
          redirect: "follow",
          signal: AbortSignal.timeout(10000),
        });

        if (!httpResponse.ok) {
          return NextResponse.json(
            { 
              installed: false, 
              error: "Could not access the website" 
            },
            { status: 200 }
          );
        }

        const html = await httpResponse.text();
        const scriptInstalled = html.includes("https://www.hectoranalytics.com/script.js");
        
        return NextResponse.json({
          installed: scriptInstalled,
          protocol: "http",
        });
      }

      const html = await response.text();
      
      // Check if our script is present in the HTML
      const scriptInstalled = html.includes("https://www.hectoranalytics.com/script.js");
      
      return NextResponse.json({
        installed: scriptInstalled,
        protocol: "https",
      });
    } catch (fetchError) {
      console.error("Error fetching website:", fetchError);
      
      // Try to check with a different method (check for tracking data instead)
      // This is a fallback if we can't fetch the website directly
      return NextResponse.json({
        installed: false,
        error: "Could not fetch the website. Please ensure the domain is accessible.",
        fallbackCheck: true,
      });
    }
  } catch (error) {
    console.error("Error in verify-installation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}