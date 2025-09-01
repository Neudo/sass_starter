"use client";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  AlertTriangle,
  Ban,
  TrendingDown,
  Lock,
  Eye,
  Users,
  Globe,
} from "lucide-react";

export function WhyPrivacyMatters() {
  const reasons = [
    {
      icon: Ban,
      title: "Ad Blockers Everywhere",
      description:
        "Nearly half of users run ad blockers - your Google Analytics data is incomplete",
      color: "text-destructive",
    },
    {
      icon: TrendingDown,
      title: "Users Reject Cookies",
      description:
        'Most users hit "Reject All" on cookie banners - goodbye tracking accuracy',
      color: "text-orange-500",
    },
    {
      icon: AlertTriangle,
      title: "GDPR Gets Stricter",
      description:
        "Google Analytics is already banned in several EU countries for privacy violations (Australia, France, Italy, Sweden ...)",
      color: "text-yellow-500",
    },
    {
      icon: Users,
      title: "Users Want Privacy",
      description:
        "Privacy-focused alternatives are growing 300% year-over-year",
      color: "text-primary",
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "No Personal Data Collection",
      description:
        "We don't store IP addresses, fingerprints, or any personally identifiable information.",
    },
    {
      icon: Lock,
      title: "No Cookie Banners Required",
      description:
        "Since we don't use cookies, you don't need annoying consent popups.",
    },
    {
      icon: Eye,
      title: "100% Data Visibility",
      description: "No sampling. Track every visitor without privacy concerns.",
    },
    {
      icon: Globe,
      title: "Global Compliance",
      description:
        "GDPR, CCPA, PECR, and other privacy laws - we've got you covered.",
    },
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
              <Shield className="w-4 h-4 mr-2" />
              Privacy First
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Why Privacy-First Analytics?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The web is changing. Users demand privacy, regulations require it,
              and traditional analytics tools are becoming obsolete.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg border p-6 text-center"
            >
              <div className="inline-flex p-3 rounded-full bg-muted mb-4">
                <reason.icon className={`w-6 h-6 ${reason.color}`} />
              </div>
              <h3 className="font-semibold mb-2">{reason.title}</h3>
              <p className="text-sm text-muted-foreground">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg  p-12 mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            The Hector Analytics Difference
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="bg-card rounded-lg border p-8"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Privacy Is Not Just Compliance, It&apos;s Good Business
            </h3>
            <p className="text-muted-foreground mb-6">
              When you respect user privacy, you build trust. When you build
              trust, users engage more. Better engagement means better business
              outcomes.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
