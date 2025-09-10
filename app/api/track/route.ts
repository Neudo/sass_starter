// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractClientIP, getLocationFromIP } from "@/lib/analytics/location";
import { parseUserAgent } from "@/lib/analytics/device";
import { parseTrafficSource } from "@/lib/analytics/sources";
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

    // Skip tracking for ALL dashboard pages (security: don't track private data)
    if (page && page.includes("/dashboard")) {
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

    // Check if this is a new session
    let isNewSession = false;

    // First, try to get existing session
    const { data: sessionData } = await supabase
      .from("sessions")
      .select("id, created_at")
      .eq("id", sessionId)
      .single();

    if (!sessionData) {
      isNewSession = true;
    }

    // Prepare base session data that's always updated
    const currentTime = new Date().toISOString();
    const baseSessionData = {
      id: sessionId,
      site_id: siteId,
      last_seen: currentTime,
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
          created_at: currentTime, // Use the same timestamp to ensure consistency
        }
      : baseSessionData;

    // Use upsert with onConflict to handle race conditions properly
    const { error: sessionError } = await supabase
      .from("sessions")
      .upsert(sessionDataWithSource, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    // Insert or update page view record if page is provided
    if (page) {
      // Check if there's already a page view for this session+page in the last 30 minutes
      // This handles both immediate duplicates and session continuation
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: existingPageView } = await supabase
        .from("page_views")
        .select("id, created_at, entry_page")
        .eq("session_id", sessionId)
        .eq("page_path", page)
        .gte("created_at", thirtyMinutesAgo)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingPageView) {
        // Update existing page view with new timestamp (user is still/back on this page)
        const { error: updateError } = await supabase
          .from("page_views")
          .update({ 
            created_at: currentTime // Update to show most recent visit
          })
          .eq("id", existingPageView.id);

        if (updateError) {
          console.error("Error updating page view:", updateError);
        }
      } else {
        // Create new page view record
        // Check if this is the first page view for this session (entry page)
        const { count } = await supabase
          .from("page_views")
          .select("id", { count: 'exact' })
          .eq("session_id", sessionId)
          .limit(1);

        const isEntryPage = count === 0;

        const { error: pageViewError } = await supabase
          .from("page_views")
          .insert({
            session_id: sessionId,
            site_id: siteId,
            page_path: page,
            created_at: currentTime,
            entry_page: isEntryPage,
          });

        if (pageViewError) {
          console.error("Error inserting page view:", pageViewError);
        }
      }
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
