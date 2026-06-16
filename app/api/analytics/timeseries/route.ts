import { NextRequest, NextResponse } from "next/server";
import { canReadAnalytics } from "@/lib/api/analytics-access";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_INTERVALS = new Set(["hour", "day", "month"]);

interface AnalyticsTimeseriesRow {
  bucket: string;
  visitors: number | null;
  total_visits: number | null;
  total_pageviews: number | null;
  views_per_visit: number | string | null;
  bounce_rate: number | string | null;
  avg_duration: number | null;
}

function parseRequiredDate(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("siteId");
  const from = parseRequiredDate(searchParams, "from");
  const to = parseRequiredDate(searchParams, "to");
  const interval = searchParams.get("interval") ?? "day";

  if (!siteId) {
    return NextResponse.json({ error: "Missing siteId" }, { status: 400 });
  }

  if (!from || !to) {
    return NextResponse.json(
      { error: "Missing from/to date range" },
      { status: 400 }
    );
  }

  if (from === undefined || to === undefined) {
    return NextResponse.json({ error: "Invalid date parameter" }, { status: 400 });
  }

  if (!VALID_INTERVALS.has(interval)) {
    return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
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
    "get_analytics_timeseries",
    {
      p_site_id: siteId,
      p_from: from,
      p_to: to,
      p_interval: interval,
    }
  );

  if (error) {
    console.error("get_analytics_timeseries failed:", error);
    return NextResponse.json(
      { error: "Could not load analytics timeseries" },
      { status: 500 }
    );
  }

  const rows = (data ?? []) as AnalyticsTimeseriesRow[];

  return NextResponse.json({
    data: rows.map((point) => ({
      date: point.bucket,
      visitors: point.visitors ?? 0,
      totalVisits: point.total_visits ?? 0,
      totalPageviews: point.total_pageviews ?? 0,
      viewsPerVisit: Number(point.views_per_visit ?? 0),
      bounceRate: Number(point.bounce_rate ?? 0),
      avgDuration: point.avg_duration ?? 0,
    })),
  });
}
