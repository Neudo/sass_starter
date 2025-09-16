// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractClientIP, getLocationFromIP } from "@/lib/analytics/location";
import { parseUserAgent } from "@/lib/analytics/device";
import { parseTrafficSource } from "@/lib/analytics/sources";
import { shouldBlockRequest } from "@/lib/analytics/bot-detector";

export async function POST(req: NextRequest) {
  try {
    // Get the origin of the request
    const origin = req.headers.get("origin") || "";
    
    const { sessionId, page, domain, referrer, urlParams, language } =
      await req.json();

    if (!sessionId || !domain) {
      return NextResponse.json(
        { error: "Missing sessionId or domain" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": origin || "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }
    
    // Environment-based domain validation
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
    
    // Verify that the origin matches the declared domain
    if (origin) {
      const originDomain = new URL(origin).hostname.replace('www.', '');
      const declaredDomain = domain.replace('www.', '');
      
      // In production: block localhost domains completely
      if (isProduction) {
        const isLocalhost = originDomain === 'localhost' || originDomain === '127.0.0.1' || originDomain.includes('.local');
        const isLocalDomain = declaredDomain === 'localhost' || declaredDomain === '127.0.0.1' || declaredDomain.includes('.local');
        
        if (isLocalhost || isLocalDomain) {
          return NextResponse.json(
            { error: "Localhost domains not allowed in production" },
            {
              status: 403,
              headers: {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
              },
            }
          );
        }
      }
      
      // Allow localhost for development, require exact match for production
      const isLocalhost = originDomain === 'localhost' || originDomain === '127.0.0.1';
      const isLocalDomain = declaredDomain === 'localhost' || declaredDomain === '127.0.0.1';
      
      // For production: origin must match declared domain exactly
      if (!isLocalhost && !isLocalDomain && originDomain !== declaredDomain) {
        return NextResponse.json(
          { error: "Origin does not match declared domain" },
          {
            status: 403,
            headers: {
              "Access-Control-Allow-Origin": origin,
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
            },
          }
        );
      }
    }

    // Skip tracking for ALL dashboard pages (security: don't track private data)
    if (page && page.includes("/dashboard")) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
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

    // Filter out internal referrers before parsing traffic source
    let filteredReferrer = referrer;
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        const referrerHost = referrerUrl.hostname.replace('www.', '');
        const currentHost = domain.replace('www.', '');
        
        // If referrer is from the same domain, treat as no referrer
        if (referrerHost === currentHost) {
          filteredReferrer = null;
        }
      } catch {
        // Keep referrer as is if not a valid URL
      }
    }
    
    // Parse traffic source with filtered referrer
    const trafficSource = parseTrafficSource(urlParams, filteredReferrer);

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
            "Access-Control-Allow-Origin": origin || "*",
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
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Block sessions with suspicious null geolocation data (likely bots/proxies)
    if (
      locationData.country === null ||
      locationData.country === "unknown" ||
      locationData.region === null ||
      locationData.region === "unknown" ||
      locationData.city === null ||
      locationData.city === "unknown"
    ) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
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

    console.log("Session ID:", sessionId);

    console.log("Current time:", currentTime);

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
        onConflict: "id",
        ignoreDuplicates: false,
      });

    if (sessionError) {
      return NextResponse.json(
        { error: sessionError.message },
        { status: 500 }
      );
    }

    // Handle page view tracking with duration and exit page logic
    if (page) {
      // Get the most recent page view for this session (regardless of page)
      const { data: lastPageView } = await supabase
        .from("page_views")
        .select("id, page_path, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Check if this is the same page as the last one (heartbeat vs new page)
      const isSamePage = lastPageView && lastPageView.page_path === page;

      if (isSamePage) {
        // This is a heartbeat on the same page - DON'T update created_at
        // The duration will be calculated later by update-session endpoint
        console.log("Heartbeat on same page - no update needed");
      } else {
        // This is a new page visit

        // First, finalize the previous page if it exists
        if (lastPageView) {
          const lastPageTime = new Date(lastPageView.created_at).getTime();
          const currentTimeMs = new Date(currentTime).getTime();
          const sessionDuration = Math.round(
            (currentTimeMs - lastPageTime) / 1000
          );

          // Cap session duration at 30 minutes to avoid unrealistic values
          const cappedSessionDuration = Math.min(
            Math.max(sessionDuration, 1),
            1800
          );

          // For page changes, we need to add this session to any existing cumulative time
          // Get the current duration to see if this page was visited before
          const { data: currentPageData } = await supabase
            .from("page_views")
            .select("duration_seconds")
            .eq("id", lastPageView.id)
            .single();

          // If there was already duration recorded (from previous visits to this page)
          // add this session's duration to it
          const existingDuration = currentPageData?.duration_seconds || 0;
          const newTotalDuration = existingDuration + cappedSessionDuration;

          // Update the previous page with final duration
          const { error: updateLastError } = await supabase
            .from("page_views")
            .update({
              duration_seconds: newTotalDuration, // Cumulative duration for this page
              exit_page: false, // Not an exit since user continues to another page
            })
            .eq("id", lastPageView.id);

          if (updateLastError) {
            console.error("Error updating last page view:", updateLastError);
          }
        }

        // Check if this page already exists in this session (optimization)
        const { data: existingPageInSession } = await supabase
          .from("page_views")
          .select("id, created_at, entry_page, duration_seconds")
          .eq("session_id", sessionId)
          .eq("page_path", page)
          .single();

        if (existingPageInSession) {
          // Page already visited in this session - reuse the existing record
          // Just update the timestamp and reset exit flag (duration will be added when leaving)
          const { error: reuseError } = await supabase
            .from("page_views")
            .update({
              created_at: currentTime, // Update to new visit time
              exit_page: false, // Reset exit flag (duration stays cumulative)
            })
            .eq("id", existingPageInSession.id);

          if (reuseError) {
            console.error("Error reusing page view:", reuseError);
          }
        } else {
          // This is a genuinely new page for this session

          // Check if this is the first page view for this session (entry page)
          const { count } = await supabase
            .from("page_views")
            .select("id", { count: "exact" })
            .eq("session_id", sessionId);

          const isEntryPage = (count || 0) === 0;

          console.log("Jsute before insert pageview", currentTime);

          // Create new page view record
          const { error: pageViewError } = await supabase
            .from("page_views")
            .insert({
              session_id: sessionId,
              site_id: siteId,
              page_path: page,
              created_at: currentTime,
              entry_page: isEntryPage,
              exit_page: false,
              duration_seconds: 0,
            });

          if (pageViewError) {
            console.error("Error inserting page view:", pageViewError);
          }
        }
      }
    }

    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin || "*",
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

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
