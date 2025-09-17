"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  User,
} from "lucide-react";
import { MetricsChart } from "./MetricsChart";
import { DateRangeOption } from "@/components/DateFilter";
import { useAnalyticsStore } from "@/lib/stores/analytics";
import { Skeleton } from "@/components/ui/skeleton";
interface AnalyticsMetricsProps {
  siteId: string;
  dateRange?: { from: Date; to: Date } | null;
  dateRangeOption?: DateRangeOption;
}

interface Metrics {
  visitors: number;
  totalPageviews: number;
  viewsPerVisit: number;
  bounceRate: number;
  avgDuration: number;
  realtimePageViews?: number;
  change?: {
    visitors: number;
    totalPageviews: number;
    viewsPerVisit: number;
    bounceRate: number;
    avgDuration: number;
  };
}

export function AnalyticsMetrics({
  siteId,
  dateRangeOption = "today",
}: AnalyticsMetricsProps) {
  const { getAnalyticsData, loading, setSelectedMetric, selectedMetric } =
    useAnalyticsStore();
  const analyticsData = getAnalyticsData();

  const metrics: Metrics = {
    visitors: analyticsData.metrics.visitors,
    totalPageviews: analyticsData.metrics.totalPageviews,
    viewsPerVisit: analyticsData.metrics.viewsPerVisit,
    bounceRate: analyticsData.metrics.bounceRate,
    avgDuration: analyticsData.metrics.avgDuration,
    realtimePageViews: analyticsData.metrics.totalPageviews, // For realtime mode show page views
    change: analyticsData.metrics.change, // Add the change data
  };

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

    // For bounce rate, lower is better, so invert the colors
    const isInverted = metricKey === "bounceRate";

    if (loading) {
      return (
        <Card className="h-[84px]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    const isPositive =
      change !== undefined ? (isInverted ? change < 0 : change >= 0) : false;
    const displayChange = Math.abs(change || 0);

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
        <CardContent className="py-1">
          <div className="text-2xl font-bold">
            {formattedValue}
            {suffix}
            {change !== undefined && (
              <div className="inline-block pl-2 text-xs text-muted-foreground mt-1">
                {isPositive ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1 inline" />
                    <span className="text-green-500">
                      {change >= 0 ? "+" : "-"}
                      {displayChange}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1 inline" />
                    <span className="text-red-500">
                      {change >= 0 ? "+" : "-"}
                      {displayChange}%
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Determine grid columns based on realtime mode
  const isRealtimeMode = dateRangeOption === "realtime";
  const gridCols = isRealtimeMode
    ? "grid-cols-2 lg:grid-cols-2"
    : "grid-cols-2 lg:grid-cols-5";

  return (
    <div className="space-y-6 dark:bg-slate-800 dark:border-0 bg-white shadow-sm border border-gray-200 p-4 rounded-sm">
      <div className={`grid gap-4 ${gridCols}`}>
        <MetricCard
          title="Visitors"
          value={metrics.visitors}
          icon={User}
          format="number"
          change={metrics.change?.visitors}
          metricKey="visitors"
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
              title="Total Page Views"
              value={metrics.totalPageviews}
              icon={Eye}
              format="number"
              change={metrics.change?.totalPageviews}
              metricKey="totalPageviews"
            />
            <MetricCard
              title="Views per Visit"
              value={metrics.viewsPerVisit}
              icon={Eye}
              format="number"
              change={metrics.change?.viewsPerVisit}
              metricKey="viewsPerVisit"
            />
            <MetricCard
              title="Bounce Rate"
              value={metrics.bounceRate}
              icon={Activity}
              format="percentage"
              change={metrics.change?.bounceRate}
              metricKey="bounceRate"
            />
            <MetricCard
              title="Avg. Duration"
              value={formatDuration(metrics.avgDuration)}
              icon={Clock}
              format="duration"
              change={metrics.change?.avgDuration}
              metricKey="avgDuration"
            />
          </>
        )}
      </div>
      <MetricsChart
        siteId={siteId}
        dateRange={dateRangeOption}
        selectedMetrics={selectedMetric ? [selectedMetric] : []}
      />
    </div>
  );
}
