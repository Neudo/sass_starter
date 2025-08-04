"use client";

import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { motion } from "motion/react";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground theme-transition">
      <Navigation />
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              We’re here to help
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Any questions? Contact us at{" "}
              <a
                href="mailto:support@hectoranalytics.com"
                className="text-primary underline"
              >
                support@hectoranalytics.com
              </a>
              .
            </p>
            <p className="text-xl text-muted-foreground">
              Any suggestions? Don’t hesitate to send us your ideas—we value your feedback.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

