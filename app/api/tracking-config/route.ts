import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emptyCorsResponse, jsonCorsResponse } from "@/lib/api/http";
import { getSiteByDomain } from "@/lib/api/sites";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
};

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const siteDomain = req.nextUrl.searchParams.get("siteId");

  if (!siteDomain) {
    return jsonCorsResponse({ error: "Missing siteId" }, { status: 400 }, origin);
  }

  try {
    const site = await getSiteByDomain(siteDomain);

    if (!site) {
      return jsonCorsResponse(
        { funnelSteps: [], customEvents: [] },
        { headers: CACHE_HEADERS },
        origin
      );
    }

    const supabase = createAdminClient();
    const [funnelStepsResult, customEventsResult] = await Promise.all([
      supabase
        .from("funnel_steps")
        .select(
          `
          id,
          funnel_id,
          step_number,
          name,
          step_type,
          event_type,
          event_config,
          url_pattern,
          match_type,
          funnels!inner (
            is_active,
            site_id
          )
        `
        )
        .eq("funnels.site_id", site.id)
        .eq("funnels.is_active", true),
      supabase
        .from("custom_events")
        .select("id, name, event_type, event_selector, trigger_config, is_active")
        .eq("site_id", site.id)
        .eq("is_active", true),
    ]);

    if (funnelStepsResult.error || customEventsResult.error) {
      console.error("Tracking config query failed", {
        funnelSteps: funnelStepsResult.error,
        customEvents: customEventsResult.error,
      });
      return jsonCorsResponse(
        { error: "Failed to fetch tracking config" },
        { status: 500 },
        origin
      );
    }

    return jsonCorsResponse(
      {
        funnelSteps: funnelStepsResult.data || [],
        customEvents: customEventsResult.data || [],
      },
      { headers: CACHE_HEADERS },
      origin
    );
  } catch (error) {
    console.error("Error fetching tracking config:", error);
    return jsonCorsResponse({ error: "Internal server error" }, { status: 500 }, origin);
  }
}

export async function OPTIONS(req: NextRequest) {
  return emptyCorsResponse(200, req.headers.get("origin"));
}
