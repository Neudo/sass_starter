"use client";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

interface PricingSectionProps {
  showFullPage?: boolean;
}

export function PricingSection({ showFullPage = false }: PricingSectionProps) {
  const router = useRouter();
  const onNavigateToPricing = () => router.push("/pricing");
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small websites",
      monthlyPrice: 9,
      yearlyPrice: 90, // 20% discount
      features: [
        "Up to 10,000 page views/month",
        "1 website",
        "Real-time data",
        "Basic reports",
        "Email support",
        "GDPR compliant",
      ],
      cta: "Start free trial",
      popular: false,
      color: "secondary",
    },
    {
      name: "Pro",
      description: "For growing businesses",
      monthlyPrice: 14,
      yearlyPrice: 140, // 20% discount
      features: [
        "Up to 100,000 page views/month",
        "3 websites",
        "Real-time data",
        "Advanced reports",
        "Export API",
        "Priority support",
        "Custom dashboards",
        "Custom alerts",
      ],
      cta: "Start free trial",
      popular: true,
      color: "primary",
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      monthlyPrice: 24,
      yearlyPrice: 240, // 20% discount
      features: [
        "Unlimited page views",
        "Unlimited websites",
        "Real-time data",
        "All reports",
        "Complete API",
        "Dedicated support",
        "On-premise installation",
        "Guaranteed SLA",
        "Custom training",
        "Custom integrations",
      ],
      cta: "Start free trial",
      popular: false,
      color: "secondary",
    },
  ];

  return (
    <section className={`${showFullPage ? "py-24" : "py-16"} bg-background`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Badge
              variant="secondary"
              className="mb-4 bg-primary/10 text-primary border-primary/20"
            >
              Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Transparent and affordable
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Start free with 30 days trial on all plans. No commitment, cancel
              anytime.
            </p>

            {/* Annual/Monthly toggle */}
            <div className="flex items-center justify-center gap-4 mb-2">
              <span
                className={`text-xl ${
                  !isYearly
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                Monthly
              </span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <span
                className={`text-xl ${
                  isYearly
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                Annual{" "}
                <span className="text-muted-foreground text-md italic">
                  (20% discount)
                </span>
              </span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className={`relative h-full ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105 ring-2 ring-primary/20"
                    : plan.color === "secondary"
                    ? "border-secondary/30 hover:border-secondary/50 transition-colors"
                    : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                  <p className="text-muted-foreground mb-4">
                    {plan.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-center gap-1">
                      <span
                        className={`text-4xl font-bold ${
                          plan.color === "primary"
                            ? "text-primary"
                            : "text-secondary"
                        }`}
                      >
                        $
                        {isYearly
                          ? Math.round(plan.yearlyPrice / 12)
                          : plan.monthlyPrice}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {isYearly && (
                      <div className="text-sm text-muted-foreground">
                        <span className="line-through">
                          ${plan.monthlyPrice}/month
                        </span>
                        <span className="text-green-600 ml-2 font-medium">
                          -20%
                        </span>
                      </div>
                    )}
                    {isYearly && (
                      <p className="text-sm text-muted-foreground">
                        Billed ${plan.yearlyPrice} annually
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? ""
                        : plan.color === "secondary"
                        ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                        : "variant-outline border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    }`}
                    variant={
                      plan.popular
                        ? "default"
                        : plan.color === "secondary"
                        ? "default"
                        : "outline"
                    }
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          plan.color === "primary"
                            ? "text-primary"
                            : "text-secondary"
                        }`}
                      />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter></CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {!showFullPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={onNavigateToPricing}
              className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              View all pricing details
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16 space-y-4"
        >
          <h3 className="text-xl font-semibold">Frequently Asked Questions</h3>
          <div className="max-w-2xl mx-auto text-muted-foreground space-y-2">
            <p>✅ Cancel anytime</p>
            <p>✅ No hidden fees</p>
            <p>✅ Free migration from Google Analytics</p>
            <p>✅ Responsive customer support</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
