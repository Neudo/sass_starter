import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("siteId");

    if (!siteId) {
      return NextResponse.json(
        { error: "Missing siteId parameter" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Resolve domain to site_id if needed
    let resolvedSiteId = siteId;
    
    if (typeof siteId === "string" && !siteId.match(/^[0-9a-f-]+$/i)) {
      // If siteId looks like a domain, resolve it
      const { data: siteData, error: siteError } = await supabase
        .from("sites")
        .select("id")
        .eq("domain", siteId)
        .single();
      
      if (siteError || !siteData) {
        return NextResponse.json([]);
      }
      
      resolvedSiteId = siteData.id;
    }

    // Get all active funnels with custom event steps for this site
    const { data: funnelSteps, error: stepsError } = await supabase
      .from("funnel_steps")
      .select(`
        id,
        funnel_id,
        step_number,
        name,
        step_type,
        event_type,
        event_config,
        funnels!inner (
          site_id,
          is_active
        )
      `)
      .eq("funnels.site_id", resolvedSiteId)
      .eq("funnels.is_active", true)
      .eq("step_type", "custom_event")
      .in("event_type", ["click", "scroll", "click_link"]);

    if (stepsError) {
      console.error("Error fetching funnel steps:", stepsError);
      return NextResponse.json([]);
    }

    // Return only the relevant step data
    const steps = (funnelSteps || []).map(step => ({
      id: step.id,
      funnel_id: step.funnel_id,
      step_number: step.step_number,
      name: step.name,
      step_type: step.step_type,
      event_type: step.event_type,
      event_config: step.event_config,
    }));

    return NextResponse.json(steps);

  } catch (error) {
    console.error("Error in funnel-steps API:", error);
    return NextResponse.json([]);
  }
}