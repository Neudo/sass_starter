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
  page_views?: number;
}

interface ChartDataPoint {
  date: string;
  displayDate: string;
  uniqueVisitors: number;
  totalVisits: number;
  totalPageviews: number;
  bounceRate: number;
  avgDuration: number;
  activeVisitors?: number;
  realtimePageViews?: number;
}

const chartConfig = {
  activeVisitors: {
    label: "Active Visitors",
  },
  uniqueVisitors: {
    label: "Unique Visitors",
  },
  totalVisits: {
    label: "Total Visits",
  },
  totalPageviews: {
    label: "Total Pageviews",
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
      activeVisitors: "Active Visitors",
      uniqueVisitors: "Unique Visitors",
      totalVisits: "Total Visits",
      totalPageviews: "Total Pageviews",
      bounceRate: "Bounce Rate",
      avgDuration: "Average Duration",
      realtimePageViews: "Page Views (last 30 min)",
    };
    return titles[metric] || metric;
  };
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      const supabase = createClient();
      const range = getDateRange(dateRange);

      // Special handling for realtime metrics (activeVisitors, uniqueVisitors in realtime, realtimePageViews)
      if (selectedMetrics[0] === "activeVisitors" || 
          (selectedMetrics[0] === "uniqueVisitors" && dateRange === "realtime") ||
          selectedMetrics[0] === "realtimePageViews") {
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
          setLoading(false);
          return;
        }

        // Create 8 time intervals (every 4 minutes for the last 30 minutes)
        for (let i = 7; i >= 0; i--) {
          const intervalEnd = new Date(now.getTime() - i * 4 * 60 * 1000);
          const intervalStart = new Date(intervalEnd.getTime() - 4 * 60 * 1000);
          
          // Count sessions active in this interval
          const activeCount = recentSessions?.filter(session => {
            const lastSeen = new Date(session.last_seen || session.created_at);
            return lastSeen >= intervalStart && lastSeen <= intervalEnd;
          }).length || 0;

          // Count unique visitors in this interval
          const intervalSessions = recentSessions?.filter(session => {
            const lastSeen = new Date(session.last_seen || session.created_at);
            return lastSeen >= intervalStart && lastSeen <= intervalEnd;
          }) || [];

          const uniqueVisitorsSet = new Set<string>();
          let intervalPageViews = 0;

          intervalSessions.forEach(session => {
            const visitorFingerprint = `${session.browser || "unknown"}-${
              session.os || "unknown"
            }-${session.screen_size || "unknown"}-${session.country || "unknown"}`;
            uniqueVisitorsSet.add(visitorFingerprint);
            intervalPageViews += session.page_views || 1;
          });

          const minutesAgo = i * 4;
          const displayLabel = minutesAgo === 0 ? "Now" : `-${minutesAgo}min`;
          
          realtimeData.push({
            date: intervalEnd.toISOString(),
            displayDate: displayLabel,
            activeVisitors: activeCount,
            uniqueVisitors: uniqueVisitorsSet.size,
            realtimePageViews: intervalPageViews,
            totalVisits: 0,
            totalPageviews: 0,
            bounceRate: 0,
            avgDuration: 0,
          });
        }

        setChartData(realtimeData);
        setLoading(false);
        return;
      }

      // Build query for other metrics
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
        if (daysDiff > 30) {
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
        setLoading(false);
        return;
      }

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
        const uniqueVisitorsSet = new Set<string>();
        let totalPageviews = 0;
        let totalDuration = 0;
        let bounces = 0;

        sessions.forEach((session) => {
          // Create visitor fingerprint from available data for unique visitor identification
          const visitorFingerprint = `${session.browser || "unknown"}-${
            session.os || "unknown"
          }-${session.screen_size || "unknown"}-${
            session.country || "unknown"
          }`;
          uniqueVisitorsSet.add(visitorFingerprint);
          const sessionPageviews = session.page_views || 1;
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

        const totalVisits = sessions.length;
        const bounceRate =
          totalVisits > 0 ? Math.round((bounces / totalVisits) * 100) : 0;
        const avgDuration =
          totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;

        chartPoints.push({
          date: dateKey,
          displayDate: dateMap.get(dateKey) || dateKey,
          uniqueVisitors: uniqueVisitorsSet.size,
          totalVisits,
          totalPageviews,
          bounceRate,
          avgDuration,
        });
      });

      // Sort by date
      chartPoints.sort((a, b) => {
        return a.date.localeCompare(b.date);
      });

      setChartData(chartPoints);
      setLoading(false);
    };

    fetchChartData();
  }, [siteId, dateRange, selectedMetrics]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Metrics Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          <AreaChart accessibilityLayer data={chartData}>
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
              interval={chartData.length <= 7 ? 0 : "preserveStartEnd"}
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
