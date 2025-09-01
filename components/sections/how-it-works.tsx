"use client";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Code2, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Create Your Free Account",
      description:
        "Sign up in seconds. No credit card required. Start tracking immediately.",
      color: "from-primary/20 to-primary/10",
    },
    {
      number: "02",
      icon: Code2,
      title: "Add One Line of Code",
      description:
        "Copy and paste our lightweight tracking script. Works with any website or framework.",
      color: "from-secondary/20 to-secondary/10",
    },
    {
      number: "03",
      icon: BarChart3,
      title: "Get Real-Time Insights",
      description:
        "Watch your analytics dashboard come alive with privacy-respecting visitor data.",
      color: "from-ring/20 to-ring/10",
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
              <Code2 className="w-4 h-4 mr-2" />
              Simple Setup
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started with privacy-first analytics in under 2 minutes. No
              technical expertise required.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br ${step.color}`}
                >
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <div className="text-5xl font-bold text-muted-foreground/50 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/3 -right-6 text-muted-foreground/30">
                  <ArrowRight className="w-8 h-8" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <Link href="/auth/sign-up">
          <Button size="xl" className="mt-12 md:mt-24 mx-auto block">
            Start collecting data
          </Button>
        </Link>
      </div>
    </section>
  );
}
