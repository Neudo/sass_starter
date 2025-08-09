// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Reader } from "@maxmind/geoip2-node";
import { UAParser } from "ua-parser-js";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received tracking data:", body);
    const { sessionId, page, domain } = body;

    if (!sessionId || !domain) {
      return NextResponse.json(
        { error: "Missing sessionId or domain" },
        { 
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          }
        }
      );
    }

    const ua = req.headers.get("user-agent");
    const parser = new UAParser(ua as string);
    const { name: browser, version: browserVersion } = parser.getBrowser();
    const { name: os, version: osVersion } = parser.getOS();
    const { type: deviceType } = parser.getDevice();

    // Determine device category
    let deviceCategory: "mobile" | "tablet" | "desktop";
    if (deviceType === "mobile") {
      deviceCategory = "mobile";
    } else if (deviceType === "tablet") {
      deviceCategory = "tablet";
    } else {
      deviceCategory = "desktop";
    }

    // Upsert : crée ou met à jour last_seen
    const supabase = createAdminClient();
    // Get client IP from headers
    const forwarded = req.headers.get("x-forwarded-for");

    let ip = forwarded ? forwarded.split(",")[0].trim() : null;
    if (ip === "::1" || ip === null) {
      ip = "83.114.15.244";
    }
    
    // Initialize location variables
    let country = null;
    let region = null;
    let city = null;
    
    // Try to get geolocation data, but don't fail if it's not available
    try {
      // Use absolute path with process.cwd() for Vercel compatibility
      const dbPath = path.join(process.cwd(), "data", "GeoLite2-City.mmdb");
      const reader = await Reader.open(dbPath);
      const response = reader.city(ip);
      
      // Extract location data in English
      country = response?.country?.names.en || null;
      region = response?.subdivisions?.[0].names.en || null;
      city = response?.city?.names.en || null;
    } catch (geoError) {
      // Log error but continue without geolocation data
      console.error("Geolocation lookup failed:", geoError);
      // Continue with null values for location
    }

    // In development mode, create a fake site ID for testing
    let siteId: number;
    
    // Check if we're in dev mode and dealing with a dev domain
    const isDev = process.env.NODE_ENV === 'development' || 
                  domain.includes('localhost') || 
                  domain.includes('127.0.0.1') || 
                  domain.includes('ngrok');
    
    if (isDev) {
      console.log(`Dev mode: Using test site ID for domain: ${domain}`);
      siteId = 1; // Use a test site ID
    } else {
      const { data: site } = await supabase
        .from("sites")
        .select("id")
        .eq("domain", domain);
      
      if (!site || site.length === 0) {
        console.log(`Site not found for domain: ${domain}`);
        return NextResponse.json(
          { error: "Site not found", domain }, 
          { 
            status: 404,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
            }
          }
        );
      }
      siteId = site[0].id;
    }

    // Check if this is a new session to set entry_page
    const { data: existingSession } = await supabase
      .from("sessions")
      .select("id, entry_page, page_views")
      .eq("id", sessionId)
      .single();

    const isNewSession = !existingSession;
    const currentPageViews = existingSession?.page_views || 0;

    const { error } = await supabase.from("sessions").upsert({
      id: sessionId,
      site_id: siteId,
      last_seen: new Date().toISOString(),
      country,
      region,
      city,
      browser,
      browser_version: browserVersion,
      os,
      os_version: osVersion,
      screen_size: deviceCategory,
      // Page tracking
      entry_page: isNewSession ? page || "/" : existingSession.entry_page,
      exit_page: page || "/",
      page_views: currentPageViews + 1,
    });

    if (error) {
      console.error("Upsert session error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (e) {
    console.error("Track handler failed:", e);
    console.error("Error details:", e instanceof Error ? e.message : String(e));
    return NextResponse.json(
      { error: "Invalid payload", details: e instanceof Error ? e.message : String(e) },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
