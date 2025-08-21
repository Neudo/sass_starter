import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient();

    const { searchParams } = new URL(request.url);
    const siteDomain = searchParams.get("siteId");

    if (!siteDomain) {
      return NextResponse.json(
        { error: "Site domain is required" },
        { status: 400 }
      );
    }

    // Find site by domain (no auth check - public endpoint)
    const { data: siteData, error: siteError } = await adminClient
      .from("sites")
      .select("id")
      .eq("domain", siteDomain)
      .single();

    if (siteError || !siteData) {
      console.log("[API Debug] Site not found for domain:", siteDomain);
      return NextResponse.json([]); // Return empty array if site not found
    }

    // Fetch only active custom events for this site
    const { data: customEvents, error } = await adminClient
      .from("custom_events")
      .select(
        `
        id,
        name,
        event_type,
        event_selector,
        trigger_config,
        is_active
      `
      )
      .eq("site_id", siteData.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching custom events:", error);
      return NextResponse.json([]);
    }

    console.log(
      "[API Debug] Returning custom events for site:",
      siteDomain,
      "count:",
      customEvents?.length
    );
    return NextResponse.json(customEvents || []);
  } catch (error) {
    console.error("Error in public-custom-events:", error);
    return NextResponse.json([]);
  }
}

// Handle OPTIONS for CORS
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
