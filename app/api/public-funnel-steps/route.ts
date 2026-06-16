import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";
import { emptyCorsResponse, jsonCorsResponse } from "@/lib/api/http";
import { getSiteByDomain } from "@/lib/api/sites";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
};

interface FunnelStepWithFunnel {
  id: string;
  step_number: number;
  name: string;
  step_type: string;
  event_type: string | null;
  event_config: unknown;
  url_pattern: string | null;
  match_type: string | null;
  funnels: {
    id: string;
    name: string;
  };
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const siteDomain = request.nextUrl.searchParams.get("siteId");

  if (!siteDomain) {
    return jsonCorsResponse({ error: "Site ID is required" }, { status: 400 }, origin);
  }

  try {
    const site = await getSiteByDomain(siteDomain);
    if (!site) {
      return jsonCorsResponse([], { headers: CACHE_HEADERS }, origin);
    }

    const { data: steps, error } = await createAdminClient()
      .from("funnel_steps")
      .select(
        `
        id,
        step_number,
        name,
        step_type,
        event_type,
        event_config,
        url_pattern,
        match_type,
        funnels!inner (
          id,
          name,
          is_active,
          site_id
        )
      `
      )
      .eq("funnels.site_id", site.id)
      .eq("funnels.is_active", true)
      .order("step_number", { ascending: true });

    if (error) {
      console.error("Error fetching funnel steps:", error);
      return jsonCorsResponse(
        { error: "Failed to fetch funnel steps" },
        { status: 500 },
        origin
      );
    }

    const transformedSteps = ((steps || []) as unknown as FunnelStepWithFunnel[]).map(
      (step) => ({
        id: step.id,
        funnel_id: step.funnels.id,
        funnel_name: step.funnels.name,
        step_number: step.step_number,
        name: step.name,
        step_type: step.step_type,
        event_type: step.event_type,
        event_config: step.event_config,
        url_pattern: step.url_pattern,
        match_type: step.match_type,
      })
    );

    return jsonCorsResponse(transformedSteps, { headers: CACHE_HEADERS }, origin);
  } catch (error) {
    console.error("Error fetching public funnel steps:", error);
    return jsonCorsResponse({ error: "Internal server error" }, { status: 500 }, origin);
  }
}

export async function OPTIONS(request: NextRequest) {
  return emptyCorsResponse(200, request.headers.get("origin"));
}
