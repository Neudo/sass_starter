/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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

export function FunnelChart({ funnelId, siteId, dateRange, isRealtimeMode = false }: FunnelChartProps) {
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

  const chartData = data.steps.map((step) => {
    const proportionalEntered = (step.entered_count / firstStepEntries) * 100;
    const proportionalCompleted =
      (step.completed_count / firstStepEntries) * 100;
    const proportionalDropped = proportionalEntered - proportionalCompleted;

    return {
      name: step.step_name,
      stepNumber: step.step_number,
      // Store both proportional (for display) and actual (for tooltip)
      entered: proportionalEntered,
      completed: proportionalCompleted,
      dropped: proportionalDropped > 0 ? proportionalDropped : 0,
      // Keep actual numbers for tooltip
      actualEntered: step.entered_count,
      actualCompleted: step.completed_count,
      actualDropped: step.dropped_count,
      conversionRate: step.conversion_rate,
    };
  });

  // Custom tooltip component
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">
            Step {data.stepNumber}: {data.name}
          </p>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <span className="text-blue-600">●</span> Entered:{" "}
              {data.actualEntered.toLocaleString()}
            </p>
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
          <div className="text-2xl font-bold text-blue-600">
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
      <div className="h-80">
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
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs fill-muted-foreground"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              className="text-xs fill-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar
              dataKey="completed"
              stackId="a"
              fill="#16a34a"
              name="Completed"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="dropped"
              stackId="a"
              fill="#dc2626"
              name="Dropped"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
