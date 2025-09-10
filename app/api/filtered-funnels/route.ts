/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

interface FilterCondition {
  type: string;
  value: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { siteId, dateRange, filters = [] } = body;

    if (!siteId) {
      return NextResponse.json(
        { error: "Site ID is required" },
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

    // Build session filters based on provided filters
    let sessionQuery = adminClient
      .from("sessions")
      .select("id")
      .eq("site_id", siteData.id);

    // Apply date filters
    if (dateRange?.from && dateRange?.to) {
      sessionQuery = sessionQuery
        .gte("created_at", dateRange.from)
        .lte("created_at", dateRange.to);
    }

    // Apply other filters
    filters.forEach((filter: FilterCondition) => {
      switch (filter.type) {
        case "country":
          sessionQuery = sessionQuery.eq("country", filter.value);
          break;
        case "region":
          sessionQuery = sessionQuery.eq("region", filter.value);
          break;
        case "city":
          sessionQuery = sessionQuery.eq("city", filter.value);
          break;
        case "browser":
          sessionQuery = sessionQuery.eq("browser", filter.value);
          break;
        case "os":
          sessionQuery = sessionQuery.eq("os", filter.value);
          break;
        case "screen_size":
          sessionQuery = sessionQuery.eq("screen_size", filter.value);
          break;
        case "utm_source":
          sessionQuery = sessionQuery.eq("utm_source", filter.value);
          break;
        case "utm_medium":
          sessionQuery = sessionQuery.eq("utm_medium", filter.value);
          break;
        case "utm_campaign":
          sessionQuery = sessionQuery.eq("utm_campaign", filter.value);
          break;
        case "referrer_domain":
          sessionQuery = sessionQuery.eq("referrer_domain", filter.value);
          break;
        // Add more filter types as needed
      }
    });

    const { data: filteredSessions, error: sessionError } = await sessionQuery;

    if (sessionError) {
      return NextResponse.json(
        { error: "Error filtering sessions" },
        { status: 500 }
      );
    }

    const sessionIds = filteredSessions?.map((s) => s.id) || [];

    if (sessionIds.length === 0) {
      // No sessions match the criteria, return empty results
      return NextResponse.json([]);
    }

    // Fetch funnels with steps and completions from filtered sessions
    const { data: funnelsRaw, error: funnelsError } = await adminClient
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
          step_type,
          url_pattern,
          match_type,
          event_type,
          event_config,
          funnel_step_completions!inner (
            id,
            session_id,
            completed_at,
            metadata
          )
        )
      `
      )
      .eq("site_id", siteData.id)
      .eq("is_active", true)
      .in("funnel_steps.funnel_step_completions.session_id", sessionIds);

    if (funnelsError) {
      return NextResponse.json(
        { error: "Error fetching funnels" },
        { status: 500 }
      );
    }

    // Transform and aggregate the funnel data
    const funnels = (funnelsRaw || []).map((funnel: any) => {
      const steps = (funnel.funnel_steps || [])
        .map((step: any) => {
          // Filter completions to only include sessions from our filtered set
          const filteredCompletions = (
            step.funnel_step_completions || []
          ).filter((completion: any) =>
            sessionIds.includes(completion.session_id)
          );

          return {
            id: step.id,
            step_number: step.step_number,
            name: step.name,
            step_type: step.step_type,
            url_pattern: step.url_pattern,
            match_type: step.match_type,
            event_type: step.event_type,
            event_config: step.event_config,
            completions_count: filteredCompletions.length,
            unique_sessions_count: new Set(
              filteredCompletions.map((c: any) => c.session_id)
            ).size,
            funnel_step_completions: filteredCompletions,
          };
        })
        .sort((a: any, b: any) => a.step_number - b.step_number);

      return {
        id: funnel.id,
        name: funnel.name,
        description: funnel.description,
        is_active: funnel.is_active,
        created_at: funnel.created_at,
        funnel_steps: steps,
      };
    });

    return NextResponse.json(funnels);
  } catch (error) {
    console.error("Error in filtered-funnels:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
