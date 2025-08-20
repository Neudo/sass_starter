import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface FunnelStep {
  step_number: number;
  name: string;
  url_pattern: string;
  total_sessions: number;
  conversion_rate: number;
}

interface FunnelAnalytics {
  funnel_id: string;
  funnel_name: string;
  total_sessions_entered: number;
  completed_sessions: number;
  overall_conversion_rate: number;
  steps: FunnelStep[];
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ funnelId: string }> }
) {
  try {
    const { funnelId } = await context.params;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get funnel details and verify ownership
    const { data: funnel, error: funnelError } = await adminClient
      .from("funnels")
      .select(
        `
        id,
        name,
        site_id,
        sites!inner (
          user_id
        ),
        funnel_steps (
          step_number,
          name,
          url_pattern,
          match_type
        )
      `
      )
      .eq("id", funnelId)
      .single();

    if (funnelError || !funnel || funnel.sites[0]?.user_id !== user.id) {
      return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
    }

    // Get date range from query params (default to last 30 days)
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get conversion data for this funnel
    const { data: conversions, error: conversionsError } = await adminClient
      .from("funnel_conversions")
      .select("session_id, step_number, completed_at")
      .eq("funnel_id", funnelId)
      .gte("completed_at", startDate.toISOString());

    if (conversionsError) {
      console.error("Error fetching conversions:", conversionsError);
      return NextResponse.json(
        { error: "Failed to fetch analytics data" },
        { status: 500 }
      );
    }

    // Process the conversion data
    const sessionSteps = new Map<string, Set<number>>();

    // Group conversions by session
    conversions?.forEach((conversion) => {
      if (!sessionSteps.has(conversion.session_id)) {
        sessionSteps.set(conversion.session_id, new Set());
      }
      sessionSteps.get(conversion.session_id)?.add(conversion.step_number);
    });

    // Calculate analytics for each step
    const steps: FunnelStep[] = funnel.funnel_steps
      .sort((a, b) => a.step_number - b.step_number)
      .map((step, index) => {
        // Count sessions that reached this step
        let sessionsReachedThisStep = 0;
        sessionSteps.forEach((stepNumbers) => {
          if (stepNumbers.has(step.step_number)) {
            sessionsReachedThisStep++;
          }
        });

        // Calculate conversion rate (vs previous step, or vs total for first step)
        let conversionRate = 0;
        if (index === 0) {
          // First step - conversion rate is 100% of sessions that entered
          conversionRate = sessionsReachedThisStep > 0 ? 100 : 0;
        } else {
          // Subsequent steps - conversion rate vs previous step
          const previousStep = funnel.funnel_steps.find(
            (s) => s.step_number === step.step_number - 1
          );
          if (previousStep) {
            let sessionsReachedPreviousStep = 0;
            sessionSteps.forEach((stepNumbers) => {
              if (stepNumbers.has(previousStep.step_number)) {
                sessionsReachedPreviousStep++;
              }
            });

            conversionRate =
              sessionsReachedPreviousStep > 0
                ? (sessionsReachedThisStep / sessionsReachedPreviousStep) * 100
                : 0;
          }
        }

        return {
          step_number: step.step_number,
          name: step.name,
          url_pattern: step.url_pattern,
          total_sessions: sessionsReachedThisStep,
          conversion_rate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places
        };
      });

    // Calculate overall metrics
    const totalSessionsEntered = steps.length > 0 ? steps[0].total_sessions : 0;
    const lastStep = steps[steps.length - 1];
    const completedSessions = lastStep ? lastStep.total_sessions : 0;
    const overallConversionRate =
      totalSessionsEntered > 0
        ? (completedSessions / totalSessionsEntered) * 100
        : 0;

    const analytics: FunnelAnalytics = {
      funnel_id: funnel.id,
      funnel_name: funnel.name,
      total_sessions_entered: totalSessionsEntered,
      completed_sessions: completedSessions,
      overall_conversion_rate: Math.round(overallConversionRate * 100) / 100,
      steps,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Funnel analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch funnel analytics" },
      { status: 500 }
    );
  }
}
