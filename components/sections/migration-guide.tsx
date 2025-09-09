"use client";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRightLeft, CheckCircle, Upload, Zap } from "lucide-react";

export function MigrationGuide() {
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
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Migration
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Switch from Google Analytics in 5 Minutes
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Keep your historical GA4 data while embracing privacy-first
              analytics. Simple import process, instant setup, zero downtime.
            </p>
          </motion.div>
        </div>

        {/* Simplified Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border p-8 mb-12">
            <div className="flex items-start gap-4 flex-wrap">
              <Upload className="w-8 h-8 text-primary mt-1" />
              <div>
                <h3 className="text-2xl font-semibold mb-4">
                  Import Your Google Analytics Data
                </h3>
                <p className="text-muted-foreground mb-6">
                  Don&apos;t lose your valuable historical data. Export your GA4
                  analytics and import them directly into Hector Analytics. Keep
                  tracking seamlessly with privacy-first technology while
                  maintaining access to all your past insights.
                </p>
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="text-sm">Historical data preserved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="text-sm">Automatic data mapping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="text-sm">No tracking interruption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-medium">Ready to make the switch?</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg">
                Start Migration Now
                <ArrowRightLeft className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Get Migration Help
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
