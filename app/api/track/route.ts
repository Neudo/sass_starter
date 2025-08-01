// app/api/track/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, siteId, page } = await req.json();

    if (!sessionId || !siteId) {
      return NextResponse.json(
        { error: "Missing sessionId or siteId" },
        { status: 400 }
      );
    }

    // Upsert : crée ou met à jour last_seen
    const supabase = await createClient();
    const { error } = await supabase.from("sessions").upsert({
      id: sessionId,
      site_id: siteId,
      page: page || null,
      last_seen: new Date().toISOString(),
    });

    if (error) {
      console.error("Upsert session error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Status 204 should not have a response body
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("Track handler failed", e);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
