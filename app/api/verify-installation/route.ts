import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();
    console.log("🔍 API: Received domain for verification:", domain);

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    // Clean the domain (should already be clean from client, but double-check)
    const cleanDomain = domain
      .trim() // Remove whitespace
      .toLowerCase() // Normalize case
      .replace(/^https?:\/\//, "") // Remove protocol
      .replace(/^www\./, "") // Remove www.
      .replace(/\/+$/, "") // Remove trailing slashes
      .replace(/\/$/, ""); // Final cleanup
    
    console.log("🔍 API: Cleaned domain:", cleanDomain);
    
    // Special handling for hectoranalytics.com to avoid self-requests
    if (cleanDomain === "hectoranalytics.com") {
      console.log("🔍 API: Detected hectoranalytics.com - assuming script is installed");
      return NextResponse.json({
        installed: true,
        protocol: "https",
        note: "Self-domain detected, skipping fetch"
      });
    }
    
    // Try to fetch the homepage
    const url = `https://${cleanDomain}`;
    console.log("🔍 API: Trying URL:", url);
    
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
      console.log("🔍 API: Script installed:", scriptInstalled);
      
      return NextResponse.json({
        installed: scriptInstalled,
        protocol: "https",
      });
    } catch (fetchError) {
      console.error("🔍 API: Error fetching website:", fetchError);
      console.error("🔍 API: Error details:", {
        name: fetchError.name,
        message: fetchError.message,
        cause: fetchError.cause
      });
      
      // If it's a timeout or connection error, provide more context
      if (fetchError.name === 'AbortError') {
        console.log("🔍 API: Fetch was aborted (timeout)");
      } else if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        console.log("🔍 API: Network error - could be CORS, self-request, or DNS issue");
      }
      
      // Try to check with a different method (check for tracking data instead)
      // This is a fallback if we can't fetch the website directly
      return NextResponse.json({
        installed: false,
        error: "Could not fetch the website. Please ensure the domain is accessible.",
        fallbackCheck: true,
        debugInfo: {
          errorName: fetchError.name,
          errorMessage: fetchError.message
        }
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