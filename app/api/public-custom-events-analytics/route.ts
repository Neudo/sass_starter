/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";
import { emptyCorsResponse, jsonCorsResponse } from "@/lib/api/http";
import { getSiteByDomain } from "@/lib/api/sites";

function cacheHeaders(isRealtime: boolean) {
  return {
    "Cache-Control": isRealtime
      ? "public, max-age=15, stale-while-revalidate=30"
      : "public, max-age=300, stale-while-revalidate=300",
  };
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const searchParams = request.nextUrl.searchParams;
  const siteDomain = searchParams.get("domain");
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");
  const isRealtime = searchParams.get("realtime") === "true";
  const headers = cacheHeaders(isRealtime);

  if (!siteDomain) {
    return jsonCorsResponse([], { headers }, origin);
  }

  try {
    const site = await getSiteByDomain(siteDomain, { publicOnly: true });
    if (!site) {
      return jsonCorsResponse([], { headers }, origin);
    }

    const adminClient = createAdminClient();
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
      .eq("site_id", site.id)
      .eq("is_active", true);

    if (isRealtime) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      completionsQuery = completionsQuery.gte(
        "custom_event_completions.created_at",
        thirtyMinutesAgo
      );
    } else if (fromDate && toDate) {
      completionsQuery = completionsQuery
        .gte("custom_event_completions.created_at", fromDate)
        .lte("custom_event_completions.created_at", toDate);
    }

    const [{ data: customEventsRaw, error }, { data: allEvents, error: allEventsError }] =
      await Promise.all([
        completionsQuery,
        adminClient
          .from("custom_events")
          .select(
            "id, name, description, event_type, event_selector, trigger_config, is_active, created_at"
          )
          .eq("site_id", site.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
      ]);

    if (error || allEventsError) {
      console.error("Error fetching public custom events analytics:", {
        completions: error,
        allEvents: allEventsError,
      });
      return jsonCorsResponse([], { headers }, origin);
    }

    const customEventsWithStats = ((customEventsRaw || []) as any[]).map(
      (event: any) => {
        const completions = event.custom_event_completions || [];
        const totalTriggers = completions.length;
        const sourceStats: Record<string, number> = {};
        const countryStats: Record<string, number> = {};

        completions.forEach((completion: any) => {
          const metadata = completion.metadata || {};
          const source = metadata.source || "direct";
          const country = metadata.country || "unknown";

          sourceStats[source] = (sourceStats[source] || 0) + 1;
          countryStats[country] = (countryStats[country] || 0) + 1;
        });

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
      }
    );

    const eventMap = new Map<string, any>();

    customEventsWithStats.forEach((event: any) => {
      eventMap.set(event.id, event);
    });

    ((allEvents || []) as any[]).forEach((event: any) => {
      if (!eventMap.has(event.id)) {
        eventMap.set(event.id, {
          ...event,
          total_triggers: 0,
          source_breakdown: [],
          country_breakdown: [],
        });
      }
    });

    return jsonCorsResponse(Array.from(eventMap.values()), { headers }, origin);
  } catch (error) {
    console.error("Error fetching public custom events analytics:", error);
    return jsonCorsResponse([], { headers }, origin);
  }
}

export async function OPTIONS(request: NextRequest) {
  return emptyCorsResponse(200, request.headers.get("origin"));
}
