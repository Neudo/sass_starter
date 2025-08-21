import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const adminClient = createAdminClient();

    // Get request data
    const body = await request.json();
    const { site_domain, event_name, page_url } = body;

    if (!site_domain || !event_name || !page_url) {
      return NextResponse.json(
        { error: "site_domain, event_name, and page_url are required" },
        { status: 400 }
      );
    }

    // Find the site by domain
    const { data: siteData, error: siteError } = await adminClient
      .from("sites")
      .select("id")
      .eq("domain", site_domain)
      .single();

    if (siteError || !siteData) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Find the custom event by name and site
    const { data: customEventData, error: eventError } = await adminClient
      .from("custom_events")
      .select("id, is_active, trigger_count")
      .eq("site_id", siteData.id)
      .eq("name", event_name)
      .eq("is_active", true)
      .single();

    if (eventError || !customEventData) {
      return NextResponse.json(
        { error: "Custom event not found or inactive" },
        { status: 404 }
      );
    }

    // Increment the trigger count
    const { error: updateError } = await adminClient
      .from("custom_events")
      .update({
        trigger_count: customEventData.trigger_count
          ? customEventData.trigger_count + 1
          : 1,
      })
      .eq("id", customEventData.id);

    if (updateError) {
      console.error("Error updating custom event trigger count:", updateError);
      return NextResponse.json(
        { error: "Failed to update trigger count" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      trigger_count: (customEventData.trigger_count || 0) + 1,
    });
  } catch (error) {
    console.error("Error in track-custom-event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
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
