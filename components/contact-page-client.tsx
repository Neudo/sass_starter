"use client";

import { Navigation } from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { motion } from "motion/react";
import Footer from "@/components/footer";

export default function ContactPageClient() {
  return (
    <div className="min-h-screen bg-background text-foreground theme-transition">
      <Navigation />
      <section className=" min-h-[calc(100vh-16rem)] flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              We&apos;re here to help
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
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}