"use client";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Target,
  FileText,
  ShoppingCart,
  Briefcase,
  Newspaper,
  GraduationCap,
  Heart,
  Code,
  ArrowRight,
} from "lucide-react";

export function UseCases() {
  const cases = [
    {
      icon: FileText,
      title: "Bloggers & Content Creators",
      description:
        "Track which content resonates with your audience. See reading time, popular posts, and traffic sources.",
      features: ["Content performance", "Reader engagement", "Social traffic"],
      link: "/use-cases/bloggers",
    },
    {
      icon: ShoppingCart,
      title: "E-commerce Stores",
      description:
        "Monitor product views, conversion paths, and checkout analytics without compromising customer privacy.",
      features: [
        "Conversion tracking",
        "Product analytics",
        "Cart abandonment",
      ],
      link: "/use-cases/ecommerce",
    },
    {
      icon: Briefcase,
      title: "B2B & SaaS Companies",
      description:
        "Understand your funnel, track feature usage, and measure campaign effectiveness with privacy in mind.",
      features: ["Funnel analytics", "Campaign ROI", "Lead tracking"],
      link: "/use-cases/b2b",
    },
    {
      icon: Newspaper,
      title: "News & Media Sites",
      description:
        "Real-time visitor tracking, article performance, and reader demographics without invasive tracking.",
      features: ["Real-time stats", "Article metrics", "Reader loyalty"],
      link: "/use-cases/media",
    },
    {
      icon: GraduationCap,
      title: "Educational Platforms",
      description:
        "Track course engagement, student progress, and resource usage while respecting student privacy.",
      features: ["Course analytics", "Resource tracking", "Student privacy"],
      link: "/use-cases/education",
    },
    {
      icon: Heart,
      title: "Non-Profits & NGOs",
      description:
        "Measure campaign impact, donation funnel, and volunteer engagement ethically.",
      features: ["Campaign impact", "Donor journey", "Volunteer tracking"],
      link: "/use-cases/nonprofit",
    },
    {
      icon: Code,
      title: "Developer Tools & APIs",
      description:
        "Track API usage, documentation views, and developer engagement without cookies.",
      features: ["API analytics", "Docs engagement", "Developer metrics"],
      link: "/use-cases/developers",
    },
  ];

  return (
    <section className="py-24 bg-muted dark:bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">
              <Target className="w-4 h-4 mr-2" />
              Use Cases
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Built for Every Website
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you&apos;re running a blog, an online store, or a SaaS
              platform, Hector Analytics provides the insights you need while
              respecting user privacy.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.slice(0, 6).map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <div className="group h-full bg-card rounded-lg border p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <useCase.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {useCase.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {useCase.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-muted rounded-md"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border p-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                Have a Different Use Case?
              </h3>
              <p className="text-muted-foreground">
                Hector Analytics is flexible and adapts to your needs. Let&apos;s
                discuss how we can help.
              </p>
            </div>
            <Link href="/contact">
              <Button variant="default" size="lg">
                Tell us about your project
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { Button } from "@/components/ui/button";
