// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Reader } from "@maxmind/geoip2-node";
import { UAParser } from "ua-parser-js";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, page } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId or siteId" },
        { status: 400 }
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
    const supabase = await createAdminClient();
    const domain = req.headers.get("host");
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
    });

    if (error) {
      console.error("Upsert session error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Track handler failed", e);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
