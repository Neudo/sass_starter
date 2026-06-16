import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";
import { emptyCorsResponse, jsonCorsResponse } from "@/lib/api/http";
import { getSiteByDomain } from "@/lib/api/sites";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
};

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const siteDomain = request.nextUrl.searchParams.get("siteId");

  if (!siteDomain) {
    return jsonCorsResponse(
      { error: "Site domain is required" },
      { status: 400 },
      origin
    );
  }

  try {
    const site = await getSiteByDomain(siteDomain);
    if (!site) {
      return jsonCorsResponse([], { headers: CACHE_HEADERS }, origin);
    }

    const { data: customEvents, error } = await createAdminClient()
      .from("custom_events")
      .select("id, name, event_type, event_selector, trigger_config, is_active")
      .eq("site_id", site.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching custom events:", error);
      return jsonCorsResponse([], { headers: CACHE_HEADERS }, origin);
    }

    return jsonCorsResponse(customEvents || [], { headers: CACHE_HEADERS }, origin);
  } catch (error) {
    console.error("Error in public-custom-events:", error);
    return jsonCorsResponse([], { headers: CACHE_HEADERS }, origin);
  }
}

export async function OPTIONS(request: NextRequest) {
  return emptyCorsResponse(200, request.headers.get("origin"));
}
