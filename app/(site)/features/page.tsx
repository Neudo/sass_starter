/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Zap,
  Globe,
  BarChart3,
  Users,
  Smartphone,
  Lock,
  Target,
  TrendingUp,
  Filter,
  Download,
  Code,
  Activity,
  Calendar,
  FileText,
  Settings,
  CheckCircle,
} from "lucide-react";
import { FinalCTA } from "@/components/sections/final-cta";

export const metadata: Metadata = {
  title: "Features - Hector Analytics",
  description:
    "Discover all the powerful features of Hector Analytics. Privacy-first web analytics with real-time insights, geographic analysis, and GDPR compliance.",
  keywords: [
    "web analytics features",
    "privacy analytics",
    "GDPR compliant analytics",
    "real-time analytics",
    "website metrics",
    "traffic analysis",
  ],
};

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: Shield,
      title: "Privacy-Respectful Analytics",
      description:
        "Complete privacy protection without compromising on insights. No cookies, no personal data collection, and GDPR compliant by design.",
      details: [
        "No cookies or tracking scripts",
        "GDPR, CCPA, and PECR compliant",
        "Anonymous visitor tracking",
        "Data processed in Europe",
        "No personal data storage",
      ],
      badge: "GDPR Compliant",
    },
    {
      icon: Zap,
      title: "Lightning-Fast Performance",
      description:
        "Ultra-lightweight tracking script that won't impact your site's performance.",
      details: [
        "Less than 2KB script size",
        "CDN-powered delivery",
        "Zero impact on PageSpeed",
        "Asynchronous loading",
      ],
      badge: "< 2KB",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description:
        "Monitor your website traffic as it happens with live data updates and instant metric calculations.",
      details: [
        "Live visitor tracking",
        "Real-time page views",
        "Instant metric updates",
        "Active user monitoring",
        "Live traffic sources",
      ],
      badge: "Live Data",
    },
    {
      icon: Globe,
      title: "Geographic Intelligence",
      description:
        "Understand your global audience with detailed geographic analytics and interactive world maps.",
      details: [
        "Country-level tracking",
        "City-level precision",
        "Interactive world maps",
        "Regional traffic analysis",
        "Timezone-aware reporting",
      ],
      badge: "Global",
    },
    {
      icon: Users,
      title: "Advanced Visitor Analytics",
      description:
        "Track unique visitors, sessions, and user behavior patterns while maintaining complete anonymity.",
      details: [
        "Unique visitor identification",
        "Session duration tracking",
        "Bounce rate calculation",
        "Return visitor analysis",
        "Traffic pattern insights",
      ],
      badge: "Anonymous",
    },
    {
      icon: Smartphone,
      title: "Cross-Device Tracking",
      description:
        "Comprehensive device and platform analytics covering desktop, mobile, and tablet traffic.",
      details: [
        "Device type breakdown",
        "Screen resolution data",
        "Mobile vs desktop insights",
        "Browser compatibility",
        "Operating system analytics",
      ],
      badge: "Multi-Platform",
    },
  ];

  const analyticsFeatures = [
    {
      icon: Globe,
      title: "Traffic Sources Analysis",
      description: "Understand where your visitors come from",
      details: [
        "Direct traffic",
        "Search engines",
        "Social media",
        "Referrals",
      ],
    },
    {
      icon: Target,
      title: "Page Performance Metrics",
      description: "Monitor individual page performance",
      details: ["Page views", "Time on page", "Exit rates", "Entry pages"],
    },
    {
      icon: Activity,
      title: "Custom Event Tracking",
      description:
        "Track specific user actions beyond page views - like button clicks, form submissions, and downloads",
      details: [
        "Track button clicks (CTA, signup, purchase)",
        "Monitor form submissions and completions",
        "Measure file downloads and external links",
        "Create custom conversion goals",
        "Set up event triggers with JavaScript",
        "Analyze event performance over time",
      ],
    },
    {
      icon: Filter,
      title: "Advanced Filtering",
      description: "Drill down into your data",
      details: ["Date ranges", "Traffic sources", "Countries", "Devices"],
    },
    {
      icon: TrendingUp,
      title: "Funnel Analytics",
      description:
        "Track user journeys through multi-step processes like signup, checkout, or onboarding flows",
      details: [
        "Create multi-step conversion funnels",
        "Identify where users drop off in your process",
        "Measure conversion rates at each step",
        "Compare funnel performance over time",
        "Optimize bottlenecks in user journeys",
        "Track goal completions and revenue impact",
      ],
    },
    {
      icon: Calendar,
      title: "Historical Data",
      description: "Access unlimited data history",
      details: [
        "Data retention",
        "Historical comparisons",
        "Trend analysis",
        "Growth tracking",
      ],
    },
  ];

  const integrationFeatures = [
    {
      icon: Code,
      title: "Easy Integration",
      description: "Simple one-line installation",
      details: [
        "Single script tag",
        "No complex setup",
        "Auto-detection",
        "WordPress plugin",
      ],
    },
    {
      icon: Download,
      title: "Data Export",
      description: "Export your analytics data",
      details: [
        "CSV exports",
        "JSON API",
        "Custom reports",
        "Automated exports",
      ],
    },
  ];

  const complianceFeatures = [
    {
      icon: Lock,
      title: "Data Security",
      description: "Secure hosting and data encryption for your analytics data",
      details: [
        "HTTPS data transmission",
        "Encrypted data storage",
        "Secure cloud hosting",
        "Regular security updates",
      ],
    },
    {
      icon: FileText,
      title: "Privacy Compliance",
      description: "Built-in compliance with privacy regulations",
      details: [
        "No personal data collection",
        "No cookies required",
        "GDPR compliant by design",
        "Transparent data practices",
      ],
    },
    {
      icon: Settings,
      title: "Data Control",
      description: "Complete control over your analytics data",
      details: [
        "Data export functionality",
        "Data deletion on request",
        "Configurable data retention",
        "Full data ownership",
      ],
    },
  ];

  const FeatureCard = ({
    feature,
    detailed = false,
  }: {
    feature: any;
    detailed?: boolean;
  }) => (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border-border bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/10">
            <feature.icon className="w-6 h-6 text-primary" />
          </div>
          {feature.badge && (
            <Badge
              variant="outline"
              className="text-xs bg-transparent border-primary/20 text-primary"
            >
              {feature.badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{feature.description}</p>
        {detailed && feature.details && (
          <ul className="space-y-2">
            {feature.details.map((detail: string, index: number) => (
              <li
                key={index}
                className="flex items-center text-sm text-muted-foreground"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3 flex-shrink-0" />
                {detail}
              </li>
            ))}
          </ul>
        )}
        {!detailed && feature.details && (
          <ul className="space-y-1">
            {feature.details
              .slice(0, 4)
              .map((detail: string, index: number) => (
                <li
                  key={index}
                  className="flex items-center text-sm text-muted-foreground"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mr-3 flex-shrink-0" />
                  {detail}
                </li>
              ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge
              variant="secondary"
              className="mb-6 bg-primary/10 text-primary border-primary/20"
            >
              Features
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Complete Feature List
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover everything Hector Analytics offers
            </p>
          </div>
        </section>

        {/* Advanced Features Deep Dive */}
        <section className="py-20 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Understanding Advanced Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Learn how to use funnels and custom events to get deeper
                insights into your user behavior.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Custom Events Explanation */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Activity className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Custom Events</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  Track specific user actions that matter to your business
                  beyond simple page views.
                </p>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Common use cases:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>E-commerce:</strong> Track Add to Cart, Begin
                        Checkout, Purchase Completed
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>SaaS:</strong> Monitor Trial Started, Feature
                        Used, Subscription Upgraded
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Content:</strong> Track Video Played, Newsletter
                        Signup, Article Shared
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Funnels Explanation */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Funnel Analytics</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  Understand your user journey by tracking multi-step processes
                  and identifying where users drop off.
                </p>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">
                    Example: E-commerce Funnel
                  </h4>
                  <div className="bg-card p-6 rounded-lg border space-y-3">
                    <div className="flex items-center justify-between">
                      <span>1. Product Page Visit</span>
                      <Badge variant="outline">100%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>2. Add to Cart</span>
                      <Badge variant="outline">65%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>3. Begin Checkout</span>
                      <Badge variant="outline">45%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>4. Purchase Complete</span>
                      <Badge variant="outline">38%</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">
                    What you can optimize:
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Identify bottlenecks:</strong> See where most
                        users abandon the process
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>A/B test improvements:</strong> Test different
                        checkout flows or CTAs
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Measure impact:</strong> Track how changes
                        affect conversion rates on your website
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Core Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl">
                The foundation of privacy-first analytics with enterprise-grade
                capabilities.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreFeatures.map((feature, index) => (
                <FeatureCard key={index} feature={feature} detailed={true} />
              ))}
            </div>
          </div>
        </section>

        {/* Analytics & Insights */}
        <section className="py-20 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Analytics & Insights
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Deep insights into your website performance and visitor
                behavior.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {analyticsFeatures.map((feature, index) => (
                <FeatureCard key={index} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Integration & Collaboration */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Integration & Collaboration
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Seamlessly integrate with your workflow and collaborate with
                your team.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {integrationFeatures.map((feature, index) => (
                <FeatureCard key={index} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Security & Compliance */}
        <section className="py-20 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Security & Compliance
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Enterprise-grade security and compliance features to protect
                your data and meet regulations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {complianceFeatures.map((feature, index) => (
                <FeatureCard key={index} feature={feature} />
              ))}
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <FinalCTA />
      </div>
    </>
  );
}
