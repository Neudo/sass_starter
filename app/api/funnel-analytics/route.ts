import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const funnelId = searchParams.get("funnelId");
    const siteId = searchParams.get("siteId");

    if (!funnelId || !siteId) {
      return NextResponse.json({ error: "Funnel ID and Site ID are required" }, { status: 400 });
    }

    // Verify site ownership
    const { data: siteData, error: siteError } = await adminClient
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single();

    if (siteError || !siteData) {
      return NextResponse.json({ error: "Site not found or unauthorized" }, { status: 404 });
    }

    // Verify funnel ownership
    const { data: funnelData, error: funnelError } = await adminClient
      .from("funnels")
      .select("id, name, description")
      .eq("id", funnelId)
      .eq("site_id", siteId)
      .single();

    if (funnelError || !funnelData) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
    }

    // Get funnel steps with their counts (simplified approach)
    const { data: steps, error: stepsError } = await adminClient
      .from("funnel_steps")
      .select(`
        id,
        step_number,
        name,
        step_type,
        event_type,
        step_count
      `)
      .eq("funnel_id", funnelId)
      .order("step_number", { ascending: true });

    if (stepsError) {
      console.error("Error fetching funnel steps:", stepsError);
      return NextResponse.json({ error: "Failed to fetch funnel steps" }, { status: 500 });
    }

    if (!steps || steps.length === 0) {
      return NextResponse.json({
        funnel: funnelData,
        steps: [],
        total_entered: 0,
        total_completed: 0,
        overall_conversion_rate: 0
      });
    }

    // Calculate analytics from step counts
    // For funnel analytics: 
    // - First step "entered" = its step_count 
    // - Subsequent steps "entered" = previous step's step_count
    // - Each step "completed" = its own step_count
    const stepsWithAnalytics = steps.map((step, index) => {
      const entered_count = index === 0 ? step.step_count : (steps[index - 1]?.step_count || 0);
      const completed_count = step.step_count || 0;
      const dropped_count = Math.max(0, entered_count - completed_count);
      const conversion_rate = entered_count > 0 ? (completed_count / entered_count) * 100 : 0;
      
      return {
        id: step.id,
        step_number: step.step_number,
        step_name: step.name,
        step_type: step.step_type,
        entered_count,
        completed_count,
        conversion_rate,
        dropped_count
      };
    });

    return NextResponse.json({
      funnel: funnelData,
      steps: stepsWithAnalytics,
      total_entered: stepsWithAnalytics[0]?.entered_count || 0,
      total_completed: stepsWithAnalytics[stepsWithAnalytics.length - 1]?.completed_count || 0,
      overall_conversion_rate: stepsWithAnalytics.length > 0 
        ? ((stepsWithAnalytics[stepsWithAnalytics.length - 1]?.completed_count || 0) / (stepsWithAnalytics[0]?.entered_count || 1)) * 100
        : 0
    });
  } catch (error) {
    console.error("Error fetching funnel analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}