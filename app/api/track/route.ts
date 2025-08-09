// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Reader } from "@maxmind/geoip2-node";
import { UAParser } from "ua-parser-js";
import path from "path";
import { getNormalizedSource, getChannel } from "@/lib/referrer-helper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      sessionId, 
      page, 
      domain, 
      referrer,
      ref = null,
      utm_source = null,
      utm_medium = null,
      utm_campaign = null,
      utm_term = null,
      utm_content = null
    } = body;

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

    // Parse referrer domain
    let referrer_domain = null;
    if (referrer && referrer !== "" && referrer !== "null") {
      try {
        const referrerUrl = new URL(referrer);
        referrer_domain = referrerUrl.hostname;
      } catch (e) {
        // Invalid referrer URL, ignore
        console.log(e);
      }
    }

    // Normalize the source using our helper
    // Priority: utm_source > ref > referrer_domain
    const normalizedSource = getNormalizedSource(
      utm_source || ref || null,
      referrer_domain || null
    );

    // Determine the marketing channel
    const channel = getChannel(
      utm_medium,
      utm_source || ref || null,
      referrer_domain
    );

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

    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .eq("domain", domain);
    if (!site) {
      return NextResponse.json(
        { error: "Site not found" }, 
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
      site_id: site[0].id,
      page: page || null,
      last_seen: new Date().toISOString(),
      country,
      region,
      city,
      browser,
      browser_version: browserVersion,
      os,
      os_version: osVersion,
      screen_size: deviceCategory,
      // UTM parameters - store normalized source
      utm_source: normalizedSource !== "direct" ? normalizedSource : undefined,
      utm_medium: utm_medium || undefined,
      utm_campaign: utm_campaign || undefined,
      utm_term: utm_term || undefined,
      utm_content: utm_content || undefined,
      // Referrer
      referrer: referrer || undefined,
      referrer_domain: referrer_domain || undefined,
      // Page tracking
      entry_page: isNewSession ? page || "/" : existingSession.entry_page,
      exit_page: page || "/",
      page_views: currentPageViews + 1,
      // Channel classification
      channel: channel,
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
    console.error("Track handler failed", e);
    return NextResponse.json(
      { error: "Invalid payload" },
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
