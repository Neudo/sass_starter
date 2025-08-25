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
}

export function FunnelChart({
  funnelId,
  siteId,
  dateRange,
  isRealtimeMode = false,
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
        let url = `/api/funnels?siteId=${siteId}`;

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
          steps: selectedFunnel.steps.map((step: any, index: number) => ({
            id: step.id,
            step_number: step.step_number,
            step_name: step.name,
            step_type: step.step_type || "page_view",
            entered_count: step.visitors,
            completed_count: step.visitors,
            dropped_count:
              index > 0
                ? selectedFunnel.steps[index - 1].visitors - step.visitors
                : 0,
            conversion_rate: step.conversion_rate,
          })),
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
  }, [funnelId, siteId, dateRange, isRealtimeMode]);

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

  // Calculate proportional data based on first step (100%)
  const firstStepEntries = data.steps[0]?.entered_count || 1;

  const chartData = data.steps.map((step, index) => {
    const proportionalEntered = (step.entered_count / firstStepEntries) * 100;

    // Truncate step name if too long
    const truncatedName =
      step.step_name.length > 20
        ? step.step_name.substring(0, 17) + "..."
        : step.step_name;

    // First step is always 100% complete (no drops)
    if (index === 0) {
      return {
        name: truncatedName,
        fullName: step.step_name,
        stepNumber: step.step_number,
        entered: 100,
        completed: 100,
        dropped: 0,
        actualEntered: step.entered_count,
        actualCompleted: step.entered_count,
        actualDropped: 0,
        conversionRate: 100,
      };
    }

    // For other steps, calculate drops from previous step
    const prevStepEntries = data.steps[index - 1]?.entered_count || 0;
    const actualDropped = prevStepEntries - step.entered_count;
    const proportionalDropped = (actualDropped / firstStepEntries) * 100;
    const proportionalCompleted = proportionalEntered;

    return {
      name: truncatedName,
      fullName: step.step_name,
      stepNumber: step.step_number,
      // Store both proportional (for display) and actual (for tooltip)
      entered: proportionalEntered,
      completed: proportionalCompleted,
      dropped: proportionalDropped > 0 ? proportionalDropped : 0,
      // Keep actual numbers for tooltip
      actualEntered: step.entered_count,
      actualCompleted: step.entered_count,
      actualDropped: actualDropped > 0 ? actualDropped : 0,
      conversionRate: step.conversion_rate,
    };
  });

  // Custom bar shape to handle conditional radius
  const CustomBar = (props: any) => {
    const { fill, x, y, width, height, payload, dataKey } = props;
    
    // Check if this bar has dropped value
    const hasDropped = payload.dropped > 0;
    
    // Determine radius based on bar type and whether there's a dropped value
    let radius = 0;
    if (dataKey === "completed") {
      // If there's no dropped bar on top, add radius to top corners
      radius = hasDropped ? 0 : 4;
    } else if (dataKey === "dropped") {
      // Dropped bars always have radius on top
      radius = 4;
    }
    
    // Create path with conditional radius
    const topLeftRadius = dataKey === "dropped" || (!hasDropped && dataKey === "completed") ? radius : 0;
    const topRightRadius = dataKey === "dropped" || (!hasDropped && dataKey === "completed") ? radius : 0;
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
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">
            Step {data.stepNumber}: {data.fullName || data.name}
          </p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-green-600">●</span> Completed:{" "}
              {data.actualCompleted.toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="text-red-600">●</span> Dropped:{" "}
              {data.actualDropped.toLocaleString()}
            </p>
            <p className="text-sm font-medium">
              Conversion: {data.conversionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Relative to first step: {data.entered.toFixed(1)}%
            </p>
          </div>
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
              stackId="a"
              fill={"var(--chart-1)"}
              name="Completed"
              shape={CustomBar}
            />
            <Bar
              dataKey="dropped"
              stackId="a"
              fill="var(--chart-3)"
              name="Dropped"
              shape={CustomBar}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
