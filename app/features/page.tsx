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
  Database,
  Filter,
  Download,
  Share2,
  Bell,
  Palette,
  Code,
  Activity,
  Map,
  Calendar,
  FileText,
  Settings,
} from "lucide-react";
import { FinalCTA } from "@/components/sections/final-cta";
import { Navigation } from "@/components/navigation";
import Footer from "@/components/footer";

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
        "Ultra-lightweight tracking script that won\t impact your site\s performance. Load times under 50ms guaranteed.",
      details: [
        "Less than 2KB script size",
        "Sub-50ms load times",
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
      icon: TrendingUp,
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
      description: "Track specific user interactions",
      details: [
        "Button clicks",
        "Form submissions",
        "Downloads",
        "Custom goals",
      ],
    },
    {
      icon: Filter,
      title: "Advanced Filtering",
      description: "Drill down into your data",
      details: ["Date ranges", "Traffic sources", "Countries", "Devices"],
    },
    {
      icon: Map,
      title: "Heatmap Analytics",
      description: "Visual representation of user behavior",
      details: [
        "Click patterns",
        "Scroll depth",
        "Interaction zones",
        "Hot spots",
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
    {
      icon: Share2,
      title: "Team Collaboration",
      description: "Share insights with your team",
      details: [
        "Multiple users",
        "Role-based access",
        "Shared dashboards",
        "Team reports",
      ],
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Stay informed about important changes",
      details: [
        "Traffic alerts",
        "Goal notifications",
        "Weekly reports",
        "Custom alerts",
      ],
    },
    {
      icon: Palette,
      title: "Customizable Dashboard",
      description: "Tailor the interface to your needs",
      details: [
        "Custom widgets",
        "Drag & drop",
        "Personal layouts",
        "Theme options",
      ],
    },
    {
      icon: Database,
      title: "API Access",
      description: "Programmatic access to your data",
      details: [
        "REST API",
        "Webhooks",
        "Real-time data",
        "Custom integrations",
      ],
    },
  ];

  const complianceFeatures = [
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Bank-level security for your data",
      details: [
        "End-to-end encryption",
        "SOC 2 compliance",
        "Regular audits",
        "Secure hosting",
      ],
    },
    {
      icon: FileText,
      title: "Compliance Reports",
      description: "Automated compliance documentation",
      details: [
        "GDPR reports",
        "Data processing logs",
        "Audit trails",
        "Compliance certificates",
      ],
    },
    {
      icon: Settings,
      title: "Data Control",
      description: "Complete control over your data",
      details: [
        "Data deletion",
        "Export controls",
        "Retention settings",
        "Access management",
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
      <Navigation />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge
              variant="secondary"
              className="mb-6 bg-primary/10 text-primary border-primary/20"
            >
              Complete Feature List
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Powerful Analytics Features
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover everything Hector Analytics offers - from privacy-first
              tracking to advanced insights, all designed to help you understand
              your audience without compromising their privacy.
            </p>
          </div>
        </section>

        {/* Core Features */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Core Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
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
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Analytics & Insights
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
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
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Integration & Collaboration
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
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
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                Security & Compliance
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
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

        {/* All Metrics */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                30+ Detailed Metrics
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Track every aspect of your website performance with
                comprehensive analytics.
              </p>
            </div>
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-8 sm:p-12 border border-border/50">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  "Page Views",
                  "Unique Visitors",
                  "Sessions",
                  "Bounce Rate",
                  "Session Duration",
                  "Traffic Sources",
                  "Referrers",
                  "Search Terms",
                  "Countries",
                  "Cities",
                  "Languages",
                  "Time Zones",
                  "Devices",
                  "Browsers",
                  "Operating Systems",
                  "Screen Resolutions",
                  "Entry Pages",
                  "Exit Pages",
                  "Top Content",
                  "Download Tracking",
                  "External Links",
                  "Custom Events",
                  "Goal Conversions",
                  "Funnel Analysis",
                  "Real-time Visitors",
                  "Historical Trends",
                  "Growth Metrics",
                  "Engagement Rate",
                  "New vs Returning",
                  "Mobile vs Desktop",
                  "Peak Hours",
                  "Seasonal Patterns",
                ].map((metric, index) => (
                  <Badge
                    key={metric}
                    variant="outline"
                    className={`text-sm bg-transparent justify-center py-2 ${
                      index % 3 === 0
                        ? "bg-primary/5 text-primary border-primary/20"
                        : index % 3 === 1
                          ? "bg-secondary/5 text-secondary border-secondary/20"
                          : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {metric}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
}
