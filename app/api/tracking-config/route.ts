import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const siteId = searchParams.get('siteId');

    if (!siteId) {
      return NextResponse.json({ error: "Missing siteId" }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // Get both funnel steps and custom events in parallel
    const [funnelStepsResult, customEventsResult] = await Promise.all([
      supabase
        .from("funnel_steps")
        .select("*")
        .eq("site_domain", siteId)
        .eq("is_active", true),
      supabase
        .from("custom_events")
        .select("*")
        .eq("site_domain", siteId)
        .eq("is_active", true)
    ]);

    return NextResponse.json({
      funnelSteps: funnelStepsResult.data || [],
      customEvents: customEventsResult.data || []
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=300" // Cache 5 minutes
      }
    });

  } catch (error) {
    console.error('Error fetching tracking config:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}