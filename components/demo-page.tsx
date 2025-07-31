"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Logo } from "./logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  Brain,
  Zap,
  Target,
} from "lucide-react";
import { motion } from "motion/react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DemoPageProps {
  onNavigate: (
    page: "home" | "pricing" | "login" | "signup" | "forgot-password" | "demo"
  ) => void;
}

export function DemoPage({ onNavigate }: DemoPageProps) {
  const [isLive, setIsLive] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [visitors, setVisitors] = useState(47892);
  const [pageviews, setPageviews] = useState(128456);
  const [aiInsights, setAiInsights] = useState(342);

  // Real-time data simulation with AI
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setVisitors((prev) => prev + Math.floor(Math.random() * 5));
      setPageviews((prev) => prev + Math.floor(Math.random() * 8));
      setAiInsights((prev) => prev + Math.floor(Math.random() * 2));
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Chart data with AI predictions
  const trafficData = [
    { date: "01 Jan", visitors: 2200, pageviews: 4800, prediction: 2100 },
    { date: "02 Jan", visitors: 2890, pageviews: 6200, prediction: 2780 },
    { date: "03 Jan", visitors: 3340, pageviews: 7100, prediction: 3200 },
    { date: "04 Jan", visitors: 2856, pageviews: 5200, prediction: 2900 },
    { date: "05 Jan", visitors: 4100, pageviews: 8800, prediction: 4000 },
    { date: "06 Jan", visitors: 4890, pageviews: 10400, prediction: 4750 },
    { date: "07 Jan", visitors: 5200, pageviews: 11200, prediction: 5100 },
    { date: "08 Jan", visitors: 4800, pageviews: 9100, prediction: 4900 },
    { date: "09 Jan", visitors: 6400, pageviews: 13800, prediction: 6200 },
    { date: "10 Jan", visitors: 5967, pageviews: 12890, prediction: 6100 },
    { date: "11 Jan", visitors: 7890, pageviews: 16900, prediction: 7500 },
    { date: "12 Jan", visitors: 8200, pageviews: 18400, prediction: 8000 },
    { date: "13 Jan", visitors: 7567, pageviews: 15100, prediction: 7800 },
    { date: "14 Jan", visitors: 9890, pageviews: 21200, prediction: 9500 },
  ];

  const deviceData = [
    { name: "Desktop", value: 45, color: "#1f2937" },
    { name: "Mobile", value: 38, color: "#2dd4bf" },
    { name: "Tablet", value: 17, color: "#14b8a6" },
  ];

  const aiInsightsData = [
    {
      insight: "Traffic spike predicted tomorrow at 2pm",
      confidence: 94,
      type: "prediction",
    },
    {
      insight: "Conversion +23% on product pages",
      confidence: 87,
      type: "optimization",
    },
    {
      insight: "Anomaly detected: mobile traffic ↑340%",
      confidence: 96,
      type: "anomaly",
    },
    {
      insight: "Recommendation: A/B test homepage",
      confidence: 82,
      type: "recommendation",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Demo header with new branding */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Logo size="lg" showText={false} />
                <div>
                  <h1 className="text-2xl font-bold text-primary">
                    Dana Analytics Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    danaanalytics.com • Integrated artificial intelligence
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className="border-secondary/20 text-secondary bg-secondary/5"
                >
                  {isLive ? (
                    <>
                      <div className="w-2 h-2 bg-secondary rounded-full mr-2 animate-pulse"></div>
                      Live AI
                    </>
                  ) : (
                    "Paused"
                  )}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-ring/20 text-ring bg-ring/5"
                >
                  <Brain className="w-3 h-3 mr-1" />
                  {aiInsights} AI insights generated today
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Predictions updated in real-time
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
                className="border-border hover:bg-primary/5 hover:border-primary/20"
              >
                {isLive ? (
                  <Pause className="w-4 h-4 mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isLive ? "Pause AI" : "Start AI"}
              </Button>
              <Button
                onClick={() => onNavigate("signup")}
                className="bg-secondary hover:bg-ring text-secondary-foreground"
              >
                Join Dana AI
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Period:</span>
            <div className="flex rounded-lg border border-border bg-background p-1">
              {["24h", "7d", "30d", "90d"].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeRange === period
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <Badge
            variant="secondary"
            className="bg-secondary/10 text-secondary border-secondary/20"
          >
            <Zap className="w-3 h-3 mr-1" />
            AI + Real-time Analytics
          </Badge>
        </div>

        {/* Main metrics with AI predictions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-card border-border relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <Badge
                  variant="secondary"
                  className="text-xs bg-secondary/10 text-secondary"
                >
                  AI
                </Badge>
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  AI-analyzed visitors
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {visitors.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center text-secondary">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +23% AI boost
                  </span>{" "}
                  vs prediction
                </p>
                <div className="text-xs text-ring mt-1">
                  Tomorrow prediction: +1,247 visitors
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-card border-border relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <Badge
                  variant="secondary"
                  className="text-xs bg-ring/10 text-ring"
                >
                  Predictive
                </Badge>
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Generated insights
                </CardTitle>
                <Brain className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-secondary">
                  {pageviews.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center text-secondary">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +18.3% AI precision
                  </span>{" "}
                  vs manual
                </p>
                <div className="text-xs text-ring mt-1">
                  AI detects 23 new patterns
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-card border-border relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <Badge
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary"
                >
                  Smart
                </Badge>
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  AI Conversion
                </CardTitle>
                <Target className="h-4 w-4 text-ring" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-ring">8.7%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center text-secondary">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +240% vs baseline
                  </span>{" "}
                  thanks to AI
                </p>
                <div className="text-xs text-ring mt-1">
                  Continuous optimization active
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-card border-border relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <Badge
                  variant="secondary"
                  className="text-xs bg-secondary/10 text-secondary"
                >
                  Live
                </Badge>
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Real-time AI
                </CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">0.3s</div>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center text-secondary">
                    <Zap className="w-3 h-3 mr-1" />
                    Ultra-fast
                  </span>{" "}
                  AI processing
                </p>
                <div className="text-xs text-ring mt-1">
                  {aiInsights} insights generated/h
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Real-time AI insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Real-time AI Insights
                </CardTitle>
                <Badge
                  variant="outline"
                  className="bg-secondary/10 text-secondary border-secondary/20"
                >
                  94% average accuracy
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiInsightsData.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          insight.type === "prediction"
                            ? "bg-secondary/10 text-secondary border-secondary/20"
                            : insight.type === "optimization"
                            ? "bg-ring/10 text-ring border-ring/20"
                            : insight.type === "anomaly"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}
                      >
                        {insight.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{insight.insight}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main chart with AI predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">
                  AI Analytics - Data & Predictions
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">
                      Real data
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">
                      Page views
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-ring rounded-full opacity-60"></div>
                    <span className="text-sm text-muted-foreground">
                      AI predictions
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
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
                    <Line
                      type="monotone"
                      dataKey="prediction"
                      stroke="#14b8a6"
                      strokeDasharray="5 5"
                      strokeOpacity={0.8}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom CTA with new branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                <Logo size="lg" showText={false} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">
                Ready for Dana AI intelligence?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                This demo shows the real capabilities of Dana Analytics with
                integrated AI. Start your data-driven transformation today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => onNavigate("signup")}
                  className="bg-secondary hover:bg-ring text-secondary-foreground"
                >
                  Start with Dana AI
                  <ArrowUpRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate("home")}
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  Back to home
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Integrated AI • 30 days free • 3-minute setup • GDPR compliant
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
