// app/api/update-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400, headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }}
      );
    }

    const supabase = createAdminClient();
    const currentTime = new Date().toISOString();

    // Update session last_seen
    await supabase
      .from("sessions")
      .update({ last_seen: currentTime })
      .eq("id", sessionId);

    // Get the most recent page view for this session
    const { data: lastPageView } = await supabase
      .from("page_views")
      .select("id, created_at, duration_seconds, exit_page")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Update duration for the most recent page view if it exists
    if (lastPageView) {
      const lastPageTime = new Date(lastPageView.created_at).getTime();
      const currentTimeMs = new Date().getTime(); // Use actual current time for duration calculation
      const totalTimeOnPage = Math.round((currentTimeMs - lastPageTime) / 1000);
      
      // Cap total time at 30 minutes and ensure it's at least 1 second
      const cappedTotalTime = Math.min(Math.max(totalTimeOnPage, 1), 1800);
      
      // REPLACE (not add) the duration with total time since page started
      // This prevents accumulation on heartbeats
      await supabase
        .from("page_views")
        .update({ 
          duration_seconds: cappedTotalTime, // Total time since page visit started
          exit_page: true // Mark as potential exit page
        })
        .eq("id", lastPageView.id);
    }

    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Session update error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }}
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