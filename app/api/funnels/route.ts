import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId is required" },
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

    // Get funnels with their steps including step_count
    const { data: funnels, error: funnelsError } = await adminClient
      .from("funnels")
      .select(
        `
        id,
        name,
        description,
        is_active,
        created_at,
        funnel_steps (
          id,
          step_number,
          name,
          url_pattern,
          match_type,
          step_count
        )
      `
      )
      .eq("site_id", siteId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (funnelsError) {
      throw funnelsError;
    }

    // Calculate funnel analytics for each funnel using step_count
    const funnelsWithAnalytics = (funnels || []).map((funnel) => {
      const steps = (funnel.funnel_steps || []).sort(
        (a, b) => a.step_number - b.step_number
      );

      // Calculate visitors and conversion rates using step_count
      const stepsWithData = steps.map((step) => {
        const visitors = step.step_count || 0;

        // Calculate conversion rate relative to first step
        const firstStepVisitors =
          steps.length > 0 ? steps[0].step_count || 0 : 0;
        const conversionRate =
          firstStepVisitors > 0 ? (visitors / firstStepVisitors) * 100 : 0;

        return {
          ...step,
          visitors,
          conversion_rate: conversionRate,
        };
      });

      // Calculate overall funnel conversion rate
      const totalVisitors = stepsWithData[0]?.visitors || 0;
      const completedVisitors =
        stepsWithData[stepsWithData.length - 1]?.visitors || 0;
      const overallConversionRate =
        totalVisitors > 0 ? (completedVisitors / totalVisitors) * 100 : 0;

      return {
        ...funnel,
        steps: stepsWithData,
        total_visitors: totalVisitors,
        conversion_rate: overallConversionRate,
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
      throw funnelError;
    }

    // Create funnel steps
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stepsToInsert = steps.map((step: any, index: number) => ({
      funnel_id: funnel.id,
      step_number: index + 1,
      name: step.name,
      url_pattern: step.url_pattern,
      match_type: step.match_type || "exact",
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
