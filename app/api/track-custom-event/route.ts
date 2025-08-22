import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const adminClient = createAdminClient();

    // Get request data
    const body = await request.json();
    const { site_domain, event_name, session_id, page_url, metadata } = body;

    if (!site_domain || !event_name || !session_id || !page_url) {
      return NextResponse.json(
        { error: "site_domain, event_name, session_id, and page_url are required" },
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
      .select("id, is_active")
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

    // Get session data for metadata (don't fail if session doesn't exist yet)
    const { data: sessionData, error: sessionError } = await adminClient
      .from("sessions")
      .select("referrer_domain, country")
      .eq("id", session_id)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors if not found

    if (sessionError) {
      console.log("Session not found or error:", sessionError.message);
    }

    // Build metadata with session info (fallback if no session data)
    const eventMetadata = {
      ...metadata,
      source: sessionData?.referrer_domain || 'direct',
      country: sessionData?.country || 'unknown',
    };

    console.log("Attempting to insert custom event completion:", {
      custom_event_id: customEventData.id,
      session_id: session_id,
      page_url: page_url,
      metadata: eventMetadata,
    });

    // Insert completion record
    const { error: insertError } = await adminClient
      .from("custom_event_completions")
      .insert({
        custom_event_id: customEventData.id,
        session_id: session_id,
        page_url: page_url,
        metadata: eventMetadata,
      });

    if (insertError) {
      console.error("Error inserting custom event completion:", insertError);
      
      // Check if it's a foreign key constraint error
      if (insertError.code === '23503') {
        console.error("Foreign key violation - session might not exist:", session_id);
        // Try to create a basic session first
        const { error: sessionCreateError } = await adminClient
          .from("sessions")
          .upsert({
            id: session_id,
            site_id: siteData.id,
            last_seen: new Date().toISOString(),
            country: 'unknown',
          });
        
        if (sessionCreateError) {
          console.error("Failed to create session:", sessionCreateError);
        } else {
          // Retry the completion insert
          const { error: retryError } = await adminClient
            .from("custom_event_completions")
            .insert({
              custom_event_id: customEventData.id,
              session_id: session_id,
              page_url: page_url,
              metadata: eventMetadata,
            });
          
          if (retryError) {
            console.error("Retry failed:", retryError);
            return NextResponse.json(
              { error: "Failed to record completion after retry" },
              { status: 500 }
            );
          }
        }
      } else {
        return NextResponse.json(
          { error: "Failed to record completion" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Custom event recorded successfully",
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
