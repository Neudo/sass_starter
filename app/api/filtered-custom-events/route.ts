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

    // Build session filters based on provided filters - need to include session metadata for breakdowns
    let sessionQuery = adminClient
      .from("sessions")
      .select("id, utm_source, referrer_domain, country")
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

    // Create a map of session metadata for breakdowns
    const sessionMetadata = new Map();
    filteredSessions?.forEach((session) => {
      sessionMetadata.set(session.id, {
        utm_source: session.utm_source,
        referrer_domain: session.referrer_domain,
        country: session.country,
      });
    });

    if (sessionIds.length === 0) {
      // No sessions match the criteria, return empty results
      return NextResponse.json([]);
    }

    // Fetch custom events with completions from filtered sessions
    const { data: customEventsRaw, error: eventsError } = await adminClient
      .from("custom_events")
      .select(
        `
        id,
        name,
        description,
        event_type,
        event_selector,
        trigger_config,
        is_active,
        created_at,
        custom_event_completions!inner (
          id,
          created_at,
          metadata,
          session_id
        )
      `
      )
      .eq("site_id", siteData.id)
      .in("custom_event_completions.session_id", sessionIds);

    if (eventsError) {
      return NextResponse.json(
        { error: "Error fetching custom events" },
        { status: 500 }
      );
    }

    // Transform and aggregate the data with breakdowns
    const customEvents = (customEventsRaw || []).map((event: any) => {
      const completions = event.custom_event_completions || [];
      const totalTriggers = completions.length;

      // Aggregate metadata for sources and countries from session data
      const sourceStats: Record<string, number> = {};
      const countryStats: Record<string, number> = {};

      completions.forEach((completion: any) => {
        const sessionMeta = sessionMetadata.get(completion.session_id);
        if (sessionMeta) {
          // Determine source (prioritize utm_source, then referrer_domain, then direct)
          const source =
            sessionMeta.utm_source || sessionMeta.referrer_domain || "direct";
          const country = sessionMeta.country || "unknown";

          sourceStats[source] = (sourceStats[source] || 0) + 1;
          countryStats[country] = (countryStats[country] || 0) + 1;
        }
      });

      // Convert to percentage arrays, sorted by count
      const sourceBreakdown = Object.entries(sourceStats)
        .sort(([, a], [, b]) => b - a)
        .map(([source, count]) => ({
          source,
          count,
          percentage:
            totalTriggers > 0 ? Math.round((count / totalTriggers) * 100) : 0,
        }));

      const countryBreakdown = Object.entries(countryStats)
        .sort(([, a], [, b]) => b - a)
        .map(([country, count]) => ({
          country,
          count,
          percentage:
            totalTriggers > 0 ? Math.round((count / totalTriggers) * 100) : 0,
        }));

      return {
        id: event.id,
        name: event.name,
        description: event.description,
        event_type: event.event_type,
        event_selector: event.event_selector,
        trigger_config: event.trigger_config,
        is_active: event.is_active,
        created_at: event.created_at,
        completions_count: totalTriggers,
        total_triggers: totalTriggers, // For compatibility
        unique_sessions_count: new Set(
          completions.map((c: any) => c.session_id)
        ).size,
        source_breakdown: sourceBreakdown,
        country_breakdown: countryBreakdown,
        custom_event_completions: completions,
      };
    });

    return NextResponse.json(customEvents);
  } catch (error) {
    console.error("Error in filtered-custom-events:", error);
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
