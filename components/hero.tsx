"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import {
  ArrowRight,
  Play,
  Users,
  Activity,
  Globe,
  Shield,
  Zap,
  Gauge,
  TrendingUp,
  Clock,
  Monitor,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function Hero({ cta }: { cta?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="sun text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6"
          >
            Ditch Google Analytics.{" "}
            <span className="bg-gradient-to-r from-primary via-ring to-secondary bg-clip-text text-transparent">
              Embrace Privacy.{" "}
            </span>
            Keep Your Data.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto mb-10"
          >
            The cookieless web analytics platform that respects visitor privacy
            while delivering powerful insights. No technical skills required -
            GDPR compliant by design, 2-minute setup, and under 10KB tracking
            script. Perfect for beginners and pros alike.
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
                Start Free - No Credit Card
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Link href="/demo">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                >
                  <Play className="mr-2 w-5 h-5" />
                  View live demo
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-row flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground mb-8"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-secondary" />
              <span>2-minute setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-ring" />
              <span>100% GDPR compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-secondary" />
              <span>50x lighter than GA4</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Real-time insights</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Image/Dashboard Preview avec les nouvelles couleurs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 sm:mt-20"
        >
          <div className="relative max-w-5xl mx-auto">
            <div className="relative bg-card rounded-sm shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-muted/50 to-muted/20">
                <div className="p-2 md:p-6 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <div className="ml-4 text-sm text-muted-foreground">
                      dashboard.yourdomain.com
                    </div>
                  </div>
                  <div className="space-y-4">
                    {/* Features Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Real-time Visitors */}
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 md:px-6 md:py-8 rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="relative">
                            <Users className="h-5 w-5 text-primary" />
                            <div className="absolute -top-1 -right-1">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-semibold">
                            Real-time Visitors
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          See who&apos;s browsing right now - no cookies
                          required
                        </p>
                      </div>

                      {/* Privacy First */}
                      <div className="bg-card p-4 md:px-4 md:py-8 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <span className="text-sm font-semibold">
                            Privacy First
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Zero cookies, zero personal data collection, 100% GDPR
                          ready
                        </p>
                      </div>

                      {/* Beginner Friendly */}
                      <div className="bg-card p-4 md:px-4 md:py-8 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <span className="text-sm font-semibold">
                            Beginner Friendly
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          No technical knowledge needed - understand your data
                          instantly
                        </p>
                      </div>

                      {/* World Map */}
                      <div className="bg-card p-4 md:px-4 md:py-8 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Globe className="h-5 w-5 text-primary" />
                          <span className="text-sm font-semibold">
                            World Map
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          See where your visitors come from worldwide - privacy
                          intact
                        </p>
                      </div>

                      {/* Lightning Fast */}
                      <div className="bg-card p-4 md:px-4 md:py-8 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Zap className="h-5 w-5 text-primary" />
                          <span className="text-sm font-semibold">
                            Lightning Fast
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          &lt;1KB script (vs 45KB+ for GA)
                        </p>
                      </div>

                      {/* Easy Setup */}
                      <div className="bg-card p-4 md:px-4 md:py-8 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Gauge className="h-5 w-5 text-primary" />
                          <span className="text-sm font-semibold">
                            Easy Setup
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Copy one script tag. Get insights in 2 minutes. Done.
                        </p>
                      </div>

                      {/* Behavior Analytics */}
                      <div className="bg-card p-4 md:px-4 md:py-8 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Activity className="h-5 w-5 text-primary" />
                          <span className="text-sm font-semibold">
                            Behavior Analytics
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Understand user journeys without invading privacy
                        </p>
                      </div>

                      {/* Engagement Metrics */}
                      <div className="bg-card p-4 md:px-4 md:py-8 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <span className="text-sm font-semibold">
                            Engagement Metrics
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Time on page, bounce rate, and content performance
                        </p>
                      </div>

                      {/* Export & API */}
                      <div className="bg-card p-4 md:px-4 md:py-8 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Monitor className="h-5 w-5 text-primary" />
                          <span className="text-sm font-semibold">
                            Export & API
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Own your data - export anytime, integrate anywhere
                        </p>
                      </div>
                    </div>

                    {/* More Features Card */}
                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 md:px-6 md:pt-6 md:pb-10 rounded-lg border border-primary/10 shadow-sm">
                      <div className="flex flex-col items-center gap-2 mb-2 p-4 justify-center">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 md:h-8 md:w-8 text-primary" />
                          <span className="text-xl md:text-3xl text-center font-bold text-primary">
                            Everything You Need
                          </span>
                        </div>
                        <p className="text-sm md:text-base text-muted-foreground text-center mt-2">
                          Referral tracking • UTM campaigns • Device insights •
                          Page views • Custom events and more...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
