// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import geoip from "geoip-lite";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, page } = await req.json();
    console.log("Start logging");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId or siteId" },
        { status: 400 }
      );
    }

    // Upsert : crée ou met à jour last_seen
    const supabase = await createClient();
    const domain = req.headers.get("host");
    // Get client IP from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : null;
    
    // Get geolocation data
    const geo = ip ? geoip.lookup(ip) : null;
    console.log("IP:", ip);
    console.log("Geo:", geo);
    
    // Extract location data
    const country = geo?.country || null;
    const region = geo?.region || null;
    const city = geo?.city || null;

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
