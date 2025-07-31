"use client";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Shield,
  Zap,
  Globe,
  BarChart3,
  Users,
  Clock,
  Smartphone,
  Eye,
  Lock,
} from "lucide-react";
import { motion } from "motion/react";

export function Features() {
  const features = [
    {
      icon: Shield,
      title: "Privacy-respectful",
      description:
        "No cookies, no personal tracking. GDPR compliant by default.",
      badge: "GDPR",
      color: "primary",
    },
    {
      icon: Zap,
      title: "Ultra fast",
      description:
        "Less than 2KB script that doesn't impact your site's performance.",
      badge: "Performance",
      color: "secondary",
    },
    {
      icon: BarChart3,
      title: "Real-time insights",
      description: "Visualize your data instantly with interactive charts.",
      badge: "Live",
      color: "primary",
    },
    {
      icon: Globe,
      title: "Geographic analysis",
      description: "Discover where your visitors come from with detailed maps.",
      badge: "Geo",
      color: "secondary",
    },
    {
      icon: Users,
      title: "Unique visitors",
      description:
        "Track your unique visitors without compromising their anonymity.",
      badge: "Anonymous",
      color: "primary",
    },
    {
      icon: Smartphone,
      title: "Multi-platform",
      description: "Desktop, mobile, tablet - analyze all types of traffic.",
      badge: "Cross-device",
      color: "secondary",
    },
    {
      icon: Eye,
      title: "Intuitive interface",
      description: "Simple and elegant dashboard, no training required.",
      badge: "Simple",
      color: "primary",
    },
    {
      icon: Lock,
      title: "Secure data",
      description: "Your data is encrypted and stored in Europe.",
      badge: "Secure",
      color: "secondary",
    },
    {
      icon: Clock,
      title: "Unlimited history",
      description: "Keep your data as long as you want.",
      badge: "Unlimited",
      color: "primary",
    },
  ];

  return (
    <section className="py-24 bg-muted/20 theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge
              variant="secondary"
              className="mb-4 bg-secondary/10 text-secondary border-secondary/20"
            >
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              Everything you need
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Dana Analytics gives you all the tools you need to understand your
              audience without compromising on simplicity.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-border bg-card/50 backdrop-blur theme-transition">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center theme-transition ${
                        feature.color === "primary"
                          ? "bg-primary/10"
                          : "bg-secondary/10"
                      }`}
                    >
                      <feature.icon
                        className={`w-6 h-6 ${
                          feature.color === "primary"
                            ? "text-primary"
                            : "text-secondary"
                        }`}
                      />
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs bg-transparent ${
                        feature.color === "primary"
                          ? "border-primary/20 text-primary"
                          : "border-secondary/20 text-secondary"
                      }`}
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-2xl p-8 sm:p-12 border border-border/50 theme-transition">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
              Over 30 detailed metrics
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Page views, sessions, bounce rate, traffic sources, devices,
              browsers, countries, and much more.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Page views",
                "Sessions",
                "Unique visitors",
                "Bounce rate",
                "Session duration",
                "Traffic sources",
                "Devices",
                "Browsers",
                "Operating systems",
                "Countries",
                "Cities",
                "Languages",
              ].map((metric, index) => (
                <Badge
                  key={metric}
                  variant="outline"
                  className={`text-sm bg-transparent ${
                    index % 2 === 0
                      ? "bg-primary/5 text-primary border-primary/20"
                      : "bg-secondary/5 text-secondary border-secondary/20"
                  }`}
                >
                  {metric}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
