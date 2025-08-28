"use client";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ArrowRight,
  Users,
  TrendingUp,
  Shield,
  Clock,
  Play,
  CheckCircle
} from "lucide-react";

export function FinalCTA() {
  const stats = [
    { icon: Users, number: "1,000+", label: "websites trust us" },
    { icon: TrendingUp, number: "50M+", label: "events tracked monthly" },
    { icon: Shield, number: "100%", label: "privacy compliant" },
    { icon: Clock, number: "< 2min", label: "setup time" }
  ];

  const features = [
    "Free forever plan",
    "No credit card required",
    "2-minute setup",
    "GDPR compliant by design",
    "Cancel anytime",
    "Expert support included"
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Ditch Google Analytics?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join thousands of websites that have made the switch to privacy-first analytics. 
            Start tracking your visitors without compromising their privacy or your site's performance.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl border shadow-lg p-8 lg:p-12 max-w-4xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Everything You Need to Get Started
              </h3>
              <div className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center lg:text-left">
              <div className="mb-8">
                <div className="text-4xl font-bold mb-2">Start Free Today</div>
                <div className="text-muted-foreground">
                  No credit card • No setup fees • No surprises
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth/sign-up">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Create Free Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/hectoranalytics.com" target="_blank">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-6"
                  >
                    <Play className="mr-2 w-5 h-5" />
                    View Live Demo
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                Join 1,000+ websites already using Hector Analytics
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Expert Support</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Real-time Data</span>
            </div>
          </div>
          
          <div className="mt-8 text-xs text-muted-foreground">
            Questions? <Link href="/contact" className="text-primary hover:underline">Contact our team</Link> • 
            <Link href="/faq" className="text-primary hover:underline ml-2">View FAQ</Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}