import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";
import { emptyCorsResponse, jsonCorsResponse, readJsonBody } from "@/lib/api/http";
import { getSiteByDomain } from "@/lib/api/sites";

interface TrackCustomEventPayload {
  site_domain?: string;
  event_name?: string;
  session_id?: string;
  page_url?: string;
  metadata?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const { data: body, error } =
    await readJsonBody<TrackCustomEventPayload>(request);

  if (error || !body) {
    return jsonCorsResponse({ error: "Invalid payload" }, { status: 400 }, origin);
  }

  const { site_domain, event_name, session_id, page_url, metadata } = body;

  if (!site_domain || !event_name || !session_id || !page_url) {
    return jsonCorsResponse(
      { error: "site_domain, event_name, session_id, and page_url are required" },
      { status: 400 },
      origin
    );
  }

  const site = await getSiteByDomain(site_domain);
  if (!site) {
    return jsonCorsResponse({ error: "Site not found" }, { status: 404 }, origin);
  }

  const adminClient = createAdminClient();
  const [{ data: customEventData, error: eventError }, { data: sessionData }] =
    await Promise.all([
      adminClient
        .from("custom_events")
        .select("id, is_active")
        .eq("site_id", site.id)
        .eq("name", event_name)
        .eq("is_active", true)
        .maybeSingle(),
      adminClient
        .from("sessions")
        .select("referrer_domain, country")
        .eq("id", session_id)
        .maybeSingle(),
    ]);

  if (eventError || !customEventData) {
    return jsonCorsResponse(
      { error: "Custom event not found or inactive" },
      { status: 404 },
      origin
    );
  }

  const { data: existingCompletion, error: checkError } = await adminClient
    .from("custom_event_completions")
    .select("id")
    .eq("custom_event_id", customEventData.id)
    .eq("session_id", session_id)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking existing custom event completion:", checkError);
    return jsonCorsResponse(
      { error: "Failed to check existing completion" },
      { status: 500 },
      origin
    );
  }

  if (existingCompletion) {
    return jsonCorsResponse(
      {
        success: true,
        message: "Custom event already recorded for this session",
        already_completed: true,
      },
      {},
      origin
    );
  }

  const eventMetadata = {
    ...(metadata || {}),
    source: sessionData?.referrer_domain || "direct",
    country: sessionData?.country || null,
  };

  const { error: insertError } = await adminClient
    .from("custom_event_completions")
    .insert({
      custom_event_id: customEventData.id,
      session_id,
      page_url,
      metadata: eventMetadata,
    });

  if (insertError?.code === "23505") {
    return jsonCorsResponse(
      {
        success: true,
        message: "Custom event already recorded for this session",
        already_completed: true,
      },
      {},
      origin
    );
  }

  if (insertError?.code === "23503") {
    return jsonCorsResponse(
      { error: "Session not found. Please ensure the main tracking script is loaded." },
      { status: 400 },
      origin
    );
  }

  if (insertError) {
    console.error("Error inserting custom event completion:", insertError);
    return jsonCorsResponse(
      { error: "Failed to record completion" },
      { status: 500 },
      origin
    );
  }

  return jsonCorsResponse(
    {
      success: true,
      message: "Custom event recorded successfully",
    },
    {},
    origin
  );
}

export async function OPTIONS(request: NextRequest) {
  return emptyCorsResponse(200, request.headers.get("origin"));
}
