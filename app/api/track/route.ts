// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Reader } from "@maxmind/geoip2-node";
import { UAParser } from "ua-parser-js";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, page, domain, referrer, urlParams } = await req.json();

    if (!sessionId || !domain) {
      return NextResponse.json(
        { error: "Missing sessionId or domain" },
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

    // Extract UTM parameters from URL query string
    let utm_source = null;
    let utm_medium = null;
    let utm_campaign = null;
    let utm_term = null;
    let utm_content = null;

    if (urlParams) {
      const params = new URLSearchParams(urlParams);
      utm_source = params.get("utm_source");
      utm_medium = params.get("utm_medium");
      utm_campaign = params.get("utm_campaign");
      utm_term = params.get("utm_term");
      utm_content = params.get("utm_content");
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
      // Continue with null values for location if geolocation fails
      console.error("Geolocation lookup failed:", geoError);
    }

    // In development mode, create a fake site ID for testing
    let siteId: number;

    // Check if we're in dev mode and dealing with a dev domain
    const isDev =
      process.env.NODE_ENV === "development" ||
      domain.includes("localhost") ||
      domain.includes("127.0.0.1") ||
      domain.includes("ngrok");

    if (isDev) {
      siteId = 1; // Use a test site ID in dev mode
    } else {
      const { data: site } = await supabase
        .from("sites")
        .select("id")
        .eq("domain", domain);

      if (!site || site.length === 0) {
        return NextResponse.json(
          { error: "Site not found" },
          {
            status: 404,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
            },
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

    // Extract referrer domain
    let referrerDomain = null;
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        referrerDomain = referrerUrl.hostname;
      } catch {
        // If referrer is not a valid URL, leave as null
      }
    }

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
      // Source tracking - only set on new sessions
      ...(isNewSession && {
        referrer,
        referrer_domain: referrerDomain,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
      }),
    });

    if (error) {
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
  } catch {
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
