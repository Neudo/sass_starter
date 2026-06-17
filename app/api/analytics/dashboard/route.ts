import { NextRequest, NextResponse } from "next/server";
import { canReadAnalytics } from "@/lib/api/analytics-access";
import { normalizeReferrer } from "@/lib/referrer-helper";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_FILTER_TYPES = new Set([
  "country",
  "region",
  "city",
  "browser",
  "os",
  "screen_size",
  "channel",
  "referrer_domain",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "visited_page",
  "entry_page",
  "exit_page",
]);

type DashboardSource = {
  name?: string;
  rawValue?: string;
  filterType?: "channel" | "referrer_domain" | "utm_source";
  count?: number;
  percentage?: number;
};

type DashboardResponse = {
  sources?: {
    sources?: DashboardSource[];
    channels?: unknown;
    campaigns?: unknown;
  };
  [key: string]: unknown;
};

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

function normalizeDashboardSources(data: DashboardResponse) {
  const sources = data?.sources?.sources;

  if (!Array.isArray(sources)) {
    return data;
  }

  const grouped = new Map<
    string,
    {
      name: string;
      rawValue?: string;
      filterType?: "channel" | "referrer_domain" | "utm_source";
      count: number;
      percentage: number;
    }
  >();
  let total = 0;

  for (const source of sources) {
    const rawValue = source?.rawValue ?? source?.name ?? "direct";
    const count = Number(source?.count) || 0;
    const filterType =
      source?.filterType ??
      (rawValue === "direct"
        ? "channel"
        : typeof rawValue === "string" && rawValue.includes(".")
        ? "referrer_domain"
        : "utm_source");

    if (
      typeof rawValue === "string" &&
      rawValue.toLowerCase().includes("hectoranalytics")
    ) {
      continue;
    }

    total += count;

    const normalized = normalizeReferrer(
      rawValue,
      typeof rawValue === "string" && rawValue === source?.rawValue
    );
    const existing = grouped.get(normalized.displayName);

    if (existing) {
      existing.count += count;
      continue;
    }

    grouped.set(normalized.displayName, {
      name: normalized.displayName,
      rawValue: rawValue === "direct" ? "Direct" : rawValue,
      filterType,
      count,
      percentage: 0,
    });
  }

  const normalizedSources = Array.from(grouped.values())
    .map((source) => ({
      ...source,
      percentage: total > 0 ? (source.count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    ...data,
    sources: {
      ...data.sources,
      sources: normalizedSources,
    },
  };
}

function parseFilters(searchParams: URLSearchParams) {
  const raw = searchParams.get("filters");
  if (!raw) return [];

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }

  if (!Array.isArray(parsed)) {
    return undefined;
  }

  const filters = parsed.map((filter) => {
    if (
      !filter ||
      typeof filter !== "object" ||
      !("type" in filter) ||
      !("value" in filter) ||
      typeof filter.type !== "string" ||
      typeof filter.value !== "string" ||
      !ALLOWED_FILTER_TYPES.has(filter.type)
    ) {
      return null;
    }

    return {
      type: filter.type,
      value: filter.value,
    };
  });

  return filters.every(Boolean) ? filters : undefined;
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

  const filters = parseFilters(searchParams);

  if (!filters) {
    return NextResponse.json(
      { error: "Invalid filters parameter" },
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
    "get_analytics_dashboard",
    {
      p_site_id: siteId,
      p_from: from,
      p_to: to,
      p_previous_from: previousFrom,
      p_previous_to: previousTo,
      p_filters: filters,
    }
  );

  if (error) {
    console.error("get_analytics_dashboard failed:", error);
    return NextResponse.json(
      { error: "Could not load dashboard analytics" },
      { status: 500 }
    );
  }

  const metrics = data?.metrics ?? {};
  const previousMetrics = data?.previousMetrics ?? null;
  const normalizedData = normalizeDashboardSources(data);

  return NextResponse.json({
    ...normalizedData,
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
