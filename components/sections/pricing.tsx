"use client";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  CreditCard,
  Check,
  Sparkles,
  TrendingUp,
  Building2,
  ArrowRight
} from "lucide-react";

export function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for personal projects and small websites",
      icon: Sparkles,
      features: [
        "Up to 10,000 page views/month",
        "Unlimited websites",
        "Real-time analytics",
        "Privacy-compliant tracking",
        "Basic geographic data",
        "7 days data retention",
        "Community support"
      ],
      cta: "Start Free",
      href: "/auth/sign-up",
      popular: false
    },
    {
      name: "Pro",
      price: "9",
      description: "For growing businesses and content creators",
      icon: TrendingUp,
      features: [
        "Up to 100,000 page views/month",
        "Everything in Free",
        "Custom events tracking",
        "Advanced geographic data",
        "1 year data retention",
        "API access",
        "Priority email support",
        "CSV exports"
      ],
      cta: "Start Free Trial",
      href: "/auth/sign-up",
      popular: true
    },
    {
      name: "Business",
      price: "29",
      description: "For high-traffic sites and teams",
      icon: Building2,
      features: [
        "Up to 1,000,000 page views/month",
        "Everything in Pro",
        "Team collaboration",
        "Custom domains",
        "Unlimited data retention",
        "Advanced API access",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee"
      ],
      cta: "Contact Sales",
      href: "/contact",
      popular: false
    }
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
              <CreditCard className="w-4 h-4 mr-2" />
              Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need to. No credit card required.
              Cancel anytime.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <div className={`h-full rounded-lg ${
                plan.popular 
                  ? 'border-2 border-primary shadow-lg' 
                  : 'border'
              } bg-card p-8`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    plan.popular ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <plan.icon className={`w-6 h-6 ${
                      plan.popular ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                </div>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  {plan.description}
                </p>
                
                <Link href={plan.href}>
                  <Button 
                    className={`w-full mb-6 ${
                      plan.popular 
                        ? 'bg-primary hover:bg-primary/90' 
                        : ''
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Need more than 1M page views? Have specific requirements?
          </p>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Contact us for Enterprise pricing
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 grid md:grid-cols-3 gap-6 text-center"
        >
          <div className="p-4">
            <p className="text-2xl font-bold text-primary mb-2">30 days</p>
            <p className="text-sm text-muted-foreground">Free trial on all paid plans</p>
          </div>
          <div className="p-4">
            <p className="text-2xl font-bold text-primary mb-2">No setup fees</p>
            <p className="text-sm text-muted-foreground">Start tracking in minutes</p>
          </div>
          <div className="p-4">
            <p className="text-2xl font-bold text-primary mb-2">Cancel anytime</p>
            <p className="text-sm text-muted-foreground">No questions asked</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}