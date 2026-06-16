import { NextRequest, NextResponse } from "next/server";
import { canReadAnalytics } from "@/lib/api/analytics-access";
import { createAdminClient } from "@/lib/supabase/admin";

function parseDateParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 100);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");

  if (!siteId) {
    return NextResponse.json({ error: "Missing siteId" }, { status: 400 });
  }

  const from = parseDateParam(searchParams, "from");
  const to = parseDateParam(searchParams, "to");
  const previousFrom = parseDateParam(searchParams, "previousFrom");
  const previousTo = parseDateParam(searchParams, "previousTo");

  if (
    [from, to, previousFrom, previousTo].some((value) => value === undefined)
  ) {
    return NextResponse.json(
      { error: "Invalid date parameter" },
      { status: 400 }
    );
  }

  const access = await canReadAnalytics({
    siteId,
    isPublic: searchParams.get("public") === "true",
  });

  if (!access.allowed) {
    return NextResponse.json(
      { error: access.error },
      { status: access.status }
    );
  }

  const { data, error } = await createAdminClient().rpc(
    "get_analytics_overview",
    {
      p_site_id: siteId,
      p_from: from,
      p_to: to,
      p_previous_from: previousFrom,
      p_previous_to: previousTo,
    }
  );

  if (error) {
    console.error("get_analytics_overview failed:", error);
    return NextResponse.json(
      { error: "Could not load analytics overview" },
      { status: 500 }
    );
  }

  const metrics = data?.metrics ?? {};
  const previousMetrics = data?.previousMetrics ?? null;

  return NextResponse.json({
    metrics: {
      ...metrics,
      change: previousMetrics
        ? {
            visitors: percentageChange(
              metrics.visitors ?? 0,
              previousMetrics.visitors ?? 0
            ),
            totalVisits: percentageChange(
              metrics.totalVisits ?? 0,
              previousMetrics.totalVisits ?? 0
            ),
            totalPageviews: percentageChange(
              metrics.totalPageviews ?? 0,
              previousMetrics.totalPageviews ?? 0
            ),
            viewsPerVisit: percentageChange(
              metrics.viewsPerVisit ?? 0,
              previousMetrics.viewsPerVisit ?? 0
            ),
            bounceRate: percentageChange(
              metrics.bounceRate ?? 0,
              previousMetrics.bounceRate ?? 0
            ),
            avgDuration: percentageChange(
              metrics.avgDuration ?? 0,
              previousMetrics.avgDuration ?? 0
            ),
          }
        : undefined,
    },
  });
}
