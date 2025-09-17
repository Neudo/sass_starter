"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { DateRangeOption, getDateRange } from "@/components/DateFilter";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsStore } from "@/lib/stores/analytics";

interface MetricsChartProps {
  siteId: string;
  dateRange: DateRangeOption;
  selectedMetrics: string[];
}

interface SessionData {
  id: string;
  site_id: string;
  created_at: string;
  last_seen?: string;
  browser?: string;
  os?: string;
  screen_size?: string;
  country?: string;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  visitors: number;
  totalVisits: number;
  totalPageviews: number;
  viewsPerVisit: number;
  bounceRate: number;
  avgDuration: number;
  realtimePageViews?: number;
}

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  totalVisits: {
    label: "Total Visits",
  },
  totalPageviews: {
    label: "Total Page Views",
  },
  viewsPerVisit: {
    label: "Views per Visit",
  },
  bounceRate: {
    label: "Bounce Rate (%)",
  },
  avgDuration: {
    label: "Avg. Duration",
  },
  realtimePageViews: {
    label: "Page Views (last 30 min)",
  },
} satisfies ChartConfig;

export function MetricsChart({
  siteId,
  dateRange,
  selectedMetrics,
}: MetricsChartProps) {
  // Get the display title for the selected metric
  const getMetricTitle = (metric: string): string => {
    const titles: Record<string, string> = {
      visitors:
        dateRange === "realtime" ? "Visitors (last 30 min)" : "Visitors",
      totalVisits: "Total Visits",
      totalPageviews: "Total Page Views",
      viewsPerVisit: "Views per Visit",
      bounceRate: "Bounce Rate",
      avgDuration: "Average Duration",
      realtimePageViews: "Page Views (last 30 min)",
    };
    return titles[metric] || metric;
  };
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const { loading: globalLoading } = useAnalyticsStore();
  const loading = globalLoading || localLoading;

  // Helper function to format date for display
  const formatDateDisplay = (date: Date): string => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  useEffect(() => {
    // Helper function to generate all dates in range
    const generateDateRange = (
      from: Date,
      to: Date,
      interval: "hour" | "day" | "month"
    ): { key: string; date: Date; displayDate: string }[] => {
      const dates: { key: string; date: Date; displayDate: string }[] = [];
      const current = new Date(from);
      current.setHours(0, 0, 0, 0); // Start at beginning of day

      while (current <= to) {
        const dateCopy = new Date(current);
        let key: string;
        let displayDate: string;

        if (interval === "hour") {
          key = `${current.getFullYear()}-${String(
            current.getMonth() + 1
          ).padStart(2, "0")}-${String(current.getDate()).padStart(
            2,
            "0"
          )} ${String(current.getHours()).padStart(2, "0")}:00`;
          displayDate = `${formatDateDisplay(
            current
          )} ${current.getHours()}:00`;
          current.setHours(current.getHours() + 1);
        } else if (interval === "day") {
          key = `${current.getFullYear()}-${String(
            current.getMonth() + 1
          ).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
          displayDate = formatDateDisplay(current);
          current.setDate(current.getDate() + 1);
        } else {
          key = `${current.getFullYear()}-${String(
            current.getMonth() + 1
          ).padStart(2, "0")}`;
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          displayDate = `${
            months[current.getMonth()]
          } ${current.getFullYear()}`;
          current.setMonth(current.getMonth() + 1);
        }

        dates.push({ key, date: dateCopy, displayDate });
      }

      return dates;
    };

    const fetchChartData = async () => {
      if (!siteId) {
        console.warn("MetricsChart: No siteId available, skipping fetch");
        setLocalLoading(false);
        return;
      }

      setLocalLoading(true);
      const supabase = createClient();
      const range = getDateRange(dateRange);

      // Special handling for realtime metrics (visitors in realtime, realtimePageViews)
      if (
        (selectedMetrics[0] === "visitors" && dateRange === "realtime") ||
        selectedMetrics[0] === "realtimePageViews"
      ) {
        // Generate last 30 minutes with 4-minute intervals
        const now = new Date();
        const realtimeData: ChartDataPoint[] = [];

        // Fetch all sessions from last 30 minutes
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
        const { data: recentSessions, error } = await supabase
          .from("sessions")
          .select("*")
          .eq("site_id", siteId)
          .gte("last_seen", thirtyMinutesAgo.toISOString())
          .order("last_seen", { ascending: true });

        if (error) {
          console.error("Error fetching realtime data:", error);
          setLocalLoading(false);
          return;
        }

        // Create 8 time intervals (every 4 minutes for the last 30 minutes)
        for (let i = 7; i >= 0; i--) {
          const intervalEnd = new Date(now.getTime() - i * 4 * 60 * 1000);
          const intervalStart = new Date(intervalEnd.getTime() - 4 * 60 * 1000);

          // Count visitors in this interval (1 session = 1 visitor)
          const intervalSessions =
            recentSessions?.filter((session) => {
              const lastSeen = new Date(
                session.last_seen || session.created_at
              );
              return lastSeen >= intervalStart && lastSeen <= intervalEnd;
            }) || [];

          const visitorCount = intervalSessions.length;

          // Need to fetch page views for realtime
          const sessionIds = intervalSessions.map((s) => s.id);
          let intervalPageViews = 0;

          if (sessionIds.length > 0) {
            const { data: pageViews } = await supabase
              .from("page_views")
              .select("id")
              .in("session_id", sessionIds)
              .gte("created_at", intervalStart.toISOString())
              .lte("created_at", intervalEnd.toISOString());

            intervalPageViews = pageViews?.length || 0;
          }

          const minutesAgo = i * 4;
          const displayLabel = minutesAgo === 0 ? "Now" : `-${minutesAgo}min`;

          realtimeData.push({
            date: intervalEnd.toISOString(),
            displayDate: displayLabel,
            visitors: visitorCount,
            realtimePageViews: intervalPageViews,
            totalVisits: 0,
            totalPageviews: 0,
            viewsPerVisit: 0,
            bounceRate: 0,
            avgDuration: 0,
          });
        }

        setChartData(realtimeData);
        setLocalLoading(false);
        return;
      }

      // Build query for other metrics
      if (!siteId) {
        console.error("No siteId available for MetricsChart");
        setLocalLoading(false);
        return;
      }

      let query = supabase
        .from("sessions")
        .select("*")
        .eq("site_id", siteId)
        .order("created_at", { ascending: true });

      // Calculate interval based on date range
      let interval: "hour" | "day" | "month" = "hour";
      let allDates: { key: string; date: Date; displayDate: string }[] = [];

      if (range) {
        const { from, to } = range;
        query = query
          .gte("created_at", from.toISOString())
          .lte("created_at", to.toISOString());

        const daysDiff = Math.ceil(
          (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Force daily intervals for last30days and last90days
        if (dateRange === "last30days" || dateRange === "last90days") {
          interval = "day";
        } else if (daysDiff > 30) {
          interval = "month";
        } else if (daysDiff > 2) {
          interval = "day";
        }

        // Generate all dates in range
        allDates = generateDateRange(from, to, interval);
      } else {
        // All time - use monthly intervals
        interval = "month";
        // For all time, we'll generate dates based on actual data
        const now = new Date();
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        allDates = generateDateRange(yearAgo, now, interval);
      }

      // Fetch sessions data
      const { data: sessions, error } = await query;

      if (error) {
        console.error("Error fetching chart data:", error);
        setLocalLoading(false);
        return;
      }

      // Fetch page views count for each session
      const sessionIds = sessions?.map((s) => s.id) || [];
      const { data: pageViewCounts } = await supabase
        .from("page_views")
        .select("session_id")
        .in("session_id", sessionIds);

      // Create a map of session_id to page view count
      const pageViewsPerSession = new Map<string, number>();
      pageViewCounts?.forEach((pv) => {
        const count = pageViewsPerSession.get(pv.session_id) || 0;
        pageViewsPerSession.set(pv.session_id, count + 1);
      });

      // Group data by interval
      const groupedData = new Map<string, SessionData[]>();

      // Initialize all dates with empty arrays
      allDates.forEach(({ key }) => {
        groupedData.set(key, []);
      });

      sessions?.forEach((session) => {
        const date = new Date(session.created_at);
        let key: string;

        if (interval === "hour") {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(date.getDate()).padStart(2, "0")} ${String(
            date.getHours()
          ).padStart(2, "0")}:00`;
        } else if (interval === "day") {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(date.getDate()).padStart(2, "0")}`;
        } else {
          // Month
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
        }

        if (groupedData.has(key)) {
          groupedData.get(key)?.push(session);
        }
      });

      // Calculate metrics for each interval
      const chartPoints: ChartDataPoint[] = [];
      const dateMap = new Map(allDates.map((d) => [d.key, d.displayDate]));

      groupedData.forEach((sessions, dateKey) => {
        // Following Plausible's approach: 1 session = 1 visitor
        const visitors = sessions.length;
        const totalVisits = sessions.length;
        let totalPageviews = 0;
        let totalDuration = 0;
        let bounces = 0;

        sessions.forEach((session) => {
          const sessionPageviews = pageViewsPerSession.get(session.id) || 1;
          totalPageviews += sessionPageviews;

          if (session.created_at && session.last_seen) {
            const duration = Math.round(
              (new Date(session.last_seen).getTime() -
                new Date(session.created_at).getTime()) /
                1000
            );
            totalDuration += duration;
          }

          if (sessionPageviews === 1) {
            bounces++;
          }
        });

        const bounceRate =
          totalVisits > 0 ? Math.round((bounces / totalVisits) * 100) : 0;
        const avgDuration =
          totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;
        const viewsPerVisit =
          totalVisits > 0
            ? parseFloat((totalPageviews / totalVisits).toFixed(2))
            : 0;

        chartPoints.push({
          date: dateKey,
          displayDate: dateMap.get(dateKey) || dateKey,
          visitors,
          totalVisits,
          totalPageviews,
          viewsPerVisit,
          bounceRate,
          avgDuration,
        });
      });

      // Sort by date
      chartPoints.sort((a, b) => {
        return a.date.localeCompare(b.date);
      });

      setChartData(chartPoints);
      setLocalLoading(false);
    };

    fetchChartData();
  }, [siteId, dateRange, selectedMetrics]);

  if (loading) {
    return (
      <Card className="h-[350px] ">
        <CardHeader>
          <CardTitle>Metrics Over Time</CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full space-y-4">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between h-full">
              <div className="flex items-end gap-4">
                <div className="flex flex-col gap-8">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-3 w-8" />
                  ))}
                </div>
                {/* Chart area */}
                <div className="flex-1 h-full relative">
                  <Skeleton className="w-full h-full" />
                  {/* X-axis labels */}
                  <div className="flex justify-between mt-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-3 w-12" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate default data if no data exists
  const displayData =
    chartData.length > 0
      ? chartData
      : [
          {
            date: new Date().toISOString().split("T")[0],
            displayDate: "Today",
            visitors: 0,
            totalVisits: 0,
            totalPageviews: 0,
            viewsPerVisit: 0,
            bounceRate: 0,
            avgDuration: 0,
          },
        ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getMetricTitle(selectedMetrics[0])} Over Time</CardTitle>
        <CardDescription>
          Click on metric cards above to change the chart
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart accessibilityLayer data={displayData}>
            <defs>
              {selectedMetrics.map((metric) => (
                <linearGradient
                  key={`fill${metric}`}
                  id={`fill${metric}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={"hsl(var(--chart-1))"}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={"hsl(var(--chart-1))"}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              interval={(() => {
                // For last 7 days or realtime: show all labels
                if (displayData.length <= 8) return 0;

                // For last 30 days: show every 4th day (30/4 ≈ 7 labels)
                if (dateRange === "last30days") {
                  return Math.floor(displayData.length / 7) - 1;
                }

                // For last 90 days: show every 11th day (90/11 ≈ 8 labels)
                if (dateRange === "last90days") {
                  return Math.floor(displayData.length / 8) - 1;
                }

                // Default behavior for other periods
                return "preserveStartEnd";
              })()}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {selectedMetrics.map((metric) => (
              <Area
                key={metric}
                dataKey={metric}
                type="linear"
                fill={`#3d9dbd`}
                stroke={"hsl(var(--chart-1))"}
                strokeWidth={2}
                stackId={
                  metric === "bounceRate" || metric === "avgDuration"
                    ? metric
                    : "a"
                }
              />
            ))}
            {/* No legend needed for single metric */}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
