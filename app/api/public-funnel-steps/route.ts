import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient();
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("siteId");

    if (!siteId) {
      return NextResponse.json(
        { error: "Site ID is required" },
        { status: 400 }
      );
    }

    // Normalize domain - handle both with and without www
    const domainVariants = [siteId];
    if (siteId.startsWith('www.')) {
      domainVariants.push(siteId.substring(4));
    } else {
      domainVariants.push(`www.${siteId}`);
    }

    // Get all active funnel steps for the site
    const { data: steps, error } = await adminClient
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
          sites!inner (
            domain
          )
        )
      `
      )
      .in("funnels.sites.domain", domainVariants)
      .eq("funnels.is_active", true)
      .order("step_number", { ascending: true });

    if (error) {
      console.error("Error fetching funnel steps:", error);
      return NextResponse.json(
        { error: "Failed to fetch funnel steps" },
        { status: 500 }
      );
    }

    // Transform data for frontend consumption
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedSteps = (steps || []).map((step: any) => ({
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
    }));

    return NextResponse.json(transformedSteps, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error fetching public funnel steps:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
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
