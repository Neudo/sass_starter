/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const siteParam = searchParams.get("siteId");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    if (!siteParam) {
      return NextResponse.json(
        { error: "Site ID is required" },
        { status: 400 }
      );
    }

    // Verify site ownership - siteParam could be either domain or UUID
    let siteQuery = adminClient
      .from("sites")
      .select("id")
      .eq("user_id", user.id);

    // Check if it looks like a UUID (contains hyphens) or domain
    if (siteParam.includes("-") && siteParam.length > 30) {
      siteQuery = siteQuery.eq("id", siteParam);
    } else {
      // For domain, also handle localhost
      siteQuery = siteQuery.eq("domain", siteParam);
    }

    const { data: siteData, error: siteError } = await siteQuery.single();

    if (siteError || !siteData) {
      return NextResponse.json(
        { error: "Site not found or unauthorized" },
        { status: 404 }
      );
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
        .eq("site_id", siteData.id);

      // Apply date filters if provided
      if (fromDate && toDate) {
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
        .order("created_at", { ascending: false });

      customEventsRaw = (simpleEvents || []).map((event) => ({
        ...event,
        custom_event_completions: [],
      }));
      error = simpleError;
    }

    if (error) {
      console.error("Error fetching custom events:", error);
      return NextResponse.json(
        { error: "Failed to fetch custom events" },
        { status: 500 }
      );
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
      .order("created_at", { ascending: false });

    if (allEventsError) {
      console.error("Error fetching all events:", allEventsError);
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: 500 }
      );
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
    console.error("Error fetching custom events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      event_type,
      event_selector,
      trigger_config,
      site_id,
    } = body;

    if (!name || !event_type || !site_id) {
      return NextResponse.json(
        { error: "Name, event type, and site ID are required" },
        { status: 400 }
      );
    }

    // Verify site ownership
    const { data: siteData, error: siteError } = await adminClient
      .from("sites")
      .select("id")
      .eq("id", site_id)
      .eq("user_id", user.id)
      .single();

    if (siteError || !siteData) {
      return NextResponse.json(
        { error: "Site not found or unauthorized" },
        { status: 404 }
      );
    }

    // Create custom event
    const { data: newEvent, error } = await adminClient
      .from("custom_events")
      .insert({
        name,
        description: description || null,
        event_type,
        event_selector: event_selector || null,
        trigger_config: trigger_config || {},
        site_id,
        user_id: user.id,
      })
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
      .single();

    if (error) {
      console.error("Error creating custom event:", error);
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { error: "An event with this name already exists for this site" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create custom event" },
        { status: 500 }
      );
    }

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating custom event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
