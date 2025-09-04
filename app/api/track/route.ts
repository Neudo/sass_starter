// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractClientIP, getLocationFromIP } from "@/lib/analytics/location";
import { parseUserAgent } from "@/lib/analytics/device";
import { parseTrafficSource } from "@/lib/analytics/sources";
import { calculatePageData } from "@/lib/analytics/pages";
import { shouldBlockRequest } from "@/lib/analytics/bot-detector";

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

    // Skip tracking for dashboard pages
    if (page && page.startsWith("/dashboard/")) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Parse user agent for device information
    const userAgent = req.headers.get("user-agent");
    const deviceData = parseUserAgent(userAgent);

    // Get client IP and location
    const ip = extractClientIP(req.headers);
    const locationData = await getLocationFromIP(ip);

    // Parse traffic source
    const trafficSource = parseTrafficSource(urlParams, referrer);

    // Normalize domain - handle both with and without www
    const domainVariants = [domain];
    if (domain.startsWith("www.")) {
      domainVariants.push(domain.substring(4));
    } else {
      domainVariants.push(`www.${domain}`);
    }

    // Get site from database
    const supabase = createAdminClient();
    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .in("domain", domainVariants);

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

    // Bot detection only (no IP blocking)
    const blockCheck = await shouldBlockRequest(
      userAgent,
      deviceData.browser || null
    );

    if (blockCheck.blocked) {
      // Return success but don't track the data
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Block sessions with suspicious null geolocation data (likely bots/proxies)
    if (
      locationData.country === null ||
      locationData.region === null ||
      locationData.city === null
    ) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Check if this is a new session - use a more robust approach to prevent race conditions
    let existingSession = null;
    let isNewSession = false;

    // First, try to get existing session
    const { data: sessionData } = await supabase
      .from("sessions")
      .select("id, visited_pages, created_at")
      .eq("id", sessionId)
      .single();

    if (sessionData) {
      existingSession = sessionData;
    } else {
      // If no session exists, this is potentially a new session
      // But we need to handle race conditions where multiple requests 
      // try to create the same session simultaneously
      isNewSession = true;
    }

    // Calculate page data
    const pageData = calculatePageData(page, existingSession);

    // Prepare base session data that's always updated
    const baseSessionData = {
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
      visited_pages: pageData.visitedPages,
    };

    // Add source tracking data only for new sessions
    const sessionDataWithSource = isNewSession 
      ? {
          ...baseSessionData,
          referrer: trafficSource.referrer,
          referrer_domain: trafficSource.referrerDomain,
          utm_source: trafficSource.utmParams.utm_source,
          utm_medium: trafficSource.utmParams.utm_medium,
          utm_campaign: trafficSource.utmParams.utm_campaign,
          utm_term: trafficSource.utmParams.utm_term,
          utm_content: trafficSource.utmParams.utm_content,
          created_at: new Date().toISOString(),
        }
      : baseSessionData;

    // Use upsert with onConflict to handle race conditions properly
    const { error } = await supabase
      .from("sessions")
      .upsert(sessionDataWithSource, { 
        onConflict: 'id',
        ignoreDuplicates: false 
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
