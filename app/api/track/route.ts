// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractClientIP, getLocationFromIP } from "@/lib/analytics/location";
import { parseUserAgent } from "@/lib/analytics/device";
import { parseTrafficSource } from "@/lib/analytics/sources";
import { calculatePageData } from "@/lib/analytics/pages";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, page, domain, referrer, urlParams, language } =
      await req.json();

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

    // Parse user agent for device information
    const userAgent = req.headers.get("user-agent");
    const deviceData = parseUserAgent(userAgent);

    // Get client IP and location
    const ip = extractClientIP(req.headers);
    const locationData = await getLocationFromIP(ip);

    // Parse traffic source
    const trafficSource = parseTrafficSource(urlParams, referrer);

    // Get site from database
    const supabase = createAdminClient();
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

    const siteId = site[0].id;

    // Check if this is a new session
    const { data: existingSession } = await supabase
      .from("sessions")
      .select("id, entry_page, visited_pages")
      .eq("id", sessionId)
      .single();

    const isNewSession = !existingSession;

    // Calculate page data
    const pageData = calculatePageData(page, existingSession);

    // Upsert session data
    const { error } = await supabase.from("sessions").upsert({
      id: sessionId,
      site_id: siteId,
      last_seen: new Date().toISOString(),
      // Location data
      country: locationData.country,
      region: locationData.region,
      city: locationData.city,
      // Device data
      browser: deviceData.browser,
      browser_version: deviceData.browserVersion,
      os: deviceData.os,
      os_version: deviceData.osVersion,
      screen_size: deviceData.deviceCategory,
      // Language data
      language: language || "en",
      // Page tracking
      entry_page: pageData.entryPage,
      exit_page: pageData.exitPage,
      visited_pages: pageData.visitedPages,
      // Source tracking - only set on new sessions
      ...(isNewSession && {
        referrer: trafficSource.referrer,
        referrer_domain: trafficSource.referrerDomain,
        utm_source: trafficSource.utmParams.utm_source,
        utm_medium: trafficSource.utmParams.utm_medium,
        utm_campaign: trafficSource.utmParams.utm_campaign,
        utm_term: trafficSource.utmParams.utm_term,
        utm_content: trafficSource.utmParams.utm_content,
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
