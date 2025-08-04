"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A linear area chart";

const weekData = [
  { day: "Monday", desktop: 22160 },
  { day: "Tuesday", desktop: 16050 },
  { day: "Wednesday", desktop: 21370 },
  { day: "Thursday", desktop: 34730 },
  { day: "Friday", desktop: 26090 },
  { day: "Saturday", desktop: 15140 },
  { day: "Sunday", desktop: 18120 },
];

const chartConfig = {
  desktop: {
    label: "Visitors",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChartDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly visitors</CardTitle>
        <CardDescription>
          Showing total visitors for the last week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={weekData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Area
              dataKey="desktop"
              type="linear"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              strokeWidth={3}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this week <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Monday - Sunday August 2025
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
