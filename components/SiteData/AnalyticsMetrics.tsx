"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  MousePointerClick,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  User,
} from "lucide-react";
import { MetricsChart } from "./MetricsChart";
import { DateRangeOption } from "@/components/DateFilter";
interface AnalyticsMetricsProps {
  siteId: string;
  dateRange?: { from: Date; to: Date } | null;
  dateRangeOption?: DateRangeOption;
}

interface Metrics {
  uniqueVisitors: number;
  totalVisits: number;
  totalPageviews: number;
  viewsPerVisit: number;
  bounceRate: number;
  avgDuration: number;
  realtimePageViews?: number;
  change?: {
    uniqueVisitors: number;
    totalVisits: number;
    totalPageviews: number;
  };
}

export function AnalyticsMetrics({
  siteId,
  dateRange,
  dateRangeOption = "today",
}: AnalyticsMetricsProps) {
  const [metrics, setMetrics] = useState<Metrics>({
    uniqueVisitors: 0,
    totalVisits: 0,
    totalPageviews: 0,
    viewsPerVisit: 0,
    bounceRate: 0,
    avgDuration: 0,
    realtimePageViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] =
    useState<string>("uniqueVisitors");

  useEffect(() => {
    const fetchMetrics = async () => {
      const supabase = createClient();

      const isRealtimeMode = dateRangeOption === "realtime";
      
      // Build query based on mode
      let query = supabase.from("sessions").select("*").eq("site_id", siteId);

      if (isRealtimeMode) {
        // For realtime: get sessions active in last 30 minutes (based on last_seen)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        query = query.gte("last_seen", thirtyMinutesAgo);
      } else if (dateRange) {
        // For other modes: filter by creation date
        query = query
          .gte("created_at", dateRange.from.toISOString())
          .lte("created_at", dateRange.to.toISOString());
      }

      const { data: sessions, error } = await query;

      if (error) {
        console.error("Error fetching metrics:", error);
        setLoading(false);
        return;
      }

      // Calculate metrics from sessions data
      const uniqueVisitorsSet = new Set<string>();
      let totalPageviews = 0;
      let totalDuration = 0;
      let bounces = 0;
      let realtimePageViews = 0;

      sessions?.forEach((session) => {
        // Create visitor fingerprint for unique visitor identification
        const visitorFingerprint = `${session.browser || "unknown"}-${
          session.os || "unknown"
        }-${session.screen_size || "unknown"}-${session.country || "unknown"}`;
        uniqueVisitorsSet.add(visitorFingerprint);

        // Calculate pageviews from the visited_pages array length
        const visitedPagesCount = Array.isArray(session.visited_pages) 
          ? session.visited_pages.length 
          : 1;
        const sessionPageviews = visitedPagesCount;
        totalPageviews += sessionPageviews;

        // For realtime mode, all pageviews are "realtime pageviews"
        if (isRealtimeMode) {
          realtimePageViews += sessionPageviews;
        }

        // Calculate duration (difference between created_at and last_seen)
        if (session.created_at && session.last_seen) {
          const created = new Date(session.created_at).getTime();
          const lastSeen = new Date(session.last_seen).getTime();
          const duration = Math.round((lastSeen - created) / 1000); // in seconds
          totalDuration += duration;
        }

        // Count bounces (sessions with only 1 pageview)
        if (sessionPageviews === 1) {
          bounces++;
        }
      });

      const totalVisits = sessions?.length || 0;
      const uniqueVisitors = uniqueVisitorsSet.size;

      setMetrics({
        uniqueVisitors,
        totalVisits,
        totalPageviews,
        viewsPerVisit:
          totalVisits > 0
            ? parseFloat((totalPageviews / totalVisits).toFixed(2))
            : 0,
        bounceRate:
          totalVisits > 0
            ? parseFloat(((bounces / totalVisits) * 100).toFixed(1))
            : 0,
        avgDuration:
          totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0,
        realtimePageViews,
      });

      setLoading(false);
    };

    fetchMetrics();
  }, [siteId, dateRange, dateRangeOption]);

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    format = "number",
    change,
    suffix = "",
    metricKey,
  }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    format?: "number" | "percentage" | "duration";
    change?: number;
    suffix?: string;
    metricKey?: string;
  }) => {
    const formattedValue =
      format === "number"
        ? typeof value === "number"
          ? value.toLocaleString()
          : value
        : format === "percentage"
        ? `${value}%`
        : value;

    const isSelected = metricKey && selectedMetric === metricKey;

    const handleClick = () => {
      if (!metricKey) return;
      setSelectedMetric(metricKey);
    };

    return (
      <Card
        className={`transition-all cursor-pointer hover:border-primary hover:bg-primary/15 ${
          isSelected ? "border-primary bg-primary/15" : ""
        }`}
        onClick={handleClick}
      >
        <CardHeader className="flex flex-row items-center justify-start gap-x-1 space-y-0 p-2">
          <div className="relative">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formattedValue}
            {suffix}
          </div>
          {change !== undefined && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {change >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+{change}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">{change}%</span>
                </>
              )}
              <span className="ml-1">from last period</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Determine grid columns based on realtime mode
  const isRealtimeMode = dateRangeOption === "realtime";
  const gridCols = isRealtimeMode
    ? "grid-cols-2 lg:grid-cols-2"
    : "grid-cols-2 lg:grid-cols-5 ";

  return (
    <div className="space-y-6 dark:bg-slate-800 dark:border-0 bg-white shadow-sm border border-gray-200 p-4 rounded-sm">
      <div className={`grid gap-4 ${gridCols}`}>
        <MetricCard
          title="Unique Visitors"
          value={metrics.uniqueVisitors}
          icon={User}
          format="number"
          change={metrics.change?.uniqueVisitors}
          metricKey="uniqueVisitors"
        />
        {isRealtimeMode && (
          <MetricCard
            title="Page Views (last 30 min)"
            value={metrics.realtimePageViews || 0}
            icon={Eye}
            format="number"
            metricKey="realtimePageViews"
          />
        )}
        {!isRealtimeMode && (
          <>
            <MetricCard
              title="Total Visits"
              value={metrics.totalVisits}
              icon={MousePointerClick}
              format="number"
              change={metrics.change?.totalVisits}
              metricKey="totalVisits"
            />
            <MetricCard
              title="Total pageviews"
              value={metrics.totalPageviews}
              icon={Eye}
              format="number"
              change={metrics.change?.totalPageviews}
              metricKey="totalPageviews"
            />
            <MetricCard
              title="Bounce Rate"
              value={metrics.bounceRate}
              icon={Activity}
              format="percentage"
              metricKey="bounceRate"
            />
            <MetricCard
              title="Avg. Duration"
              value={formatDuration(metrics.avgDuration)}
              icon={Clock}
              format="duration"
              metricKey="avgDuration"
            />
          </>
        )}
      </div>
      <MetricsChart
        siteId={siteId}
        dateRange={dateRangeOption}
        selectedMetrics={[selectedMetric]}
      />
    </div>
  );
}
