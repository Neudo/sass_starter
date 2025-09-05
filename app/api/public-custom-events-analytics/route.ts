/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient();

    const { searchParams } = new URL(request.url);
    const siteDomain = searchParams.get("domain");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");
    const isRealtime = searchParams.get("realtime") === "true";

    if (!siteDomain) {
      return NextResponse.json([]);
    }

    // Normalize domain - handle both with and without www
    const domainVariants = [siteDomain];
    if (siteDomain.startsWith("www.")) {
      domainVariants.push(siteDomain.substring(4));
    } else {
      domainVariants.push(`www.${siteDomain}`);
    }

    // Find site by domain and verify public access is enabled
    const { data: sites, error: siteError } = await adminClient
      .from("sites")
      .select("id, public_enabled")
      .in("domain", domainVariants);

    const siteData = sites && sites.length > 0 ? sites[0] : null;

    if (siteError || !siteData || !siteData.public_enabled) {
      return NextResponse.json([]);
    }

    // Check if custom_event_completions table exists and fetch accordingly
    let customEventsRaw: any[] = [];
    let error: any = null;

    try {
      // Try to fetch with completions
      let completionsQuery = adminClient
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
          custom_event_completions!left (
            id,
            created_at,
            metadata
          )
        `
        )
        .eq("site_id", siteData.id)
        .eq("is_active", true);

      // Apply date filters if provided
      if (isRealtime) {
        // For realtime mode, get completions from the last 30 minutes
        const thirtyMinutesAgo = new Date(
          Date.now() - 30 * 60 * 1000
        ).toISOString();
        completionsQuery = completionsQuery.gte(
          "custom_event_completions.created_at",
          thirtyMinutesAgo
        );
      } else if (fromDate && toDate) {
        completionsQuery = completionsQuery
          .gte("custom_event_completions.created_at", fromDate)
          .lte("custom_event_completions.created_at", toDate);
      }

      const result = await completionsQuery;
      customEventsRaw = result.data || [];
      error = result.error;
    } catch (e) {
      // If table doesn't exist, fallback to simple query
      console.log("Fallback to simple custom events query", e);
      const { data: simpleEvents, error: simpleError } = await adminClient
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
          created_at
        `
        )
        .eq("site_id", siteData.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      customEventsRaw = (simpleEvents || []).map((event) => ({
        ...event,
        custom_event_completions: [],
      }));
      error = simpleError;
    }

    if (error) {
      console.error("Error fetching custom events:", error);
      return NextResponse.json([]);
    }

    // Process data to calculate stats and aggregate metadata
    const customEventsWithStats = (customEventsRaw || []).map((event) => {
      const completions = event.custom_event_completions || [];
      const totalTriggers = completions.length;

      // Aggregate metadata for sources and countries
      const sourceStats: Record<string, number> = {};
      const countryStats: Record<string, number> = {};

      completions.forEach((completion: any) => {
        const metadata = completion.metadata || {};
        const source = metadata.source || "direct";
        const country = metadata.country || "unknown";

        sourceStats[source] = (sourceStats[source] || 0) + 1;
        countryStats[country] = (countryStats[country] || 0) + 1;
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
        total_triggers: totalTriggers,
        source_breakdown: sourceBreakdown,
        country_breakdown: countryBreakdown,
      };
    });

    // Also fetch events that have no completions in the date range
    const { data: allEvents, error: allEventsError } = await adminClient
      .from("custom_events")
      .select(
        "id, name, description, event_type, event_selector, trigger_config, is_active, created_at"
      )
      .eq("site_id", siteData.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (allEventsError) {
      console.error("Error fetching all events:", allEventsError);
      return NextResponse.json([]);
    }

    // Merge events, ensuring all events are included
    const eventMap = new Map();

    // First add events with completions
    customEventsWithStats.forEach((event) => {
      eventMap.set(event.id, event);
    });

    // Then add events without completions
    allEvents?.forEach((event) => {
      if (!eventMap.has(event.id)) {
        eventMap.set(event.id, {
          ...event,
          total_triggers: 0,
          source_breakdown: [],
          country_breakdown: [],
        });
      }
    });

    const finalEventsArray = Array.from(eventMap.values());

    return NextResponse.json(finalEventsArray);
  } catch (error) {
    console.error("Error fetching public custom events analytics:", error);
    return NextResponse.json([]);
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
