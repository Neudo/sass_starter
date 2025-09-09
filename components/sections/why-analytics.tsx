"use client";
import { motion } from "motion/react";
import {
  TrendingUp,
  Target,
  Users,
  Lightbulb,
  BarChart3,
  Search,
  DollarSign,
  Smile,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const benefits = [
  {
    icon: TrendingUp,
    title: "Understand what content works",
    description:
      "See which pages keep visitors engaged and which ones make them leave. Optimize your content based on real data, not guesswork.",
  },
  {
    icon: Target,
    title: "Know where your visitors come from",
    description:
      "Discover which marketing channels bring quality traffic. Double down on what works, cut what doesn't.",
  },
  {
    icon: Users,
    title: "Learn about your audience",
    description:
      "Understand your visitors' behavior, preferences, and journey through your site to create better experiences.",
  },
  {
    icon: DollarSign,
    title: "Make data-driven business decisions",
    description:
      "Stop guessing what your customers want. Use real visitor data to guide your product, content, and marketing strategies.",
  },
  {
    icon: Search,
    title: "Improve your SEO and marketing",
    description:
      "Identify your best-performing content, optimize for search engines, and measure the success of your campaigns.",
  },
  {
    icon: Lightbulb,
    title: "Spot opportunities and problems",
    description:
      "Quickly identify trending content, technical issues, or drops in traffic before they impact your business.",
  },
  {
    icon: Smile,
    title: "No technical knowledge required",
    description:
      "Analytics don't have to be complicated. Get clear, actionable insights without learning complex tools or reading confusing reports.",
    width: "col-span-3 md:p-12",
  },
];

export function WhyAnalytics() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why do you need website analytics?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Understanding your website visitors isn&apos;t just nice to
            have—it&apos;s essential for growing your business. And the best
            part? You don&apos;t need to be a data expert to get actionable
            insights.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`bg-card p-6 rounded-lg border hover:border-primary/20 transition-colors duration-200 ${benefit.width ? benefit.width : "col-span-1"}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-muted/50 rounded-lg p-8 max-w-3xl mx-auto">
            <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">
              The bottom line: Simple analytics, powerful growth
            </h3>
            <p className="text-muted-foreground">
              Whether you&apos;re running a blog, an e-commerce store, or a
              business website, understanding your visitors should be simple and
              straightforward. Get the insights you need without the complexity
              you don&apos;t.
            </p>
            <Link
              href="/auth/sign-up"
              className="mt-4 inline-flex items-center gap-2"
            >
              <Button variant="default">Start collecting data</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
