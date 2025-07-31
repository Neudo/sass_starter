"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

import {
  Calendar,
  ChevronDown,
  Users,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Globe,
  Settings,
  Filter,
} from "lucide-react";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function Dashboard() {
  const [onlineVisitors, setOnlineVisitors] = useState(47);
  const dateRange = "7 days";

  // Simulate online visitors
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineVisitors((prev) => {
        const change = Math.floor(Math.random() * 6) - 2; // -2 to +3
        const newValue = Math.max(20, Math.min(80, prev + change));
        return newValue;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Mock data for metrics
  const metrics = {
    uniqueVisitors: 12847,
    totalVisits: 18456,
    totalPageviews: 47892,
    viewsPerVisit: 2.6,
    bounceRate: 34.2,
    visitDuration: "3m 24s",
  };

  // Chart data
  const chartData = [
    { time: "00:00", visitors: 23, pageviews: 45 },
    { time: "03:00", visitors: 18, pageviews: 32 },
    { time: "06:00", visitors: 35, pageviews: 67 },
    { time: "09:00", visitors: 78, pageviews: 156 },
    { time: "12:00", visitors: 124, pageviews: 287 },
    { time: "15:00", visitors: 98, pageviews: 234 },
    { time: "18:00", visitors: 67, pageviews: 145 },
    { time: "21:00", visitors: 45, pageviews: 89 },
    { time: "23:59", visitors: 32, pageviews: 67 },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Site tracking bar */}
      <div className="bg-background border-b border-border max-w-7xl mx-auto w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Site info + Online visitors */}
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors group">
                <Globe className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">
                  vitalisite.com
                </span>
                <Settings className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-secondary">
                    {onlineVisitors}
                  </span>{" "}
                  online visitors
                </span>
              </div>
            </div>

            {/* Filters + Date selector */}
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>

              <div className="h-6 w-px bg-border"></div>

              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" />
                {dateRange}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics overview card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="w-5 h-5 text-primary" />
                Analytics Overview
                <Badge
                  variant="secondary"
                  className="ml-2 bg-secondary/10 text-secondary"
                >
                  Last 7 days
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Metrics grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                {/* Unique Visitors */}
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-3">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {metrics.uniqueVisitors.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Unique Visitors
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <TrendingUp className="w-3 h-3 text-secondary" />
                    <span className="text-secondary">+12.5%</span>
                  </div>
                </div>

                {/* Total Visits */}
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-lg mx-auto mb-3">
                    <Eye className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {metrics.totalVisits.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Total Visits
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <TrendingUp className="w-3 h-3 text-secondary" />
                    <span className="text-secondary">+8.3%</span>
                  </div>
                </div>

                {/* Total Pageviews */}
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-ring/10 rounded-lg mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-ring" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {metrics.totalPageviews.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Total Pageviews
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <TrendingUp className="w-3 h-3 text-secondary" />
                    <span className="text-secondary">+15.7%</span>
                  </div>
                </div>

                {/* Views per Visit */}
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-3">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {metrics.viewsPerVisit}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Views per Visit
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <TrendingUp className="w-3 h-3 text-secondary" />
                    <span className="text-secondary">+3.2%</span>
                  </div>
                </div>

                {/* Bounce Rate */}
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-lg mx-auto mb-3">
                    <TrendingDown className="w-6 h-6 text-destructive" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {metrics.bounceRate}%
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Bounce Rate
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <TrendingDown className="w-3 h-3 text-secondary" />
                    <span className="text-secondary">-2.1%</span>
                  </div>
                </div>

                {/* Visit Duration */}
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-lg mx-auto mb-3">
                    <Clock className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {metrics.visitDuration}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Visit Duration
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <TrendingUp className="w-3 h-3 text-secondary" />
                    <span className="text-secondary">+18.4%</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Traffic Overview
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">Visitors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-secondary rounded-full"></div>
                      <span className="text-muted-foreground">Pageviews</span>
                    </div>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="time"
                        stroke="hsl(var(--foreground))"
                        fontSize={12}
                      />
                      <YAxis stroke="hsl(var(--foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="visitors"
                        stackId="1"
                        stroke="#1f2937"
                        fill="#1f2937"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="pageviews"
                        stackId="2"
                        stroke="#2dd4bf"
                        fill="#2dd4bf"
                        fillOpacity={0.4}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional insights or call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    Unlock Dana AI Insights
                  </h3>
                  <p className="text-muted-foreground">
                    Get AI-powered predictions and automated optimizations.
                    Upgrade to Pro for advanced analytics.
                  </p>
                </div>
                <Button className="bg-secondary hover:bg-ring text-secondary-foreground">
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
