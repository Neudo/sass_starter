/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function topBreakdowns(
  completions: any[],
  sessionsById: Map<string, any>
): {
  source_breakdown: Array<{ source: string; count: number; percentage: number }>;
  country_breakdown: Array<{ country: string; count: number; percentage: number }>;
} {
  const sourceCounts: Record<string, number> = {};
  const countryCounts: Record<string, number> = {};

  completions.forEach((completion) => {
    const session = sessionsById.get(completion.session_id);
    if (!session) return;

    const source = session.referrer || session.referrer_domain || "Direct";
    const country = session.country || "Unknown";
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });

  const total = completions.length || 1;

  return {
    source_breakdown: Object.entries(sourceCounts)
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3),
    country_breakdown: Object.entries(countryCounts)
      .map(([country, count]) => ({
        country,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3),
  };
}

export async function GET(request: NextRequest) {
  try {
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

    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId is required" },
        { status: 400 }
      );
    }

    // Verify site ownership and get domain
    const { data: site, error: siteError } = await adminClient
      .from("sites")
      .select("id, domain")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: "Site not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get funnels with their steps and completion counts based on date filter
    const { data: funnels, error: funnelsError } = await adminClient
      .from("funnels")
      .select(
        `
        id,
        name,
        description,
        is_active,
        created_at,
        funnel_steps!inner (
          id,
          step_number,
          name,
          url_pattern,
          match_type
        )
      `
      )
      .eq("site_id", siteId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (funnelsError) {
      throw funnelsError;
    }

    const allSteps = ((funnels || []) as any[]).flatMap((funnel) =>
      (funnel.funnel_steps || []).map((step: any) => step)
    );
    const stepIds = allSteps.map((step) => step.id);
    let completions: any[] = [];

    if (stepIds.length > 0) {
      let completionsQuery = adminClient
        .from("funnel_step_completions")
        .select("id, step_id, session_id")
        .in("step_id", stepIds)
        .eq("site_domain", site.domain);

      if (fromDate && toDate) {
        completionsQuery = completionsQuery
          .gte("completed_at", fromDate)
          .lte("completed_at", toDate);
      }

      const { data: completionsData, error: completionsError } =
        await completionsQuery;

      if (completionsError) {
        throw completionsError;
      }

      completions = completionsData || [];
    }

    const sessionIds = [
      ...new Set(completions.map((completion) => completion.session_id).filter(Boolean)),
    ];
    const { data: sessions } =
      sessionIds.length > 0
        ? await adminClient
            .from("sessions")
            .select("id, referrer, referrer_domain, country")
            .in("id", sessionIds)
        : { data: [] };
    const sessionsById = new Map(
      ((sessions || []) as any[]).map((session) => [session.id, session])
    );
    const completionsByStepId = new Map<string, any[]>();

    completions.forEach((completion) => {
      const stepCompletions = completionsByStepId.get(completion.step_id) || [];
      stepCompletions.push(completion);
      completionsByStepId.set(completion.step_id, stepCompletions);
    });

    const funnelsWithAnalytics = ((funnels || []) as any[]).map((funnel) => {
      const steps = (funnel.funnel_steps || []).sort(
        (a: any, b: any) => a.step_number - b.step_number
      );
      const stepsWithData = steps.map((step: any) => {
        const stepCompletions = completionsByStepId.get(step.id) || [];
        return {
          ...step,
          visitors: stepCompletions.length,
          ...topBreakdowns(stepCompletions, sessionsById),
        };
      });
      const firstStepVisitors = stepsWithData[0]?.visitors || 0;
      const stepsWithRates = stepsWithData.map((step: any) => ({
        ...step,
        conversion_rate:
          firstStepVisitors > 0 ? (step.visitors / firstStepVisitors) * 100 : 0,
      }));
      const completedVisitors =
        stepsWithRates[stepsWithRates.length - 1]?.visitors || 0;

      return {
        ...funnel,
        steps: stepsWithRates,
        total_visitors: firstStepVisitors,
        conversion_rate:
          firstStepVisitors > 0
            ? (completedVisitors / firstStepVisitors) * 100
            : 0,
      };
    });

    return NextResponse.json(funnelsWithAnalytics);
  } catch (error) {
    console.error("Error fetching funnels:", error);
    return NextResponse.json(
      { error: "Failed to fetch funnels" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { siteId, name, description, steps } = body;

    if (
      !siteId ||
      !name ||
      !steps ||
      !Array.isArray(steps) ||
      steps.length === 0
    ) {
      return NextResponse.json(
        { error: "siteId, name, and steps are required" },
        { status: 400 }
      );
    }

    // Verify site ownership
    const { data: site, error: siteError } = await adminClient
      .from("sites")
      .select("id")
      .eq("id", siteId)
      .eq("user_id", user.id)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: "Site not found or unauthorized" },
        { status: 404 }
      );
    }

    // Create funnel
    const { data: funnel, error: funnelError } = await adminClient
      .from("funnels")
      .insert({
        user_id: user.id,
        site_id: siteId,
        name,
        description,
        is_active: true,
      })
      .select()
      .single();

    if (funnelError) {
      console.error("Funnel creation error:", funnelError);
      throw funnelError;
    }

    // Create funnel steps
    const stepsToInsert = steps.map((step: any, index: number) => ({
      funnel_id: funnel.id,
      step_number: index + 1,
      name: step.name,
      step_type: step.step_type || "page_view",
      url_pattern: step.url_pattern,
      match_type: step.match_type || "exact",
      event_type: step.event_type,
      event_config: step.event_config,
    }));

    const { error: stepsError } = await adminClient
      .from("funnel_steps")
      .insert(stepsToInsert);

    if (stepsError) {
      // Rollback: delete the funnel if steps creation failed
      await adminClient.from("funnels").delete().eq("id", funnel.id);
      throw stepsError;
    }

    return NextResponse.json({
      success: true,
      funnel: {
        ...funnel,
        steps: stepsToInsert,
      },
    });
  } catch (error) {
    console.error("Error creating funnel:", error);
    return NextResponse.json(
      { error: "Failed to create funnel" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { funnelId, name, description, isActive, steps } = body;

    if (
      !funnelId ||
      !name ||
      !steps ||
      !Array.isArray(steps) ||
      steps.length === 0
    ) {
      return NextResponse.json(
        { error: "funnelId, name, and steps are required" },
        { status: 400 }
      );
    }

    // Verify funnel ownership
    const { data: funnel, error: funnelError } = await adminClient
      .from("funnels")
      .select("id")
      .eq("id", funnelId)
      .eq("user_id", user.id)
      .single();

    if (funnelError || !funnel) {
      return NextResponse.json(
        { error: "Funnel not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update the funnel
    const { error: updateError } = await adminClient
      .from("funnels")
      .update({
        name,
        description,
        is_active: isActive,
      })
      .eq("id", funnelId);

    if (updateError) {
      console.error("Funnel update error:", updateError);
      throw updateError;
    }

    // Delete existing steps
    const { error: deleteError } = await adminClient
      .from("funnel_steps")
      .delete()
      .eq("funnel_id", funnelId);

    if (deleteError) {
      console.error("Steps delete error:", deleteError);
      throw deleteError;
    }

    // Insert new steps
    const stepsToInsert = steps.map((step: any, index: number) => ({
      funnel_id: funnelId,
      step_number: index + 1,
      name: step.name,
      step_type: step.step_type || "page_view",
      url_pattern: step.url_pattern,
      match_type: step.match_type || "exact",
      event_type: step.event_type,
      event_config: step.event_config,
    }));

    const { error: stepsError } = await adminClient
      .from("funnel_steps")
      .insert(stepsToInsert);

    if (stepsError) {
      console.error("Steps insert error:", stepsError);
      throw stepsError;
    }

    return NextResponse.json({
      success: true,
      message: "Funnel updated successfully",
    });
  } catch (error) {
    console.error("Error updating funnel:", error);
    return NextResponse.json(
      { error: "Failed to update funnel" },
      { status: 500 }
    );
  }
}
