import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const funnelId = searchParams.get("funnelId");
    const siteId = searchParams.get("siteId");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    if (!funnelId || !siteId) {
      return NextResponse.json(
        { error: "Funnel ID and Site ID are required" },
        { status: 400 }
      );
    }

    // Verify site ownership
    const { data: siteData, error: siteError } = await adminClient
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single();

    if (siteError || !siteData) {
      return NextResponse.json(
        { error: "Site not found or unauthorized" },
        { status: 404 }
      );
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

    // Get funnel steps
    const { data: steps, error: stepsError } = await adminClient
      .from("funnel_steps")
      .select(
        `
        id,
        step_number,
        name,
        step_type,
        event_type
      `
      )
      .eq("funnel_id", funnelId)
      .order("step_number", { ascending: true });

    if (stepsError) {
      console.error("Error fetching funnel steps:", stepsError);
      return NextResponse.json(
        { error: "Failed to fetch funnel steps" },
        { status: 500 }
      );
    }

    if (!steps || steps.length === 0) {
      return NextResponse.json({
        funnel: funnelData,
        steps: [],
        total_entered: 0,
        total_completed: 0,
        overall_conversion_rate: 0,
      });
    }

    // Get unique sessions that completed each step with date filtering
    const stepsWithAnalytics = await Promise.all(
      steps.map(async (step) => {
        let completionsQuery = adminClient
          .from("funnel_step_completions")
          .select("session_id")
          .eq("step_id", step.id);

        // Apply date filters if provided
        if (fromDate && toDate) {
          completionsQuery = completionsQuery
            .gte("completed_at", fromDate)
            .lte("completed_at", toDate);
        }

        const { data: completions } = await completionsQuery;

        // Count unique sessions that completed this step
        const uniqueSessions = new Set(
          completions?.map((c) => c.session_id) || []
        );
        const completed_count = uniqueSessions.size;

        return {
          id: step.id,
          step_number: step.step_number,
          step_name: step.name,
          step_type: step.step_type,
          completed_count,
          unique_sessions: uniqueSessions, // Temporary for calculation
        };
      })
    );

    // Calculate funnel analytics properly
    // For a true funnel, we need to track sessions that progress through ALL previous steps
    const finalStepsWithAnalytics = stepsWithAnalytics.map((step, index) => {
      let entered_count = 0;

      if (index === 0) {
        // First step: all sessions that completed it are considered "entered"
        entered_count = step.completed_count;
      } else {
        // For subsequent steps: count sessions that completed ALL previous steps
        // This is the proper funnel logic - progressive filtering
        const previousStepSessions =
          stepsWithAnalytics[index - 1].unique_sessions;
        entered_count = previousStepSessions.size;
      }

      const completed_count = step.completed_count;
      const dropped_count = Math.max(0, entered_count - completed_count);

      // Conversion rate relative to those who entered this specific step
      const step_conversion_rate =
        entered_count > 0 ? (completed_count / entered_count) * 100 : 0;

      // Conversion rate relative to the very first step (overall funnel conversion)
      const firstStepCount = stepsWithAnalytics[0]?.completed_count || 0;
      const overall_conversion_rate =
        firstStepCount > 0 ? (completed_count / firstStepCount) * 100 : 0;

      return {
        id: step.id,
        step_number: step.step_number,
        step_name: step.step_name,
        step_type: step.step_type,
        entered_count,
        completed_count,
        dropped_count,
        conversion_rate: step_conversion_rate, // Step-to-step conversion
        overall_conversion_rate, // From first step
      };
    });

    return NextResponse.json({
      funnel: funnelData,
      steps: finalStepsWithAnalytics,
      total_entered: finalStepsWithAnalytics[0]?.entered_count || 0,
      total_completed:
        finalStepsWithAnalytics[finalStepsWithAnalytics.length - 1]
          ?.completed_count || 0,
      overall_conversion_rate:
        finalStepsWithAnalytics.length > 0
          ? ((finalStepsWithAnalytics[finalStepsWithAnalytics.length - 1]
              ?.completed_count || 0) /
              (finalStepsWithAnalytics[0]?.entered_count || 1)) *
            100
          : 0,
    });
  } catch (error) {
    console.error("Error fetching funnel analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
