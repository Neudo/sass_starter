"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Eye,
  MousePointerClick,
  Clock,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface AnalyticsMetricsProps {
  siteId: string;
  dateRange?: { from: Date; to: Date };
}

interface Metrics {
  uniqueVisitors: number;
  totalVisits: number;
  totalPageviews: number;
  viewsPerVisit: number;
  bounceRate: number;
  avgDuration: number;
  change?: {
    uniqueVisitors: number;
    totalVisits: number;
    totalPageviews: number;
  };
}

export function AnalyticsMetrics({ siteId, dateRange }: AnalyticsMetricsProps) {
  const [metrics, setMetrics] = useState<Metrics>({
    uniqueVisitors: 0,
    totalVisits: 0,
    totalPageviews: 0,
    viewsPerVisit: 0,
    bounceRate: 0,
    avgDuration: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      const supabase = createClient();

      // Build query with optional date range
      let query = supabase.from("sessions").select("*").eq("site_id", siteId);

      if (dateRange) {
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

      sessions?.forEach((session) => {
        // Count unique visitors (unique session IDs)
        uniqueVisitorsSet.add(session.id);

        // Calculate pageviews (for now, 1 per session, but can be enhanced)
        // In a real implementation, this would come from analytics_events
        const sessionPageviews = session.pageviews || 1;
        totalPageviews += sessionPageviews;

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
      });

      setLoading(false);
    };

    fetchMetrics();
  }, [siteId, dateRange]);

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
  }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    format?: "number" | "percentage" | "duration";
    change?: number;
    suffix?: string;
  }) => {
    const formattedValue =
      format === "number"
        ? typeof value === "number"
          ? value.toLocaleString()
          : value
        : format === "percentage"
        ? `${value}%`
        : value;

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
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

  return (
    <div className="grid gap-4 grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <MetricCard
        title="Unique Visitors"
        value={metrics.uniqueVisitors}
        icon={Users}
        format="number"
        change={metrics.change?.uniqueVisitors}
      />
      <MetricCard
        title="Total Visits"
        value={metrics.totalVisits}
        icon={MousePointerClick}
        format="number"
        change={metrics.change?.totalVisits}
      />
      <MetricCard
        title="Pageviews"
        value={metrics.totalPageviews}
        icon={Eye}
        format="number"
        change={metrics.change?.totalPageviews}
      />
      <MetricCard
        title="Views per Visit"
        value={metrics.viewsPerVisit}
        icon={BarChart3}
        format="number"
      />
      <MetricCard
        title="Bounce Rate"
        value={metrics.bounceRate}
        icon={Activity}
        format="percentage"
      />
      <MetricCard
        title="Avg. Duration"
        value={formatDuration(metrics.avgDuration)}
        icon={Clock}
        format="duration"
      />
    </div>
  );
}
