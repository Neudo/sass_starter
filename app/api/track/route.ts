// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Reader } from "@maxmind/geoip2-node";
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

    // Upsert : crée ou met à jour last_seen
    const supabase = await createClient();
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

    // Extract location data
    const country = response?.country?.names.fr || null;
    const region = response?.subdivisions?.[0].names.fr || null;
    const city = response?.city?.names.fr || null;

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
