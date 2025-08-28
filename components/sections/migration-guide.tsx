"use client";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ArrowRightLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Upload,
  Shield,
  Zap
} from "lucide-react";

export function MigrationGuide() {
  const steps = [
    {
      step: "01",
      title: "Export Your Historical Data",
      description: "Download your existing analytics data from Google Analytics (optional but recommended)",
      time: "2 minutes",
      icon: Download
    },
    {
      step: "02",
      title: "Add Hector Analytics Script",
      description: "Replace your GA tracking code with our lightweight script",
      time: "1 minute",
      icon: Upload
    },
    {
      step: "03",
      title: "Verify Data Collection",
      description: "Check your Hector dashboard to confirm data is flowing correctly",
      time: "30 seconds",
      icon: CheckCircle
    },
    {
      step: "04",
      title: "Remove Old Tracking",
      description: "Clean up your Google Analytics code and cookie banners",
      time: "1 minute",
      icon: Shield
    }
  ];

  const benefits = [
    {
      title: "No Data Loss",
      description: "Keep your historical data while starting fresh with privacy-first tracking"
    },
    {
      title: "Instant Insights",
      description: "Start seeing data immediately - no waiting period or configuration"
    },
    {
      title: "Improved Performance",
      description: "Your site loads faster without heavy Google Analytics scripts"
    },
    {
      title: "GDPR Compliance",
      description: "Automatically compliant - no more cookie banner maintenance"
    }
  ];

  const comparison = [
    {
      aspect: "Setup Time",
      ga: "Hours of configuration",
      hector: "2 minutes total",
      better: true
    },
    {
      aspect: "Script Size",
      ga: "45KB+ (heavy)",
      hector: "<1KB (ultra-light)",
      better: true
    },
    {
      aspect: "Cookie Banners",
      ga: "Required by law",
      hector: "None needed",
      better: true
    },
    {
      aspect: "Data Accuracy",
      ga: "Lost to ad blockers",
      hector: "100% captured",
      better: true
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
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Migration
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Switch from Google Analytics in 5 Minutes
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Migrate to privacy-first analytics without losing data or insights. 
              Our simple migration process gets you up and running instantly.
            </p>
          </motion.div>
        </div>

        {/* Migration Steps */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-8">
              Simple Migration Process
            </h3>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-primary">
                        Step {step.step}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {step.time}
                      </div>
                    </div>
                    <h4 className="font-semibold mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:pl-8"
          >
            <h3 className="text-2xl font-semibold mb-8">
              Why Make the Switch?
            </h3>
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Migration Support</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Need help with your migration? Our team provides free migration 
                assistance for all new customers.
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  Get Migration Help
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-card rounded-lg border overflow-hidden mb-12"
        >
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-center">
              Before vs After Migration
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-4 text-left font-medium">Aspect</th>
                  <th className="p-4 text-center font-medium">Google Analytics</th>
                  <th className="p-4 text-center font-medium">Hector Analytics</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4 font-medium">{item.aspect}</td>
                    <td className="p-4 text-center text-muted-foreground">
                      {item.ga}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium text-primary">
                          {item.hector}
                        </span>
                        {item.better && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-medium">Ready to migrate?</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg">
                Start Your Migration
                <ArrowRightLeft className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/migrate-from-ga">
              <Button variant="outline" size="lg">
                View Full Guide
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}