// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Reader } from "@maxmind/geoip2-node";
import { UAParser } from "ua-parser-js";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, page, domain, referrer } = await req.json();

    if (!sessionId || !domain) {
      return NextResponse.json(
        { error: "Missing sessionId or domain" },
        { status: 400 }
      );
    }

    // Parse UTM parameters from the URL
    const url = new URL(req.url);
    const utm_source = url.searchParams.get("utm_source");
    const utm_medium = url.searchParams.get("utm_medium");
    const utm_campaign = url.searchParams.get("utm_campaign");
    const utm_term = url.searchParams.get("utm_term");
    const utm_content = url.searchParams.get("utm_content");

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

    console.log(req.headers);

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
    const supabase = await createAdminClient();
    // Get client IP from headers
    const forwarded = req.headers.get("x-forwarded-for");

    let ip = forwarded ? forwarded.split(",")[0].trim() : null;
    if (ip === "::1" || ip === null) {
      ip = "83.114.15.244";
    }
    // Use absolute path with process.cwd() for Vercel compatibility
    const dbPath = path.join(process.cwd(), "data", "GeoLite2-City.mmdb");

    const reader = await Reader.open(dbPath);
    const response = reader.city(ip);

    // Extract location data in English
    const country = response?.country?.names.en || null;
    const region = response?.subdivisions?.[0].names.en || null;
    const city = response?.city?.names.en || null;

    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .eq("domain", domain);
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
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
      // UTM parameters
      utm_source: utm_source || undefined,
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
