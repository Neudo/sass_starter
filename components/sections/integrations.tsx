"use client";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Plug,
  Globe,
  Code2,
  Webhook,
  FileJson,
  Terminal,
  Layers,
  Zap
} from "lucide-react";

export function Integrations() {
  const integrations = [
    {
      category: "Platforms",
      items: [
        { name: "WordPress", icon: "🔷", status: "Available" },
        { name: "Shopify", icon: "🛍️", status: "Available" },
        { name: "Next.js", icon: "⚡", status: "Available" },
        { name: "React", icon: "⚛️", status: "Available" },
        { name: "Vue.js", icon: "💚", status: "Available" },
        { name: "Angular", icon: "🅰️", status: "Available" }
      ]
    },
    {
      category: "CMS",
      items: [
        { name: "Ghost", icon: "👻", status: "Available" },
        { name: "Webflow", icon: "🎨", status: "Available" },
        { name: "Strapi", icon: "🚀", status: "Coming Soon" },
        { name: "Contentful", icon: "📝", status: "Coming Soon" }
      ]
    },
    {
      category: "Tools",
      items: [
        { name: "Slack", icon: "💬", status: "Available" },
        { name: "Zapier", icon: "⚡", status: "Coming Soon" },
        { name: "Make", icon: "🔄", status: "Coming Soon" },
        { name: "n8n", icon: "🔗", status: "Available" }
      ]
    }
  ];

  const features = [
    {
      icon: Webhook,
      title: "Webhooks",
      description: "Real-time event notifications to your systems"
    },
    {
      icon: FileJson,
      title: "REST API",
      description: "Full API access to all your analytics data"
    },
    {
      icon: Terminal,
      title: "NPM Package",
      description: "JavaScript SDK for custom implementations"
    },
    {
      icon: Code2,
      title: "Embed Anywhere",
      description: "Simple script tag works on any website"
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
              <Plug className="w-4 h-4 mr-2" />
              Integrations
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Works With Your Stack
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Seamlessly integrate Hector Analytics with your favorite tools and platforms. 
              One line of code, endless possibilities.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-8">Popular Integrations</h3>
            <div className="space-y-8">
              {integrations.map((category, idx) => (
                <div key={idx}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-4">
                    {category.category}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {category.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center justify-between p-3 bg-card rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        {item.status === "Coming Soon" && (
                          <span className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
                            Soon
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-8">Developer Friendly</h3>
            <div className="space-y-4">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 bg-card rounded-lg border"
                >
                  <div className="p-2 rounded-lg bg-primary/10 h-fit">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Quick Start</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get started in seconds with our NPM package:
                  </p>
                  <div className="bg-muted rounded-md p-3 font-mono text-sm">
                    npm install @hector/analytics
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-card rounded-lg border p-8 text-center"
        >
          <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-4">
            Universal Compatibility
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Works with any website, framework, or platform. If you can add a script tag, 
            you can use Hector Analytics. No dependencies, no conflicts, just insights.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/docs" className="text-primary hover:underline">
              View Documentation →
            </Link>
            <Link href="/integrations" className="text-primary hover:underline">
              Browse All Integrations →
            </Link>
            <Link href="/api" className="text-primary hover:underline">
              API Reference →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}