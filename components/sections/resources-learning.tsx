"use client";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  Code,
  MessageCircle,
  ArrowRight,
  ExternalLink
} from "lucide-react";

export function ResourcesLearning() {
  const resources = [
    {
      category: "Getting Started",
      items: [
        {
          icon: Video,
          title: "5-Minute Setup Tutorial",
          description: "Watch how to install and configure Hector Analytics",
          type: "Video",
          link: "/learn/setup-tutorial",
          duration: "5 min"
        },
        {
          icon: FileText,
          title: "Installation Guide",
          description: "Step-by-step instructions for all platforms",
          type: "Guide",
          link: "/docs/installation",
          duration: "3 min read"
        },
        {
          icon: Code,
          title: "Code Examples",
          description: "Ready-to-use code snippets for popular frameworks",
          type: "Code",
          link: "/docs/examples",
          duration: "Quick reference"
        }
      ]
    },
    {
      category: "Analytics Fundamentals",
      items: [
        {
          icon: BookOpen,
          title: "Understanding Web Analytics",
          description: "Learn the basics of website tracking and metrics",
          type: "Article",
          link: "/learn/analytics-basics",
          duration: "10 min read"
        },
        {
          icon: FileText,
          title: "Privacy-First Analytics Guide",
          description: "Why cookieless tracking matters and how it works",
          type: "Guide",
          link: "/learn/privacy-first",
          duration: "8 min read"
        },
        {
          icon: Video,
          title: "Reading Your Dashboard",
          description: "Master the Hector Analytics interface",
          type: "Video",
          link: "/learn/dashboard-tour",
          duration: "12 min"
        }
      ]
    },
    {
      category: "Advanced Topics",
      items: [
        {
          icon: Code,
          title: "API Documentation",
          description: "Complete reference for developers",
          type: "Docs",
          link: "/api",
          duration: "Reference"
        },
        {
          icon: FileText,
          title: "Custom Events Tracking",
          description: "Track user interactions beyond page views",
          type: "Tutorial",
          link: "/learn/custom-events",
          duration: "15 min"
        },
        {
          icon: BookOpen,
          title: "E-commerce Analytics",
          description: "Track sales, conversions, and customer behavior",
          type: "Guide",
          link: "/learn/ecommerce",
          duration: "20 min"
        }
      ]
    }
  ];

  const quickLinks = [
    {
      title: "Analytics Glossary",
      description: "Definitions of common analytics terms",
      icon: BookOpen,
      link: "/glossary"
    },
    {
      title: "Best Practices",
      description: "Tips for better data collection and analysis",
      icon: FileText,
      link: "/learn/best-practices"
    },
    {
      title: "Troubleshooting",
      description: "Solutions to common setup and tracking issues",
      icon: MessageCircle,
      link: "/learn/troubleshooting"
    },
    {
      title: "Migration Checklist",
      description: "Complete checklist for switching from other tools",
      icon: FileText,
      link: "/learn/migration-checklist"
    }
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">
              <GraduationCap className="w-4 h-4 mr-2" />
              Learn & Grow
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Master Privacy-First Analytics
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From basic setup to advanced analytics strategies, we've got the resources 
              to help you succeed with Hector Analytics.
            </p>
          </motion.div>
        </div>

        {/* Learning Resources */}
        <div className="space-y-12 mb-16">
          {resources.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-semibold mb-6">{category.category}</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {category.items.map((item, index) => (
                  <Link key={index} href={item.link}>
                    <div className="group h-full bg-card rounded-lg border p-6 hover:shadow-lg hover:border-primary/50 transition-all">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 bg-muted rounded-md">
                              {item.type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.duration}
                            </span>
                          </div>
                          <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-primary group-hover:translate-x-1 transition-transform">
                        Start learning
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-card rounded-lg border p-8"
        >
          <h3 className="text-2xl font-semibold mb-6 text-center">
            Quick Reference
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <Link key={index} href={link.link}>
                <div className="group text-center p-4 rounded-lg border hover:border-primary/50 transition-all">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
                    <link.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {link.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {link.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* External Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border p-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                Need Personalized Help?
              </h3>
              <p className="text-muted-foreground">
                Book a free 1-on-1 session with our analytics experts to get the most out of your data.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/contact">
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Book Expert Call
                  <ExternalLink className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/community">
                <button className="flex items-center gap-2 px-6 py-3 border rounded-lg hover:bg-muted transition-colors">
                  Join Community
                  <MessageCircle className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}