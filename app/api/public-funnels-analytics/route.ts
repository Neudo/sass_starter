/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emptyCorsResponse, jsonCorsResponse } from "@/lib/api/http";
import { getSiteByDomain } from "@/lib/api/sites";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, stale-while-revalidate=300",
};

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
    if (!session) {
      return;
    }

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
  const origin = request.headers.get("origin");
  const searchParams = request.nextUrl.searchParams;
  const siteDomain = searchParams.get("domain");
  const fromDate = searchParams.get("from");
  const toDate = searchParams.get("to");

  if (!siteDomain) {
    return jsonCorsResponse({ error: "Domain is required" }, { status: 400 }, origin);
  }

  try {
    const site = await getSiteByDomain(siteDomain, { publicOnly: true });
    if (!site) {
      return jsonCorsResponse([], { headers: CACHE_HEADERS }, origin);
    }

    const adminClient = createAdminClient();
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
      .eq("site_id", site.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (funnelsError) {
      console.error("Error fetching funnels:", funnelsError);
      return jsonCorsResponse([], { headers: CACHE_HEADERS }, origin);
    }

    const allSteps = ((funnels || []) as any[]).flatMap((funnel) =>
      (funnel.funnel_steps || []).map((step: any) => ({
        ...step,
        funnel_id: funnel.id,
      }))
    );
    const stepIds = allSteps.map((step) => step.id);

    let completions: any[] = [];
    if (stepIds.length > 0) {
      let completionsQuery = adminClient
        .from("funnel_step_completions")
        .select("id, step_id, session_id")
        .in("step_id", stepIds);

      if (fromDate && toDate) {
        completionsQuery = completionsQuery
          .gte("completed_at", fromDate)
          .lte("completed_at", toDate);
      }

      const { data, error } = await completionsQuery;
      if (error) {
        console.error("Error fetching funnel completions:", error);
        return jsonCorsResponse([], { headers: CACHE_HEADERS }, origin);
      }
      completions = data || [];
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

    return jsonCorsResponse(funnelsWithAnalytics, { headers: CACHE_HEADERS }, origin);
  } catch (error) {
    console.error("Error fetching public funnels analytics:", error);
    return jsonCorsResponse([], { headers: CACHE_HEADERS }, origin);
  }
}

export async function OPTIONS(request: NextRequest) {
  return emptyCorsResponse(200, request.headers.get("origin"));
}
