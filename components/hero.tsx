"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight, Play, TrendingUp, Zap } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

export default function Hero({ cta }: { cta?: ReactNode }) {
  const values = [1200, 4500, 3800, 5400, 7200, 9600];
  const chartData = values.map((value, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return {
      month: date.toLocaleString("default", { month: "short" }),
      visitors: value,
    };
  });

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6"
          >
            The lightweight,{" "}
            <span className="bg-gradient-to-r from-primary via-ring to-secondary bg-clip-text text-transparent">
              privacy-first{" "}
            </span>
            alternative to Google Analytics
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            Drop the complexity. Hector Analytics, simple to use and GRPD
            compliant. No cookies needed.
          </motion.p>

          {/* CTA area */}
          {cta ? (
            cta
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                Get started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
              >
                <Play className="mr-2 w-5 h-5" />
                View live demo
              </Button>
            </motion.div>
          )}

          {/* Trust indicators avec les nouvelles couleurs */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-secondary" />
              <span>Quick setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-ring" />
              <span>30 days free</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-secondary" />
              <span>No credit card needed</span>
            </div>
          </motion.div> */}
        </div>

        {/* Hero Image/Dashboard Preview avec les nouvelles couleurs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 sm:mt-20"
        >
          <div className="relative max-w-5xl mx-auto">
            <div className="relative bg-card rounded-xl border border-border shadow-2xl overflow-hidden">
              <div className="aspect-[16/10] bg-gradient-to-br from-muted/50 to-muted/20">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <div className="ml-4 text-sm text-muted-foreground">
                      Hector Analytics Dashboard
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-card p-4 rounded-lg border border-primary/10 shadow-sm">
                        <div className="text-2xl font-bold text-primary">
                          7,892
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Visitors
                        </div>
                        <div className="text-xs text-secondary flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +23% IA boost
                        </div>
                      </div>
                      <div className="bg-card p-4 rounded-lg border border-primary/10 shadow-sm">
                        <div className="text-2xl font-bold text-primary">
                          128,456
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Insights générés
                        </div>
                        <div className="text-xs text-ring flex items-center mt-1">
                          <Zap className="w-3 h-3 mr-1" />
                          Temps réel
                        </div>
                      </div>
                      <div className="bg-card p-4 rounded-lg border border-ring/10 shadow-sm">
                        <div className="text-2xl font-bold text-ring">8.7%</div>
                        <div className="text-sm text-muted-foreground">
                          Taux conversion
                        </div>
                        <div className="text-xs text-secondary flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Prédiction IA
                        </div>
                      </div>
                      <div className="bg-card p-4 rounded-lg border border-primary/10 shadow-sm col-span-3">
                        <ChartContainer
                          config={{
                            visitors: {
                              label: "Visitors",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                        >
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis domain={[0, 10000]} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                              type="monotone"
                              dataKey="visitors"
                              stroke="var(--color-visitors)"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ChartContainer>
                      </div>
                      <div className="bg-card p-4 rounded-lg border border-primary/10 shadow-sm">
                        <div className="text-2xl font-bold text-primary">
                          More data coming soon
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Stay tuned for additional insights
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Éléments décoratifs avec les nouvelles couleurs */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 -right-8 w-16 h-16 bg-ring/10 rounded-full blur-lg"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
