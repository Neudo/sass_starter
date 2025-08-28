"use client";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Activity,
  Shield,
  Zap,
  Globe,
  Users,
  Clock,
  TrendingUp,
  Monitor,
  BarChart,
  MousePointer,
  Smartphone,
  Link2
} from "lucide-react";

export function FeaturesDeepDive() {
  const features = [
    {
      icon: Activity,
      title: "Real-Time Analytics",
      description: "See who's on your site right now. Track page views, sessions, and user flow as it happens.",
      link: "/features/real-time",
      highlight: true
    },
    {
      icon: Shield,
      title: "100% GDPR Compliant",
      description: "No cookies, no personal data storage. Compliant by design, not by configuration.",
      link: "/features/privacy",
      highlight: true
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Under 1KB script size. Won't slow down your site like Google Analytics (45KB+).",
      link: "/features/performance"
    },
    {
      icon: Globe,
      title: "Geographic Insights",
      description: "See where your visitors come from without storing IP addresses.",
      link: "/features/geography"
    },
    {
      icon: Users,
      title: "Audience Analytics",
      description: "Understand your visitors: new vs returning, devices, browsers, and OS.",
      link: "/features/audience"
    },
    {
      icon: Clock,
      title: "Engagement Metrics",
      description: "Track time on page, bounce rate, and scroll depth to understand content performance.",
      link: "/features/engagement"
    },
    {
      icon: TrendingUp,
      title: "Traffic Sources",
      description: "Know where your visitors come from: organic, social, referrals, or direct.",
      link: "/features/traffic-sources"
    },
    {
      icon: MousePointer,
      title: "Custom Events",
      description: "Track button clicks, form submissions, and custom interactions without code.",
      link: "/features/events"
    },
    {
      icon: BarChart,
      title: "UTM Campaign Tracking",
      description: "Measure marketing campaign effectiveness with full UTM parameter support.",
      link: "/features/campaigns"
    },
    {
      icon: Smartphone,
      title: "Device Detection",
      description: "Mobile, tablet, or desktop. Understand how users access your site.",
      link: "/features/devices"
    },
    {
      icon: Link2,
      title: "Outbound Link Tracking",
      description: "See which external links your visitors click without compromising their privacy.",
      link: "/features/links"
    },
    {
      icon: Monitor,
      title: "API & Export",
      description: "Your data, your way. Export to CSV or use our API for custom integrations.",
      link: "/features/api"
    }
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">
              <BarChart className="w-4 h-4 mr-2" />
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need,<br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Nothing You Don't
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful analytics features that respect user privacy. 
              No complex setup, no learning curve, just insights.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Link href={feature.link}>
                <div className={`group h-full p-6 rounded-lg border transition-all hover:shadow-lg hover:border-primary/50 ${
                  feature.highlight ? 'bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20' : 'bg-card'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      feature.highlight ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <feature.icon className={`w-6 h-6 ${
                        feature.highlight ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link href="/features" className="inline-flex items-center text-primary hover:underline">
            Explore all features in detail
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}