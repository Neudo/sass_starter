import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface FunnelStep {
  step_number: number;
  name: string;
  step_type: string;
  unique_visitors: number;
  total_conversions: number;
  conversion_rate_from_previous: number;
  drop_off_rate_to_next: number;
  overall_conversion_rate: number;
}

interface FunnelAnalytics {
  funnel_id: string;
  funnel_name: string;
  summary: {
    total_entered: number;
    total_completed: number;
    overall_conversion_rate: number;
    total_steps: number;
    highest_drop_off_step: {
      step_number: number;
      step_name: string;
      drop_off_rate: number;
    } | null;
  };
  steps: FunnelStep[];
  time_series: {
    period: string;
    daily_conversions: Array<{
      date: string;
      steps: Array<{
        step_number: number;
        unique_visitors: number;
      }>;
    }>;
  };
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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Refresh analytics before querying (ensure up-to-date data)
    const { error: refreshError } = await adminClient.rpc('refresh_funnel_analytics');
    if (refreshError) {
      console.warn("Failed to refresh funnel analytics:", refreshError);
      // Continue anyway - use existing data
    }

    // Get comprehensive funnel analytics using our materialized view
    const { data: funnelOverview, error: overviewError } = await adminClient
      .from("funnel_overview")
      .select(`
        funnel_id,
        funnel_name,
        site_id,
        step_number,
        step_name,
        step_type,
        unique_visitors,
        total_conversions,
        conversion_rate_from_previous,
        drop_off_rate_to_next,
        overall_conversion_rate
      `)
      .eq("funnel_id", funnelId)
      .order("step_number");

    if (overviewError) {
      console.error("Error fetching funnel overview:", overviewError);
      return NextResponse.json(
        { error: "Failed to fetch funnel analytics" },
        { status: 500 }
      );
    }

    if (!funnelOverview || funnelOverview.length === 0) {
      return NextResponse.json(
        { error: "Funnel not found or no data available" },
        { status: 404 }
      );
    }

    // Verify user owns the funnel (security check since materialized view doesn't have RLS)
    const { data: funnelOwnership, error: ownershipError } = await adminClient
      .from("funnels")
      .select(`
        user_id,
        sites!inner (
          user_id
        )
      `)
      .eq("id", funnelId)
      .single();

    if (ownershipError || !funnelOwnership || funnelOwnership.user_id !== user.id) {
      return NextResponse.json(
        { error: "Funnel not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get time-based analytics (last 30 days by default)
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: timeSeriesData, error: timeSeriesError } = await adminClient
      .from("funnel_conversions")
      .select(`
        step_number,
        completed_at,
        session_id
      `)
      .eq("funnel_id", funnelId)
      .gte("completed_at", startDate.toISOString())
      .order("completed_at");

    if (timeSeriesError) {
      console.error("Time series data error:", timeSeriesError);
    }

    // Process time series data into daily buckets
    const dailyStats: Record<string, Record<number, Set<string>>> = {};
    if (timeSeriesData) {
      timeSeriesData.forEach(conversion => {
        const date = new Date(conversion.completed_at).toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = {};
        }
        if (!dailyStats[date][conversion.step_number]) {
          dailyStats[date][conversion.step_number] = new Set();
        }
        dailyStats[date][conversion.step_number].add(conversion.session_id);
      });
    }

    // Convert Sets to counts
    const dailyConversions = Object.keys(dailyStats).map(date => ({
      date,
      steps: Object.keys(dailyStats[date]).map(stepNumber => ({
        step_number: parseInt(stepNumber),
        unique_visitors: dailyStats[date][parseInt(stepNumber)].size
      }))
    }));

    // Calculate overall funnel performance metrics
    const totalEntered = funnelOverview[0]?.unique_visitors || 0;
    const totalCompleted = funnelOverview[funnelOverview.length - 1]?.unique_visitors || 0;
    const overallConversionRate = totalEntered > 0 ? (totalCompleted / totalEntered) * 100 : 0;

    // Find the step with highest drop-off
    const highestDropOffStep = funnelOverview.reduce((max, step) => {
      const stepDropOff = step.drop_off_rate_to_next || 0;
      const maxDropOff = max?.drop_off_rate_to_next || 0;
      return stepDropOff > maxDropOff ? step : max;
    }, funnelOverview[0] || null);

    const analytics: FunnelAnalytics = {
      funnel_id: funnelId,
      funnel_name: funnelOverview[0].funnel_name,
      summary: {
        total_entered: totalEntered,
        total_completed: totalCompleted,
        overall_conversion_rate: Math.round(overallConversionRate * 100) / 100,
        total_steps: funnelOverview.length,
        highest_drop_off_step: highestDropOffStep?.drop_off_rate_to_next ? {
          step_number: highestDropOffStep.step_number,
          step_name: highestDropOffStep.step_name,
          drop_off_rate: Math.round(highestDropOffStep.drop_off_rate_to_next * 100) / 100
        } : null
      },
      steps: funnelOverview.map(step => ({
        step_number: step.step_number,
        name: step.step_name,
        step_type: step.step_type,
        unique_visitors: step.unique_visitors,
        total_conversions: step.total_conversions,
        conversion_rate_from_previous: step.conversion_rate_from_previous ? 
          Math.round(step.conversion_rate_from_previous * 100) / 100 : 100,
        drop_off_rate_to_next: step.drop_off_rate_to_next ? 
          Math.round(step.drop_off_rate_to_next * 100) / 100 : 0,
        overall_conversion_rate: step.overall_conversion_rate ? 
          Math.round(step.overall_conversion_rate * 100) / 100 : 0
      })),
      time_series: {
        period: `${days}_days`,
        daily_conversions: dailyConversions.sort((a, b) => a.date.localeCompare(b.date))
      }
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error("Error fetching funnel analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch funnel analytics" },
      { status: 500 }
    );
  }
}
