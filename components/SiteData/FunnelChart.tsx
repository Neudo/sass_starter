/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface FunnelStep {
  id: string;
  step_number: number;
  step_name: string;
  step_type: string;
  entered_count: number;
  completed_count: number;
  dropped_count: number;
  conversion_rate: number;
  source_breakdown?: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  country_breakdown?: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
}

interface FunnelAnalytics {
  funnel: {
    id: string;
    name: string;
    description: string;
  };
  steps: FunnelStep[];
  total_entered: number;
  total_completed: number;
  overall_conversion_rate: number;
}

interface FunnelChartProps {
  funnelId: string;
  siteId: string;
  dateRange?: { from: Date; to: Date } | null;
  isRealtimeMode?: boolean;
  isPublic?: boolean;
  domain?: string;
}

export function FunnelChart({
  funnelId,
  siteId,
  dateRange,
  isRealtimeMode = false,
  isPublic = false,
  domain,
}: FunnelChartProps) {
  const [data, setData] = useState<FunnelAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!funnelId || !siteId) return;

      setLoading(true);
      setError(null);

      try {
        let url: string;

        if (isPublic && domain) {
          // Use public endpoint for public dashboard
          url = `/api/public-funnels-analytics?domain=${domain}`;
        } else {
          // Use private endpoint for authenticated dashboard
          url = `/api/funnels?siteId=${siteId}`;
        }

        // Add date filters if provided
        if (dateRange?.from && dateRange?.to) {
          url += `&from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch funnel analytics");
        }

        const funnels = await response.json();
        const selectedFunnel = funnels.find((f: any) => f.id === funnelId);

        if (!selectedFunnel) {
          throw new Error("Funnel not found");
        }

        // Transform the data to match the expected format
        const analytics: FunnelAnalytics = {
          funnel: {
            id: selectedFunnel.id,
            name: selectedFunnel.name,
            description: selectedFunnel.description || "",
          },
          steps: selectedFunnel.steps.map((step: any, index: number) => {
            const entered_count = index === 0 ? step.visitors : selectedFunnel.steps[index - 1].visitors;
            const completed_count = step.visitors;
            const dropped_count = entered_count - completed_count;
            
            console.log(`Step ${step.step_number} (${step.name}):`, {
              visitors: step.visitors,
              entered_count,
              completed_count,
              dropped_count,
              conversion_rate: step.conversion_rate
            });
            
            return {
              id: step.id,
              step_number: step.step_number,
              step_name: step.name,
              step_type: step.step_type || "page_view",
              entered_count,
              completed_count,
              dropped_count,
              conversion_rate: step.conversion_rate,
              source_breakdown: step.source_breakdown || [],
              country_breakdown: step.country_breakdown || [],
            };
          }),
          total_entered: selectedFunnel.total_visitors,
          total_completed:
            selectedFunnel.steps[selectedFunnel.steps.length - 1]?.visitors ||
            0,
          overall_conversion_rate: selectedFunnel.conversion_rate,
        };

        setData(analytics);
      } catch (err) {
        console.error("Error fetching funnel analytics:", err);
        setError("Failed to load funnel analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up auto-refresh for realtime mode
    let interval: NodeJS.Timeout | null = null;
    if (isRealtimeMode) {
      interval = setInterval(fetchData, 60000); // Refresh every minute
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [funnelId, siteId, dateRange, isRealtimeMode, isPublic, domain]);

  console.log("domain", domain);
  console.log("funnelId", funnelId);
  console.log("siteId", siteId);
  console.log("dateRange", dateRange);
  console.log("isRealtimeMode", isRealtimeMode);
  console.log("isPublic", isPublic);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading funnel analytics...
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>;
  }

  if (!data || data.steps.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p className="text-sm">No analytics data available</p>
        <p className="text-xs mt-1">
          Data will appear once users start interacting with your funnel
        </p>
      </div>
    );
  }

  // Calculate proportional data based on conversion rates
  const chartData = data.steps.map((step, index) => {
    // Truncate step name if too long
    const truncatedName =
      step.step_name.length > 20
        ? step.step_name.substring(0, 17) + "..."
        : step.step_name;

    // Use conversion rate directly as the height percentage
    const conversionPercentage = step.conversion_rate || 0;
    
    // For first step, show full height if there are visitors, otherwise 0
    if (index === 0) {
      const displayPercentage = step.entered_count > 0 ? 100 : 0;
      return {
        name: truncatedName,
        fullName: step.step_name,
        stepNumber: step.step_number,
        // First step is always 100% if it has visitors
        entered: displayPercentage,
        completed: displayPercentage,
        dropped: 0,
        actualEntered: step.entered_count,
        actualCompleted: step.completed_count,
        actualDropped: step.dropped_count,
        conversionRate: step.conversion_rate,
        sourceBreakdown: step.source_breakdown,
        countryBreakdown: step.country_breakdown,
      };
    }

    // For subsequent steps, use conversion rate as height
    return {
      name: truncatedName,
      fullName: step.step_name,
      stepNumber: step.step_number,
      // Height based on conversion rate (0-100%)
      entered: conversionPercentage,
      completed: conversionPercentage,
      dropped: 0, // No dropped visualization for now since we're showing completion rate
      // Keep actual numbers for tooltip
      actualEntered: step.entered_count,
      actualCompleted: step.completed_count,
      actualDropped: step.dropped_count,
      conversionRate: step.conversion_rate,
      sourceBreakdown: step.source_breakdown,
      countryBreakdown: step.country_breakdown,
    };
  });

  // Custom bar shape with rounded top corners
  const CustomBar = (props: any) => {
    const { fill, x, y, width, height } = props;

    // Always add radius to top corners since we only have one bar type now
    const radius = 4;
    const topLeftRadius = radius;
    const topRightRadius = radius;
    const bottomLeftRadius = 0;
    const bottomRightRadius = 0;

    const path = `
      M ${x + topLeftRadius} ${y}
      L ${x + width - topRightRadius} ${y}
      Q ${x + width} ${y} ${x + width} ${y + topRightRadius}
      L ${x + width} ${y + height - bottomRightRadius}
      Q ${x + width} ${y + height} ${x + width - bottomRightRadius} ${y + height}
      L ${x + bottomLeftRadius} ${y + height}
      Q ${x} ${y + height} ${x} ${y + height - bottomLeftRadius}
      L ${x} ${y + topLeftRadius}
      Q ${x} ${y} ${x + topLeftRadius} ${y}
      Z
    `;

    return <path d={path} fill={fill} />;
  };

  // Custom tooltip component

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-sm">
          <p className="font-medium text-sm">
            Step {data.stepNumber}: {data.fullName || data.name}
          </p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-green-600">●</span> Completed:{" "}
              {data.actualCompleted.toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">●</span> Entered:{" "}
              {data.actualEntered.toLocaleString()}
            </p>
            <p className="text-sm font-medium">
              Conversion: {data.conversionRate.toFixed(1)}%
            </p>
          </div>

          {/* Breakdowns if data exists */}
          {(data.sourceBreakdown?.length > 0 ||
            data.countryBreakdown?.length > 0) && (
            <div className="grid grid-cols-2 gap-4 pt-2 mt-2 border-t border-border/50">
              {/* Source Breakdown */}
              {data.sourceBreakdown?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Top Sources
                  </p>
                  {data.sourceBreakdown.slice(0, 3).map((source: any) => (
                    <div
                      key={source.source}
                      className="flex justify-between text-xs gap-2"
                    >
                      <span className="truncate">{source.source}</span>
                      <span className="text-muted-foreground">
                        {source.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Country Breakdown */}
              {data.countryBreakdown?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Top Countries
                  </p>
                  {data.countryBreakdown.slice(0, 3).map((country: any) => (
                    <div
                      key={country.country}
                      className="flex justify-between text-xs gap-2"
                    >
                      <span className="truncate">{country.country}</span>
                      <span className="text-muted-foreground">
                        {country.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold">
            {data.total_entered.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Total Entered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.total_completed.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Total Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {data.overall_conversion_rate.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            Overall Conversion
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        className="h-80 mx-auto"
        style={{
          maxWidth: `${Math.min(800, Math.max(300, data.steps.length * 150))}px`,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis
              dataKey="name"
              tick={{ fill: "white", fontSize: 10 }}
              tickLine={false}
              angle={0}
              axisLine={false}
              height={80}
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar
              dataKey="completed"
              fill={"var(--chart-1)"}
              name="Conversion Rate"
              shape={CustomBar}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
