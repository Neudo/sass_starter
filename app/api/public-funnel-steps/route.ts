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
      .eq("funnels.sites.domain", siteId)
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

    return NextResponse.json(transformedSteps);
  } catch (error) {
    console.error("Error fetching public funnel steps:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
